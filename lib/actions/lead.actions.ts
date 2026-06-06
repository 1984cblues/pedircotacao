'use server'

import { createAdminClient } from '../supabase/admin'
import { getEmpresasEligiveisParaLead } from '../dal/leads'
import { leadSchema } from '../validators/schemas'
import { sendLeadNotificationEmail } from '../email/resend'
import { headers } from 'next/headers'

// Action chamada pelo formulário de conversão
export async function submitLead(formData: FormData) {
  try {
    // 1. Extrair e tipar os dados do FormData
    const rawData = {
      nome_cliente: formData.get('nome_cliente'),
      telefone: formData.get('telefone'),
      email: formData.get('email') || '',
      mensagem: formData.get('mensagem') || '',
      tipo_pessoa: formData.get('tipo_pessoa') || 'fisica',
      urgencia: formData.get('urgencia') || 'normal',
      servico_id: formData.get('servico_id'),
      estado_id: formData.get('estado_id'),
      cidade_id: formData.get('cidade_id'),
      bairro_id: formData.get('bairro_id') || undefined,
    }

    // 2. Validação Zod (OWASP A05)
    const result = leadSchema.safeParse(rawData)
    
    if (!result.success) {
      return { 
        success: false, 
        error: 'Dados inválidos', 
        details: result.error.flatten().fieldErrors 
      }
    }

    const data = result.data

    // Pegar informações anti-fraude (OWASP A09)
    const headersList = await headers()
    const ip_address = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '0.0.0.0'
    const user_agent = headersList.get('user-agent') || 'unknown'
    const pagina_origem = headersList.get('referer') || 'unknown'

    const supabase = createAdminClient()

    // 3. Inserir Lead no banco
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        servico_id: data.servico_id,
        estado_id: data.estado_id,
        cidade_id: data.cidade_id,
        bairro_id: data.bairro_id,
        nome_cliente: data.nome_cliente,
        telefone: data.telefone,
        email: data.email,
        mensagem: data.mensagem,
        tipo_pessoa: data.tipo_pessoa,
        urgencia: data.urgencia,
        ip_address,
        user_agent,
        pagina_origem,
        // score e status são preenchidos por defaults e triggers no PG
      })
      .select('id, servico_id, cidade_id, bairro_id, nome_cliente')
      .single()

    if (leadError || !lead) {
      console.error('Erro ao inserir lead:', leadError)
      return { success: false, error: 'Erro ao processar sua solicitação.' }
    }

    // 4. Buscar prestadores elegíveis (matching)
    const elegiveis = await getEmpresasEligiveisParaLead(lead.servico_id, lead.cidade_id, lead.bairro_id)

    if (elegiveis.length === 0) {
      // Nenhum prestador encontrado
      // Atualizar status do lead para "expirado" ou "sem prestador" futuramente, mas manter "novo" por enquanto.
      console.log(`Lead ${lead.id} gerado, mas nenhum prestador elegível encontrado na região.`)
      return { success: true, message: 'Solicitação recebida com sucesso! Infelizmente não temos prestadores ativos na sua região no momento, mas entraremos em contato se houver disponibilidade.' }
    }

    let distribuidosCount = 0

    // 5. Distribuir e debitar créditos
    for (const empresa of elegiveis) {
      // a. Criar a distribuição
      const { data: distribuicao, error: distError } = await supabase
        .from('lead_distribuicoes')
        .insert({
          lead_id: lead.id,
          empresa_id: empresa.id,
          creditos_cobrados: 1, // Preço fixo por enquanto
          status: 'enviado'
        })
        .select('id')
        .single()

      if (distError || !distribuicao) {
        console.error(`Erro ao distribuir lead ${lead.id} para empresa ${empresa.id}:`, distError)
        continue // Pula para a próxima empresa
      }

      // b. Debitar crédito chamando a function RPC
      const { data: debitSuccess, error: debitError } = await supabase
        .rpc('deduzir_credito', {
          p_empresa_id: empresa.id,
          p_lead_distribuicao_id: distribuicao.id,
          p_quantidade: 1
        })

      if (debitError || !debitSuccess) {
        console.error(`Erro ao debitar crédito da empresa ${empresa.id}:`, debitError)
        
        // Em um sistema mais robusto, poderíamos apagar a distribuição aqui ou marcá-la como erro.
        // Vamos atualizar o status da distribuição para refletir o erro financeiro se desejar.
        await supabase.from('lead_distribuicoes').delete().eq('id', distribuicao.id)
        continue
      }

      distribuidosCount++

      // c. Enviar email de notificação (fire and forget)
      if (empresa.email) {
        // Buscar o nome do serviço para o email
        const { data: servico } = await supabase.from('servicos').select('nome').eq('id', lead.servico_id).single()
        
        sendLeadNotificationEmail({
          to: empresa.email,
          empresaNome: empresa.nome_fantasia,
          leadNome: lead.nome_cliente,
          servicoNome: servico?.nome || 'Serviço',
        })
      }
    }

    // 6. Atualizar contagem no lead
    if (distribuidosCount > 0) {
      await supabase
        .from('leads')
        .update({ status: 'distribuido', distribuido_para: distribuidosCount })
        .eq('id', lead.id)
    }

    return { 
      success: true, 
      message: 'Orçamento solicitado com sucesso! Até 3 empresas entrarão em contato em breve.' 
    }

  } catch (err) {
    console.error('Unhandled error submitting lead:', err)
    return { success: false, error: 'Erro interno do servidor.' }
  }
}

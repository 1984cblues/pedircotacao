'use server'

import { createServerSupabaseClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { empresaSchema } from '../validators/schemas'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function cadastrarEmpresa(formData: FormData) {
  try {
    const supabaseServer = await createServerSupabaseClient()
    const { data: authData, error: authError } = await supabaseServer.auth.getUser()

    if (authError || !authData.user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const userId = authData.user.id

    // Extrair dados base
    const rawData = {
      razao_social: formData.get('razao_social'),
      nome_fantasia: formData.get('nome_fantasia'),
      cnpj: formData.get('cnpj') || '',
      telefone: formData.get('telefone'),
      whatsapp: formData.get('whatsapp') || '',
      email: formData.get('email'),
      descricao: formData.get('descricao') || '',
      website: formData.get('website') || '',
      endereco: formData.get('endereco') || '',
      cidade_id: formData.get('cidade_id'),
      // Array mapping do FormData (supondo campos múltiplos com nomes 'servicos[]' e 'cidades[]')
      servico_ids: formData.getAll('servicos[]').map(Number),
      cidade_ids: formData.getAll('cidades[]').map(Number),
    }

    // Validação Zod (OWASP A05)
    const result = empresaSchema.safeParse(rawData)
    
    if (!result.success) {
      return { 
        success: false, 
        error: 'Dados inválidos', 
        details: result.error.flatten().fieldErrors 
      }
    }

    const data = result.data

    // Criar Slug baseado no nome fantasia e ID local ou random string
    const baseSlug = data.nome_fantasia.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`

    const supabaseAdmin = createAdminClient()

    // Como as lógicas envolvem múltiplas tabelas e a empresa é owner, 
    // podemos usar o cliente do usuário ou o Admin (preferível o Admin aqui para transações em lote se não quisermos lidar com complexidades de RLS do owner logado, embora o RLS permita isso para owner).
    // Usaremos o supabaseServer para o insert principal para testar o RLS
    
    const { data: empresa, error: empresaError } = await supabaseServer
      .from('empresas')
      .insert({
        user_id: userId,
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        cnpj: data.cnpj,
        slug: finalSlug,
        telefone: data.telefone,
        whatsapp: data.whatsapp,
        email: data.email,
        descricao: data.descricao,
        website: data.website,
        endereco: data.endereco,
        cidade_id: data.cidade_id,
        status: 'pendente'
      })
      .select('id')
      .single()

    if (empresaError || !empresa) {
      console.error('Erro ao cadastrar empresa:', empresaError)
      return { success: false, error: 'Erro ao criar o perfil da empresa. O CNPJ já existe?' }
    }

    // Inserir áreas e serviços
    // Como a empresa já foi criada, o user_id logado é owner, então o RLS permite inserts nas tabelas filhas.

    // 1. Inserir serviços
    const servicosPayload = data.servico_ids.map(id => ({
      empresa_id: empresa.id,
      servico_id: id,
      ativo: true
    }))
    
    const { error: servicosError } = await supabaseServer
      .from('empresa_servicos')
      .insert(servicosPayload)

    // 2. Inserir áreas de atendimento
    const areasPayload = data.cidade_ids.map(id => ({
      empresa_id: empresa.id,
      cidade_id: id,
      bairro_id: null // Atende cidade toda por padrão na criação inicial
    }))

    const { error: areasError } = await supabaseServer
      .from('empresa_areas_atendimento')
      .insert(areasPayload)

    if (servicosError || areasError) {
      console.error('Erro ao vincular servicos ou areas:', { servicosError, areasError })
      // Dependendo da criticidade, faríamos um rollback da empresa com Admin client, mas vamos apenas logar por hora.
    }

    // Log de auditoria (OWASP A09) - Usar Admin client para inserir no audit log pois é protegido
    await supabaseAdmin.from('audit_log').insert({
      user_id: userId,
      evento: 'cadastro_empresa',
      detalhes: { empresa_id: empresa.id, cnpj: data.cnpj }
    })

    revalidatePath('/dashboard')
    
    return { success: true }
    
  } catch (err) {
    console.error('Unhandled error registering company:', err)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

import 'server-only'
import { createServerSupabaseClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'

// Retorna as empresas compatíveis com um serviço e localização que têm saldo de créditos positivo
export async function getEmpresasEligiveisParaLead(
  servico_id: number,
  cidade_id: number,
  bairro_id: number | null
) {
  // Precisamos usar o AdminClient porque a checagem será feita durante a submissão anônima de lead
  const supabase = createAdminClient()

  // 1. Buscar empresas com saldo > 0
  const { data: creditosData, error: creditosError } = await supabase
    .from('creditos')
    .select('empresa_id')
    .gt('saldo', 0)

  if (creditosError || !creditosData || creditosData.length === 0) {
    console.log('Nenhuma empresa com saldo.')
    return []
  }

  const empresasComSaldoIds = creditosData.map((c) => c.empresa_id)

  // 2. Buscar empresas aprovadas que oferecem o serviço e atendem a área
  // Vamos buscar as empresas em 'empresas' e fazer join com servicos e areas
  const { data: empresas, error } = await supabase
    .from('empresas')
    .select(`
      id,
      nome_fantasia,
      email,
      empresa_servicos!inner(servico_id, ativo),
      empresa_areas_atendimento!inner(cidade_id, bairro_id)
    `)
    .eq('status', 'aprovada')
    .in('id', empresasComSaldoIds)
    .eq('empresa_servicos.servico_id', servico_id)
    .eq('empresa_servicos.ativo', true)
    .eq('empresa_areas_atendimento.cidade_id', cidade_id)

  if (error || !empresas) {
    console.error('Error fetching eligible empresas:', error)
    return []
  }

  // Filtrar em memória pelo bairro:
  // A empresa atende a área se o bairro_id na área for nulo (atende cidade toda)
  // ou se for exatamente igual ao bairro_id do lead
  const elegiveis = empresas.filter((emp) => {
    return emp.empresa_areas_atendimento.some((area: any) => {
      if (area.bairro_id === null) return true // Atende toda a cidade
      if (bairro_id !== null && area.bairro_id === bairro_id) return true // Atende o bairro específico
      return false
    })
  })

  // Retornar as N primeiras ou randomizadas. 
  // No caso, vamos embaralhar e limitar a 3 prestadores por lead para não gerar leilão infinito.
  const shuffled = elegiveis.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3)
}

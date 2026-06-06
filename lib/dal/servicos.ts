// ==========================================
// DAL: Serviços
// ==========================================

import 'server-only'
import { createServerSupabaseClient, createStaticSupabaseClient } from '../supabase/server'

export async function getServicosAtivos() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('servicos')
    .select('id, nome, slug, descricao_curta, categoria_id, categorias_servico(nome, slug)')
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  if (error) {
    console.error('Error fetching servicos:', error)
    return []
  }

  return data
}

export async function getStaticServicosAtivos() {
  const supabase = createStaticSupabaseClient()
  const { data, error } = await supabase
    .from('servicos')
    .select('id, nome, slug, descricao_curta, categoria_id, categorias_servico(nome, slug)')
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  if (error) {
    console.error('Error fetching static servicos:', error)
    return []
  }

  return data
}

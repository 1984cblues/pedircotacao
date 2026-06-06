// ==========================================
// DAL: Cidades
// ==========================================

import 'server-only'
import { createServerSupabaseClient, createStaticSupabaseClient } from '../supabase/server'

export async function getCidadesSP() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('cidades')
    .select('id, nome, slug, bairros(id, nome, slug)')
    .eq('estado_id', 1) // 1 = SP
    .eq('ativo', true)

  if (error) {
    console.error('Error fetching cidades:', error)
    return []
  }

  return data
}

export async function getStaticCidadesSP() {
  const supabase = createStaticSupabaseClient()
  const { data, error } = await supabase
    .from('cidades')
    .select('id, nome, slug, bairros(id, nome, slug)')
    .eq('estado_id', 1) // 1 = SP
    .eq('ativo', true)

  if (error) {
    console.error('Error fetching static cidades:', error)
    return []
  }

  return data
}

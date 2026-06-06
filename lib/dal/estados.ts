// ==========================================
// DAL: Estados
// ==========================================

import 'server-only'
import { createServerSupabaseClient, createStaticSupabaseClient } from '../supabase/server'

export async function getEstados() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('estados')
    .select('id, nome, sigla, slug')
    .eq('ativo', true)

  if (error) {
    console.error('Error fetching estados:', error)
    return []
  }

  return data
}

export async function getStaticEstados() {
  const supabase = createStaticSupabaseClient()
  const { data, error } = await supabase
    .from('estados')
    .select('id, nome, sigla, slug')
    .eq('ativo', true)

  if (error) {
    console.error('Error fetching static estados:', error)
    return []
  }

  return data
}

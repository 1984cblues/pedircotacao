// ==========================================
// DAL: Bairros
// ==========================================

import 'server-only'
import { createServerSupabaseClient, createStaticSupabaseClient } from '../supabase/server'

export async function getBairrosByCidadeId(cidadeId: number) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('bairros')
    .select('id, cidade_id, nome, slug')
    .eq('cidade_id', cidadeId)
    .eq('ativo', true)

  if (error) {
    console.error('Error fetching bairros:', error)
    return []
  }

  return data
}

export async function getStaticBairros() {
  const supabase = createStaticSupabaseClient()
  const { data, error } = await supabase
    .from('bairros')
    .select('id, nome, slug, cidades(id, nome, slug, estados(id, nome, slug, sigla))')
    .eq('ativo', true)

  if (error) {
    console.error('Error fetching static bairros:', error)
    return []
  }

  return data
}

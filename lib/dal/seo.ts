// ==========================================
// DAL: SEO Content
// ==========================================

import 'server-only'
import { createStaticSupabaseClient } from '../supabase/server'

interface SEOContentLookup {
  servicoId: number
  cidadeId: number
  bairroId?: number | null
}

export interface SEOContent {
  meta_title: string
  meta_description: string
  h1: string
  h2?: string | null
  intro_paragraph: string
  cta_text?: string | null
  faqs: Array<{ pergunta: string; resposta: string }>
}

export async function getStaticSEOContent({
  servicoId,
  cidadeId,
  bairroId = null,
}: SEOContentLookup): Promise<SEOContent | null> {
  const supabase = createStaticSupabaseClient()
  
  let query = supabase
    .from('conteudo_seo')
    .select('meta_title, meta_description, h1, h2, intro_paragraph, cta_text, faqs')
    .eq('servico_id', servicoId)
    .eq('cidade_id', cidadeId)
    .eq('ativo', true)

  if (bairroId) {
    query = query.eq('bairro_id', bairroId)
  } else {
    query = query.is('bairro_id', null)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error('Error fetching SEO content:', error)
    return null
  }

  return data
}

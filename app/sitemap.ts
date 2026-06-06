import { MetadataRoute } from 'next'
import { getStaticEstados } from '@/lib/dal/estados'
import { getStaticCidadesSP } from '@/lib/dal/cidades'
import { getStaticBairros } from '@/lib/dal/bairros'
import { getStaticServicosAtivos } from '@/lib/dal/servicos'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pedircotacao.com.br'

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  try {
    // 1. Estados
    const estados = await getStaticEstados()
    for (const e of estados) {
      routes.push({
        url: `${baseUrl}/${e.slug.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    // 2. Cidades
    const cidades = await getStaticCidadesSP()
    for (const c of cidades) {
      routes.push({
        url: `${baseUrl}/sp/${c.slug.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }

    // 3. Bairros
    const bairros = await getStaticBairros()
    for (const b of bairros) {
      const cidadeSlug = (b as any).cidades?.slug || ''
      if (!cidadeSlug) continue
      routes.push({
        url: `${baseUrl}/sp/${cidadeSlug.toLowerCase()}/${b.slug.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }

    // 4. Serviços por Bairro (Conversão)
    const servicos = await getStaticServicosAtivos()
    for (const b of bairros) {
      const cidadeSlug = (b as any).cidades?.slug || ''
      if (!cidadeSlug) continue
      for (const s of servicos) {
        routes.push({
          url: `${baseUrl}/sp/${cidadeSlug.toLowerCase()}/${b.slug.toLowerCase()}/${s.slug.toLowerCase()}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.9, // Alta prioridade - páginas de conversão
        })
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return routes
}

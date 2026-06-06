import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStaticEstados } from '@/lib/dal/estados'
import { getStaticCidadesSP } from '@/lib/dal/cidades'
import { getStaticBairros } from '@/lib/dal/bairros'
import { getStaticServicosAtivos } from '@/lib/dal/servicos'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/seo/Breadcrumbs'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    estado: string
    cidade: string
    bairro: string
  }>
}

// SSR: rendered at request time (no build-time Supabase dependency)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { estado, cidade, bairro } = await params
  const estados = await getStaticEstados()
  const currentEstado = estados.find((e: any) => e.slug.toLowerCase() === estado.toLowerCase())
  if (!currentEstado) return {}

  const cidades = await getStaticCidadesSP()
  const currentCidade = cidades.find((c: any) => c.slug.toLowerCase() === cidade.toLowerCase())
  if (!currentCidade) return {}

  const bairros = (currentCidade.bairros || []) as unknown as Array<{ id: number; nome: string; slug: string }>
  const currentBairro = bairros.find((b: any) => b.slug.toLowerCase() === bairro.toLowerCase())
  if (!currentBairro) return {}

  const title = `Orçamentos de Serviços em ${currentBairro.nome}, ${currentCidade.nome} - ${currentEstado.sigla} | PedirCotação`
  const description = `Precisa de análises de solo, água ou consultoria ambiental em ${currentBairro.nome}, ${currentCidade.nome} - ${currentEstado.sigla}? Solicite orçamentos grátis online.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${currentEstado.slug.toLowerCase()}/${currentCidade.slug.toLowerCase()}/${currentBairro.slug.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
    },
  }
}

export default async function BairroPage({ params }: PageProps) {
  const { estado, cidade, bairro } = await params
  const estados = await getStaticEstados()
  const currentEstado = estados.find((e: any) => e.slug.toLowerCase() === estado.toLowerCase())
  if (!currentEstado) notFound()

  const cidades = await getStaticCidadesSP()
  const currentCidade = cidades.find((c: any) => c.slug.toLowerCase() === cidade.toLowerCase())
  if (!currentCidade) notFound()

  const bairros = (currentCidade.bairros || []) as unknown as Array<{ id: number; nome: string; slug: string }>
  const currentBairro = bairros.find((b: any) => b.slug.toLowerCase() === bairro.toLowerCase())
  if (!currentBairro) notFound()

  // Fetch all services
  const servicos = await getStaticServicosAtivos()

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: currentEstado.nome, url: `/${currentEstado.slug.toLowerCase()}` },
              {
                label: currentCidade.nome,
                url: `/${currentEstado.slug.toLowerCase()}/${currentCidade.slug.toLowerCase()}`,
              },
              { label: currentBairro.nome },
            ]}
          />

          <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm border border-zinc-150 dark:bg-zinc-950 dark:border-zinc-800/80">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                Atendimento no Bairro
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                Serviços Técnicos e Ambientais no {currentBairro.nome}
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Localizado em {currentCidade.nome} - {currentEstado.sigla}
              </p>
              <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Selecione o serviço específico abaixo para solicitar um orçamento. Atendemos residências, comércios e indústrias no {currentBairro.nome} com parceiros certificados da região do Alto Tietê.
              </p>
            </div>

            <div className="mt-12">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
                Serviços Disponíveis no {currentBairro.nome}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {servicos.map((servico) => (
                  <Link
                    key={servico.slug}
                    href={`/${currentEstado.slug.toLowerCase()}/${currentCidade.slug.toLowerCase()}/${currentBairro.slug.toLowerCase()}/${servico.slug}`}
                    className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-emerald-500"
                  >
                    <div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {(servico as any).categorias_servico?.nome || 'Serviço'}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-zinc-900 dark:text-white">
                        {servico.nome}
                      </h3>
                      <p className="mt-2 text-xs text-zinc-400 line-clamp-2">
                        {servico.descricao_curta}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Solicitar Cotação
                      <span className="ml-1">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

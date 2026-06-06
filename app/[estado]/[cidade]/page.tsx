import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStaticEstados } from '@/lib/dal/estados'
import { getStaticCidadesSP } from '@/lib/dal/cidades'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/seo/Breadcrumbs'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    estado: string
    cidade: string
  }>
}

// SSR: rendered at request time (no build-time Supabase dependency)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { estado, cidade } = await params
  const estados = await getStaticEstados()
  const currentEstado = estados.find((e: any) => e.slug.toLowerCase() === estado.toLowerCase())
  if (!currentEstado) return {}

  const cidades = await getStaticCidadesSP()
  const currentCidade = cidades.find((c: any) => c.slug.toLowerCase() === cidade.toLowerCase())
  if (!currentCidade) return {}

  const title = `Orçamentos de Serviços Técnicos em ${currentCidade.nome} - ${currentEstado.sigla} | PedirCotação`
  const description = `Solicite cotações de análises laboratoriais e serviços ambientais em ${currentCidade.nome} - ${currentEstado.sigla}. Conecte-se com laboratórios e consultores locais.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${currentEstado.slug.toLowerCase()}/${currentCidade.slug.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
    },
  }
}

export default async function CidadePage({ params }: PageProps) {
  const { estado, cidade } = await params
  const estados = await getStaticEstados()
  const currentEstado = estados.find((e: any) => e.slug.toLowerCase() === estado.toLowerCase())
  if (!currentEstado) notFound()

  const cidades = await getStaticCidadesSP()
  const currentCidade = cidades.find((c: any) => c.slug.toLowerCase() === cidade.toLowerCase())
  if (!currentCidade) notFound()

  // Typescript cast for relation:
  const bairros = (currentCidade.bairros || []) as unknown as Array<{ id: number; nome: string; slug: string }>

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: currentEstado.nome, url: `/${currentEstado.slug.toLowerCase()}` },
              { label: currentCidade.nome },
            ]}
          />

          <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm border border-zinc-150 dark:bg-zinc-950 dark:border-zinc-800/80">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                Atendimento Regional
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                Cotações de Serviços em {currentCidade.nome} - {currentEstado.sigla}
              </h1>
              <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Procura por análises laboratoriais de água, solo, efluentes ou licenciamento ambiental em {currentCidade.nome}? Selecione o seu bairro abaixo para especificar sua localização e solicitar cotações de forma direcionada com prestadores locais homologados.
              </p>
            </div>

            <div className="mt-12">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
                Bairros Atendidos em {currentCidade.nome}
              </h2>
              {bairros.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhum bairro cadastrado nesta cidade.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {bairros.map((bairro) => (
                    <Link
                      key={bairro.slug}
                      href={`/${currentEstado.slug.toLowerCase()}/${currentCidade.slug.toLowerCase()}/${bairro.slug}`}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:border-emerald-500 hover:text-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
                    >
                      <span>{bairro.nome}</span>
                      <span className="text-zinc-300 dark:text-zinc-700">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStaticEstados } from '@/lib/dal/estados'
import { getStaticCidadesSP } from '@/lib/dal/cidades'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/seo/Breadcrumbs'

interface PageProps {
  params: Promise<{
    estado: string
  }>
}

export async function generateStaticParams() {
  const estados = await getStaticEstados()
  return estados.map((e) => ({
    estado: e.slug.toLowerCase(),
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { estado } = await params
  const estados = await getStaticEstados()
  const currentEstado = estados.find((e) => e.slug.toLowerCase() === estado.toLowerCase())

  if (!currentEstado) {
    return {}
  }

  const title = `Solicitar Orçamentos de Serviços em ${currentEstado.nome} | PedirCotação`
  const description = `Encontre laboratórios e consultorias ambientais credenciadas em ${currentEstado.nome}. Solicite orçamentos rápidos e gratuitos em diversas cidades.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${currentEstado.slug.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
    },
  }
}

export default async function EstadoPage({ params }: PageProps) {
  const { estado } = await params
  const estados = await getStaticEstados()
  const currentEstado = estados.find((e) => e.slug.toLowerCase() === estado.toLowerCase())

  if (!currentEstado) {
    notFound()
  }

  // Fetch cities in SP
  const cidades = await getStaticCidadesSP()

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: currentEstado.nome }]} />

          <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm border border-zinc-150 dark:bg-zinc-950 dark:border-zinc-800/80">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                Cobertura Ampliada
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                Serviços Técnicos e Ambientais em {currentEstado.nome}
              </h1>
              <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Selecione sua cidade abaixo para encontrar empresas qualificadas em análises de solo, água, efluentes, licenciamentos e laudos técnicos. Conectamos sua necessidade diretamente com até 3 prestadores locais aprovados.
              </p>
            </div>

            <div className="mt-12">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
                Cidades Disponíveis no Alto Tietê
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cidades.map((cidade) => (
                  <Link
                    key={cidade.slug}
                    href={`/${currentEstado.slug.toLowerCase()}/${cidade.slug}`}
                    className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-emerald-500"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-500">
                        {cidade.nome}
                      </h3>
                      <p className="mt-2 text-xs text-zinc-400">
                        {cidade.bairros?.length || 0} bairros atendidos com serviços credenciados.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Ver bairros e serviços
                      <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
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

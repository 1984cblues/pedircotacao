import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getStaticCidadesSP } from '@/lib/dal/cidades'

export const metadata = {
  title: 'PedirCotação | Marketplace de Orçamentos e Serviços Ambientais',
  description: 'Solicite cotações para análises de solo, água, efluentes e licenciamento ambiental com laboratórios e consultores credenciados no Alto Tietê.',
}

export default async function Home() {
  const cidades = await getStaticCidadesSP()

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white py-16 sm:py-24 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left Column */}
              <div className="flex flex-col justify-center text-left">
                <span className="self-start inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  📍 Cobertura no Alto Tietê — SP
                </span>
                <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl leading-none">
                  Cotações Técnicas e Ambientais em minutos
                </h1>
                <p className="mt-6 text-base sm:text-lg leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-xl">
                  Conectamos indústrias, comércios e construtoras aos melhores laboratórios de análises e consultorias ambientais credenciadas da região. Rápido, seguro e 100% gratuito para quem solicita.
                </p>
                <div className="mt-8 flex flex-wrap gap-4 items-center">
                  <Link
                    href="/sp"
                    className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-500/10 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/20"
                  >
                    Solicitar Cotação Grátis
                  </Link>
                  <Link
                    href="/como-funciona"
                    className="text-sm font-semibold leading-6 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400"
                  >
                    Como funciona <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              {/* Right Column (Hero Image) */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="overflow-hidden rounded-2xl border border-zinc-150 bg-zinc-50 shadow-md dark:border-zinc-800 dark:bg-zinc-900/40">
                  <img
                    src="/hero_laboratory.png"
                    alt="Equipamentos modernos de laboratório e análise ambiental"
                    width={500}
                    height={400}
                    className="object-cover transition-transform hover:scale-[1.02] duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cidades grid */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Cotações por Cidade
            </h2>
            <p className="mt-4 text-zinc-500 dark:text-zinc-400">
              Selecione a cidade do empreendimento para ver os serviços locais e solicitar seu orçamento.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cidades.map((cidade: any) => (
              <Link
                key={cidade.slug}
                href={`/sp/${cidade.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-emerald-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-emerald-500"
              >
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-emerald-500">
                    {cidade.nome}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Solicite orçamentos rápidos para análises de água, solo, efluentes e licenciamento ambiental.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Ver bairros e serviços
                  <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

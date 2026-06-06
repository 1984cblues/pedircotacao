import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getStaticEstados } from '@/lib/dal/estados'
import { getStaticCidadesSP } from '@/lib/dal/cidades'
import { getStaticBairros } from '@/lib/dal/bairros'
import { getStaticServicosAtivos } from '@/lib/dal/servicos'
import { getStaticSEOContent } from '@/lib/dal/seo'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import JsonLd from '@/components/seo/JsonLd'
import LeadForm from '@/components/forms/LeadForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    estado: string
    cidade: string
    bairro: string
    servico: string
  }>
}

// SSR: rendered at request time (no build-time Supabase dependency)

async function getPageData(params: { estado: string; cidade: string; bairro: string; servico: string }) {
  const estados = await getStaticEstados()
  const currentEstado = estados.find((e) => e.slug.toLowerCase() === params.estado.toLowerCase())
  if (!currentEstado) return null

  const cidades = await getStaticCidadesSP()
  const currentCidade = cidades.find((c) => c.slug.toLowerCase() === params.cidade.toLowerCase())
  if (!currentCidade) return null

  const bairros = (currentCidade.bairros || []) as unknown as Array<{ id: number; nome: string; slug: string }>
  const currentBairro = bairros.find((b) => b.slug.toLowerCase() === params.bairro.toLowerCase())
  if (!currentBairro) return null

  const servicos = await getStaticServicosAtivos()
  const currentServico = servicos.find((s) => s.slug.toLowerCase() === params.servico.toLowerCase())
  if (!currentServico) return null

  // Get database custom SEO content overrides
  const seoContent = await getStaticSEOContent({
    servicoId: currentServico.id,
    cidadeId: currentCidade.id,
    bairroId: currentBairro.id,
  })

  return {
    estado: currentEstado,
    cidade: currentCidade,
    bairro: currentBairro,
    servico: currentServico,
    seoContent,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const data = await getPageData(resolvedParams)
  if (!data) return {}

  const { estado, cidade, bairro, servico, seoContent } = data

  const title =
    seoContent?.meta_title ||
    `Orçamento de ${servico.nome} no ${bairro.nome}, ${cidade.nome} - ${estado.sigla}`
  const description =
    seoContent?.meta_description ||
    `Precisa de ${servico.nome} no bairro ${bairro.nome} em ${cidade.nome}? Faça seu pedido e receba até 3 orçamentos de empresas credenciadas.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${estado.slug.toLowerCase()}/${cidade.slug.toLowerCase()}/${bairro.slug.toLowerCase()}/${servico.slug.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
    },
  }
}

export default async function ServicoConversaoPage({ params }: PageProps) {
  const resolvedParams = await params
  const data = await getPageData(resolvedParams)
  if (!data) notFound()

  const { estado, cidade, bairro, servico, seoContent } = data

  // Dynamic values or overrides
  const h1Text = seoContent?.h1 || `${servico.nome} no ${bairro.nome} em ${cidade.nome} - ${estado.sigla}`
  const h2Text = seoContent?.h2 || `Receba propostas de empresas homologadas da região`
  const introParagraph =
    seoContent?.intro_paragraph ||
    `Está buscando serviços de ${servico.nome.toLowerCase()} com atendimento no bairro ${bairro.nome} em ${cidade.nome}? O PedirCotação ajuda você a economizar tempo e dinheiro. Nós enviamos sua solicitação para até 3 fornecedores parceiros qualificados na região do Alto Tietê. Eles analisam seu pedido e enviam propostas competitivas diretamente para seu contato comercial.`

  const defaultFaqs = [
    {
      pergunta: `Como solicitar orçamento de ${servico.nome.toLowerCase()} no ${bairro.nome}?`,
      resposta: `Basta preencher o formulário ao lado com suas informações e detalhes técnicos. Nossa plataforma encaminha os dados para os parceiros qualificados que atendem a região do ${bairro.nome} em ${cidade.nome}.`,
    },
    {
      pergunta: `Quanto custa a cotação e o envio dos orçamentos?`,
      resposta: `Para quem solicita o orçamento, o serviço é 100% gratuito. Nós somos remunerados pelas empresas credenciadas que compram créditos para poder enviar as propostas.`,
    },
    {
      pergunta: `Quais empresas vão me atender?`,
      resposta: `Trabalhamos com prestadores homologados, laboratórios e consultores técnicos de ${cidade.nome} e de outras cidades do Alto Tietê, assegurando qualidade, proximidade e agilidade na entrega.`,
    },
  ]

  const faqs = seoContent?.faqs && seoContent.faqs.length > 0 ? seoContent.faqs : defaultFaqs

  // Create LocalBusiness schema markup
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: servico.nome,
    description: servico.descricao_curta,
    provider: {
      '@type': 'LocalBusiness',
      name: 'PedirCotação Parceiros',
      image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pedircotacao.com.br'}/next.svg`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: cidade.nome,
        addressRegion: estado.sigla,
        addressCountry: 'BR',
      },
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: `${bairro.nome}, ${cidade.nome}`,
    },
  }

  return (
    <>
      <Header />
      <JsonLd schema={schemaMarkup} />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: estado.nome, url: `/${estado.slug.toLowerCase()}` },
              {
                label: cidade.nome,
                url: `/${estado.slug.toLowerCase()}/${cidade.slug.toLowerCase()}`,
              },
              {
                label: bairro.nome,
                url: `/${estado.slug.toLowerCase()}/${cidade.slug.toLowerCase()}/${bairro.slug.toLowerCase()}`,
              },
              { label: servico.nome },
            ]}
          />

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* SEO Content Section (Left - 2 Cols) */}
            <div className="lg:col-span-2 space-y-8">
              <section className="rounded-2xl bg-white p-8 shadow-sm border border-zinc-150 dark:bg-zinc-950 dark:border-zinc-800/80">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Orçamento de Serviços
                </span>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                  {h1Text}
                </h1>
                <h2 className="mt-2 text-lg font-medium text-zinc-500 dark:text-zinc-400">
                  {h2Text}
                </h2>
                <p className="mt-6 text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {introParagraph}
                </p>
              </section>

              {/* FAQ Section */}
              <section className="rounded-2xl bg-white p-8 shadow-sm border border-zinc-150 dark:bg-zinc-950 dark:border-zinc-800/80">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
                  Dúvidas Frequentes sobre {servico.nome}
                </h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border-b border-zinc-100 pb-4 last:border-0 last:pb-0 dark:border-zinc-800"
                    >
                      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                        {faq.pergunta}
                      </h3>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {faq.resposta}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Lead Form Section (Right - 1 Col) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <LeadForm
                  servicoId={servico.id}
                  estadoId={estado.id}
                  cidadeId={cidade.id}
                  bairroId={bairro.id}
                  servicoNome={servico.nome}
                  cidadeNome={cidade.nome}
                  bairroNome={bairro.nome}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

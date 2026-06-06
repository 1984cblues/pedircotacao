import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Como Funciona | PedirCotação',
  description: 'Entenda como funciona o envio de solicitações e recebimento de orçamentos para serviços técnicos e ambientais no PedirCotação.',
}

export default function ComoFunciona() {
  const passos = [
    {
      numero: '01',
      titulo: 'Solicite seu orçamento',
      descricao: 'Preencha as informações do serviço e localização em menos de 2 minutos. É totalmente gratuito.',
    },
    {
      numero: '02',
      titulo: 'Fazemos o matching',
      descricao: 'Nossa plataforma identifica até 3 empresas/laboratórios homologados na região que atendem à sua necessidade.',
    },
    {
      numero: '03',
      titulo: 'Receba as propostas',
      descricao: 'Os prestadores entram em contato direto com você para enviar seus orçamentos e negociar.',
    },
  ]

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              Como funciona o PedirCotação?
            </h1>
            <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
              Conectamos quem precisa de análises técnicas ou serviços ambientais com fornecedores qualificados da região de forma simples, rápida e gratuita.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {passos.map((passo) => (
              <div
                key={passo.numero}
                className="relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span className="text-4xl font-extrabold text-emerald-500/20 dark:text-emerald-500/10">
                  {passo.numero}
                </span>
                <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
                  {passo.titulo}
                </h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {passo.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

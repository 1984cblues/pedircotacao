import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Seja um Parceiro | PedirCotação',
  description: 'Cadastre sua consultoria ambiental ou laboratório de análises no PedirCotação e tenha acesso a dezenas de leads qualificados na sua área de atuação.',
}

export default function CadastroPrestador() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900 py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                Parceria Comercial
              </span>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Cadastre sua Empresa
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Receba solicitações qualificadas de orçamentos para análises laboratoriais e serviços ambientais na região do Alto Tietê.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-150 dark:bg-zinc-900 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Como prestador parceiro você:</h3>
                <ul className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 space-y-2 list-disc list-inside">
                  <li>Visualiza dados de contato de leads qualificados;</li>
                  <li>Define exatamente quais bairros e cidades atende;</li>
                  <li>Paga apenas pelos leads que decidir abrir;</li>
                  <li>Gerencia tudo em um painel financeiro transparente.</li>
                </ul>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-zinc-400">
                  O cadastro de novos prestadores estará totalmente disponível após a integração de credenciamento na Fase 5.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

import Link from 'next/link'

export default function Footer() {
  const cidadesMvp = [
    { nome: 'Arujá', slug: 'aruja' },
    { nome: 'Santa Isabel', slug: 'santa-isabel' },
    { nome: 'Guararema', slug: 'guararema' },
    { nome: 'Itaquaquecetuba', slug: 'itaquaquecetuba' },
    { nome: 'Poá', slug: 'poa' },
    { nome: 'Ferraz de Vasconcelos', slug: 'ferraz-de-vasconcelos' },
  ]

  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              PedirCotação
            </span>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
              O maior marketplace de cotações para serviços ambientais e análises laboratoriais do Alto Tietê.
            </p>
          </div>

          {/* Cidades Cobertas */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Cidades Cobertas</h3>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {cidadesMvp.map((cidade) => (
                <li key={cidade.slug}>
                  <Link
                    href={`/sp/${cidade.slug}`}
                    className="text-xs text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400"
                  >
                    Cotação em {cidade.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Institucionais */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Para Empresas</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/cadastro"
                  className="text-xs text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400"
                >
                  Seja um Parceiro
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-xs text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400"
                >
                  Painel do Prestador
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">&copy; {new Date().getFullYear()} PedirCotação. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <span className="text-xs text-zinc-400">Desenvolvido com foco em SEO Programático</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

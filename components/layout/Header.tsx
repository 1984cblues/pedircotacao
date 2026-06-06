import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-xl font-bold tracking-tight text-transparent transition-all group-hover:opacity-90">
            PedirCotação
          </span>
          <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            B2B
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            href="/como-funciona"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            Como Funciona
          </Link>
          <Link
            href="/cadastro"
            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-500/10 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/20"
          >
            Cadastrar Empresa
          </Link>
        </nav>
      </div>
    </header>
  )
}

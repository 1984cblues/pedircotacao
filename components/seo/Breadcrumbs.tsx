import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  url?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generate JSON-LD BreadcrumbList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.url ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pedircotacao.com.br'}${item.url}` : undefined,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="flex text-sm text-zinc-500 dark:text-zinc-400 py-3" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="hover:text-emerald-500 transition-colors inline-flex items-center"
            >
              Home
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={index} className="flex items-center">
                <span className="mx-2 text-zinc-300 dark:text-zinc-700">/</span>
                {isLast || !item.url ? (
                  <span className="font-medium text-zinc-800 dark:text-zinc-200" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.url} className="hover:text-emerald-500 transition-colors">
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

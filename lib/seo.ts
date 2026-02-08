import type { Metadata } from 'next'
import { getBaseUrl } from '@/lib/utils'
import { getBrandConfig } from '@/config/branding'

const brandConfig = getBrandConfig()

export const siteConfig = {
  name: brandConfig.name,
  description:
    'Gradia — Votre rénovation, pilotée de A à Z. Décrivez votre projet, obtenez une fiche structurée et un chef de projet dédié.',
  url: getBaseUrl(),
  twitterHandle: '@gradia_fr',
  creator: 'Gradia',
  keywords: [
    'Gradia',
    'rénovation',
    'maîtrise d\'oeuvre',
    'chef de projet rénovation',
    'travaux appartement',
    'travaux maison',
    'rénovation accompagnée',
    'devis rénovation',
    'pilotage chantier',
    'MOE digitale',
  ],
} as const

export type SEOOptions = {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  imageAlt?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  noindex?: boolean
  nofollow?: boolean
  canonical?: string
  isRootLayout?: boolean
  allowCanonicalQuery?: boolean
}

const getAbsoluteUrl = (path: string): string => {
  const trimmed = path.trim()
  const isAbsolute = /^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')
  if (isAbsolute) {
    return trimmed
  }

  const baseUrl = getBaseUrl().replace(/\/$/, '')
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${baseUrl}${cleanPath}`
}

const normalizeCanonicalPath = (canonicalPath?: string, allowQuery?: boolean) => {
  if (!canonicalPath) {
    return canonicalPath
  }

  const [withoutHash] = canonicalPath.split('#')
  if (allowQuery) {
    return withoutHash
  }

  const [withoutQuery] = withoutHash.split('?')
  return withoutQuery
}

const getOpenGraph = (options: SEOOptions) => {
  const imageUrl = options.image || '/opengraph-image.png'

  return {
    type: options.type || 'website',
    url: options.canonical ? getAbsoluteUrl(options.canonical) : siteConfig.url,
    title: options.title || siteConfig.name,
    description: options.description || siteConfig.description,
    siteName: siteConfig.name,
    locale: 'fr_FR',
    images: [
      {
        url: imageUrl,
        ...(options.imageAlt && { alt: options.imageAlt }),
      },
    ],
    ...(options.publishedTime && { publishedTime: options.publishedTime }),
    ...(options.modifiedTime && { modifiedTime: options.modifiedTime }),
    ...(options.authors && { authors: options.authors }),
  }
}

const getTwitterCard = (options: SEOOptions) => {
  const imageUrl = options.image || '/twitter-image.png'

  return {
    card: 'summary_large_image' as const,
    title: options.title || siteConfig.name,
    description: options.description || siteConfig.description,
    creator: siteConfig.twitterHandle,
    images: [imageUrl],
  }
}

export const generateMetadata = (options: SEOOptions = {}): Metadata => {
  const description = options.description || siteConfig.description
  const keywords = options.keywords || siteConfig.keywords
  const normalizedCanonicalPath = normalizeCanonicalPath(
    options.canonical,
    options.allowCanonicalQuery
  )
  const canonicalUrl = normalizedCanonicalPath
    ? getAbsoluteUrl(normalizedCanonicalPath)
    : siteConfig.url

  const titleMetadata = options.isRootLayout
    ? {
        absolute: options.title || siteConfig.name,
        template: `%s · ${siteConfig.name}`,
      }
    : options.title || siteConfig.name

  return {
    title: titleMetadata,
    description,
    keywords: keywords.join(', '),
    authors: options.authors
      ? options.authors.map((author) => ({ name: author }))
      : [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    publisher: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: getOpenGraph({
      ...options,
      canonical: normalizedCanonicalPath,
    }),
    twitter: getTwitterCard({
      ...options,
      canonical: normalizedCanonicalPath,
    }),
    robots: {
      index: !options.noindex,
      follow: !options.nofollow,
      googleBot: {
        index: !options.noindex,
        follow: !options.nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    ...(options.publishedTime && {
      publicationDate: options.publishedTime,
    }),
    ...(options.modifiedTime && {
      modificationDate: options.modifiedTime,
    }),
  }
}

export const getOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: getAbsoluteUrl('/logo.png'),
  }
}

export const getWebsiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
  }
}

export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.url),
    })),
  }
}

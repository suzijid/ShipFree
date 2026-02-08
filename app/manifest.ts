import type { MetadataRoute } from 'next'
import { getBrandConfig } from '@/config/branding'

export default function manifest(): MetadataRoute.Manifest {
  const brand = getBrandConfig()

  return {
    name: brand.name,
    short_name: brand.name,
    description:
      'Gradia — Votre rénovation, pilotée de A à Z. Décrivez votre projet, obtenez une fiche structurée et un chef de projet dédié.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fafaf8',
    theme_color: brand.theme?.primaryColor,
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    categories: ['renovation', 'construction', 'project management'],
    shortcuts: [
      {
        name: 'Mes projets',
        short_name: 'Projets',
        description: 'Accéder à vos projets de rénovation',
        url: '/projects',
      },
    ],
    lang: 'fr-FR',
    dir: 'ltr',
  }
}

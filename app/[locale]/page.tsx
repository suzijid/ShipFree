import Navbar from './(site)/navbar'
import Hero from './(site)/hero'
import HowItWorks from './(site)/how-it-works'
import FAQ from './(site)/faq'
import CTA from './(site)/cta'
import Footer from './(site)/footer'
import { GridLayout } from './(site)/grid-layout'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Rénovation accompagnée par un chef de projet dédié',
  description: 'Décrivez votre projet de rénovation et obtenez gratuitement une fiche projet structurée par IA et un chef de projet dédié. Artisans vérifiés, suivi digital, toute la France.',
  keywords: ['rénovation accompagnée', 'chef de projet rénovation', 'travaux maison', 'rénovation appartement', 'devis rénovation gratuit'],
})

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "C\u2019est vraiment gratuit pour démarrer ?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Oui. Le questionnaire, la fiche projet par IA, le rendez-vous de cadrage et la sélection des artisans sont entièrement gratuits. Vous ne payez que lorsque vous acceptez un devis et que les travaux commencent.",
      },
    },
    {
      '@type': 'Question',
      name: "Comment sont sélectionnés les artisans ?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Chaque artisan de notre réseau est vérifié : assurance professionnelle à jour, certifications, et avis clients vérifiés. Notre équipe les sélectionne manuellement en fonction de votre projet.",
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de temps prend le processus ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Le questionnaire prend 5-10 minutes. Vous recevez des propositions d\u2019artisans sous 48-72h. Le délai total dépend de la nature de votre projet.",
      },
    },
    {
      '@type': 'Question',
      name: 'Quelles garanties ai-je ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Tous nos artisans sont assurés. Le paiement par jalons protège votre investissement. Le dashboard vous donne une visibilité totale sur l\u2019avancement. Et notre équipe vous accompagne en cas de problème.",
      },
    },
    {
      '@type': 'Question',
      name: "Quels types de travaux gérez-vous ?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Rénovations complètes, cuisines, salles de bain, plomberie, électricité, peinture, sols, façade, isolation... Nous couvrons tous les corps de métier du bâtiment pour les projets à partir de 5 000 \u20ac.",
      },
    },
    {
      '@type': 'Question',
      name: 'Puis-je choisir mes artisans ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Absolument. Nous vous proposons les artisans les plus adaptés, mais c\u2019est vous qui acceptez ou refusez chaque devis. Vous gardez le contrôle total.",
      },
    },
  ],
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Accompagnement rénovation Gradia',
  description: "Service d\u2019accompagnement pour projets de rénovation : fiche projet par IA, chef de projet dédié, sélection d\u2019artisans vérifiés et suivi digital.",
  provider: {
    '@type': 'Organization',
    name: 'Gradia',
  },
  areaServed: {
    '@type': 'Country',
    name: 'France',
  },
  serviceType: "Maîtrise d\u2019oeuvre digitale",
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <GridLayout>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Navbar />
      <Hero />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </GridLayout>
  )
}

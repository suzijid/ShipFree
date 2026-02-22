export interface TourStep {
  id: string
  target?: string // data-tour attribute value on the target element — optional for modal steps
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur Gradia !',
    description: 'D\u00e9couvrez votre espace projet en quelques \u00e9tapes. Nous allons vous guider.',
  },
  {
    id: 'sidebar',
    target: 'sidebar-nav',
    title: 'Navigation',
    description: 'Naviguez entre les sections de votre projet depuis ce menu lat\u00e9ral.',
    position: 'right',
  },
  {
    id: 'overview',
    target: 'overview-nav',
    title: 'Vue d\u2019ensemble',
    description: 'Vue d\u2019ensemble de votre projet et ses avanc\u00e9es.',
    position: 'right',
  },
  {
    id: 'messages',
    target: 'messages-nav',
    title: 'Messages',
    description: 'Communiquez avec votre chef de projet et vos artisans.',
    position: 'right',
  },
  {
    id: 'documents',
    target: 'documents-nav',
    title: 'Documents',
    description: 'Retrouvez tous vos documents projet : devis, plans, factures.',
    position: 'right',
  },
  {
    id: 'artisans',
    target: 'artisans-nav',
    title: 'Artisans',
    description: 'Suivez les devis et artisans s\u00e9lectionn\u00e9s pour votre projet.',
    position: 'right',
  },
  {
    id: 'ready',
    title: 'Vous \u00eates pr\u00eat !',
    description: 'N\u2019h\u00e9sitez pas \u00e0 explorer votre espace. Nous sommes l\u00e0 pour vous accompagner.',
  },
]

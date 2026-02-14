export interface TourStep {
  id: string
  target: string // data-tour attribute value
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: 'welcome',
    title: 'Bienvenue sur Gradia',
    description: 'Votre espace client pour piloter votre projet de rénovation. Laissez-nous vous faire un tour rapide.',
    position: 'bottom',
  },
  {
    id: 'sidebar-nav',
    target: 'sidebar-nav',
    title: 'Navigation',
    description: 'Accédez à vos projets et naviguez entre les différentes sections depuis la barre latérale.',
    position: 'right',
  },
  {
    id: 'overview',
    target: 'overview-grid',
    title: 'Vue d\'ensemble',
    description: 'Retrouvez toutes les informations clés de votre projet en un coup d\'œil : avancement, budget, prochaines actions.',
    position: 'bottom',
  },
  {
    id: 'rdv-cadrage',
    target: 'rdv-cadrage',
    title: 'Rendez-vous de cadrage',
    description: 'Réservez un créneau gratuit avec votre chef de projet pour définir le plan d\'action.',
    position: 'left',
  },
  {
    id: 'messages-docs',
    target: 'messages-docs',
    title: 'Messages & Documents',
    description: 'Échangez avec votre chef de projet et partagez vos documents directement depuis l\'application.',
    position: 'right',
  },
  {
    id: 'ready',
    target: 'ready',
    title: 'Vous êtes prêt !',
    description: 'Explorez votre espace et n\'hésitez pas à nous contacter si vous avez des questions.',
    position: 'bottom',
  },
]

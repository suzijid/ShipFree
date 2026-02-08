import { getAnthropicClient } from './client'
import type { AiProjectSummary } from '@/config/project'
import {
  PROPERTY_TYPE_LABELS,
  BUDGET_RANGE_LABELS,
  type PropertyType,
  type BudgetRange,
} from '@/config/project'

// ─── Input from questionnaire ────────────────────────────────────────────────

export interface QuestionnaireInput {
  propertyType: string
  renovationType: string
  surface: string
  rooms: string[]
  workDescription: string
  constraints: string[]
  style: string
  budgetRange: string
  urgency: string
  postalCode: string
  city: string
}

// ─── Output: structured project sheet ────────────────────────────────────────

export interface ProjectSheet {
  title: string
  summary: AiProjectSummary
  structuredSummary: string // Markdown text for display
}

// ─── Room & constraint label maps ────────────────────────────────────────────

const ROOM_LABELS: Record<string, string> = {
  cuisine: 'Cuisine',
  salon: 'Salon / Séjour',
  chambre: 'Chambre(s)',
  salle_de_bain: 'Salle de bain',
  wc: 'WC',
  entree: 'Entrée / Couloir',
  bureau: 'Bureau',
  buanderie: 'Buanderie',
  terrasse: 'Terrasse / Balcon',
  garage: 'Garage / Cave',
}

const CONSTRAINT_LABELS: Record<string, string> = {
  copropriete: 'Copropriété',
  monument_historique: 'Bâtiment classé / secteur protégé',
  amiante: 'Présence possible d\'amiante',
  accessibilite: 'Accessibilité PMR',
  voisinage: 'Contraintes de voisinage',
  occupation: 'Logement occupé pendant travaux',
}

const RENOVATION_LABELS: Record<string, string> = {
  complete: 'Rénovation complète',
  partielle: 'Rénovation partielle',
  extension: 'Extension',
  amenagement: 'Aménagement',
  decoration: 'Décoration',
}

const STYLE_LABELS: Record<string, string> = {
  moderne: 'Moderne / Contemporain',
  classique: 'Classique / Haussmannien',
  industriel: 'Industriel / Loft',
  scandinave: 'Scandinave / Minimaliste',
  autre: 'Autre / Pas encore décidé',
}

const URGENCY_LABELS: Record<string, string> = {
  urgent: 'Dès que possible (sous 1 mois)',
  normal: 'Dans les prochains mois (1 à 3 mois)',
  flexible: 'Pas pressé (3 mois et plus)',
  exploring: 'Phase exploratoire',
}

// ─── Build prompt ────────────────────────────────────────────────────────────

const buildPrompt = (input: QuestionnaireInput): string => {
  const propertyLabel = PROPERTY_TYPE_LABELS[input.propertyType as PropertyType] || input.propertyType
  const renovationLabel = RENOVATION_LABELS[input.renovationType] || input.renovationType
  const roomLabels = input.rooms.map((r) => ROOM_LABELS[r] || r)
  const constraintLabels = input.constraints.map((c) => CONSTRAINT_LABELS[c] || c)
  const styleLabel = STYLE_LABELS[input.style] || input.style || 'Non précisé'
  const budgetLabel = BUDGET_RANGE_LABELS[input.budgetRange as BudgetRange] || input.budgetRange
  const urgencyLabel = URGENCY_LABELS[input.urgency] || input.urgency

  return `Tu es un assistant expert en maîtrise d'oeuvre et rénovation immobilière en France.
Tu reçois les réponses d'un questionnaire rempli par un client qui souhaite rénover son bien.

Ton rôle est de produire une **fiche projet structurée** (PAS un cahier des charges) qui résume et qualifie le projet.

RÈGLES STRICTES :
- Tu ne dois JAMAIS estimer un budget, un coût ou un délai.
- Tu ne dois JAMAIS recommander des prestataires ou artisans.
- Tu dois rester factuel et structuré.
- Tu rédiges en français, de manière professionnelle mais accessible.

DONNÉES DU QUESTIONNAIRE :
- Type de bien : ${propertyLabel}
- Type de travaux : ${renovationLabel}
- Surface : ${input.surface ? input.surface + ' m²' : 'Non précisée'}
- Pièces concernées : ${roomLabels.length > 0 ? roomLabels.join(', ') : 'Non précisées'}
- Description des travaux : ${input.workDescription}
- Contraintes identifiées : ${constraintLabels.length > 0 ? constraintLabels.join(', ') : 'Aucune'}
- Style souhaité : ${styleLabel}
- Enveloppe budgétaire indicative : ${budgetLabel}
- Calendrier souhaité : ${urgencyLabel}
- Localisation : ${input.postalCode} ${input.city}

PRODUIS une fiche projet au format suivant (en Markdown) :

## Synthèse du projet
Un paragraphe résumant le projet dans son ensemble.

## Détail des travaux identifiés
Liste structurée des travaux à réaliser, organisés par pièce ou par lot technique.

## Points d'attention
Éléments importants à prendre en compte (contraintes, risques, particularités).

## Prochaines étapes recommandées
Actions concrètes à mener pour avancer (visite technique, obtention de devis, etc.).

Réponds UNIQUEMENT avec le contenu Markdown de la fiche projet, sans préambule ni commentaire.`
}

// ─── Generate project sheet ──────────────────────────────────────────────────

export const generateProjectSheet = async (input: QuestionnaireInput): Promise<ProjectSheet> => {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: buildPrompt(input),
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  const structuredSummary = textBlock.text

  // Build the AiProjectSummary from the input data
  const summary: AiProjectSummary = {
    propertyType: input.propertyType,
    surface: input.surface ? parseFloat(input.surface) : null,
    rooms: input.rooms,
    renovationType: input.renovationType,
    workDescription: input.workDescription,
    constraints: input.constraints,
    style: input.style,
    budgetRange: input.budgetRange,
    urgency: input.urgency,
    additionalNotes: '',
  }

  // Generate a title from property type + renovation type + city
  const propertyLabel = PROPERTY_TYPE_LABELS[input.propertyType as PropertyType] || input.propertyType
  const renovationLabel = RENOVATION_LABELS[input.renovationType] || input.renovationType
  const title = `${renovationLabel} — ${propertyLabel} à ${input.city}`

  return {
    title,
    summary,
    structuredSummary,
  }
}

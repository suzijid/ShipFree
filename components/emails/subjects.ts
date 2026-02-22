import { getBrandConfig } from '@/config/branding'

/** Email subject type for all supported email templates */
export type EmailSubjectType =
  | 'sign-in'
  | 'email-verification'
  | 'forget-password'
  | 'reset-password'
  | 'invitation'
  | 'welcome'
  | 'new-message'
  | 'new-proposal'
  | 'payment-due'
  | 'phase-changed'
  | 'document-uploaded'

/**
 * Returns the email subject line for a given email type.
 * @param type - The type of email being sent
 * @returns The subject line for the email
 */
export function getEmailSubject(type: EmailSubjectType): string {
  const brandName = getBrandConfig().name

  switch (type) {
    case 'sign-in':
      return `Sign in to ${brandName}`
    case 'email-verification':
      return `Verify your email for ${brandName}`
    case 'forget-password':
      return `Reset your ${brandName} password`
    case 'reset-password':
      return `Reset your ${brandName} password`
    case 'invitation':
      return `You've been invited to join a team on ${brandName}`
    case 'welcome':
      return `Welcome to ${brandName}`
    case 'new-message':
      return `Nouveau message dans votre projet — ${brandName}`
    case 'new-proposal':
      return `Nouveau devis reçu — ${brandName}`
    case 'payment-due':
      return `Paiement en attente — ${brandName}`
    case 'phase-changed':
      return `Changement de phase projet — ${brandName}`
    case 'document-uploaded':
      return `Nouveau document ajouté — ${brandName}`
    default:
      return brandName
  }
}

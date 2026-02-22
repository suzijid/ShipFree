import { Link, Text } from '@react-email/components'

import { baseStyles } from '@/components/emails/_styles'
import { getBaseUrl } from '@/lib/utils'
import { EmailLayout } from '../components/email-layout'

interface PhaseChangedEmailProps {
  projectTitle: string
  phaseName: string
  projectLink: string
}

export function PhaseChangedEmail({
  projectTitle,
  phaseName,
  projectLink,
}: PhaseChangedEmailProps) {
  const baseUrl = getBaseUrl()

  return (
    <EmailLayout preview={`Votre projet ${projectTitle} passe en phase ${phaseName}`}>
      <Text style={{ ...baseStyles.paragraph, marginTop: 0 }}>Bonjour,</Text>
      <Text style={baseStyles.paragraph}>
        Votre projet <strong>{projectTitle}</strong> vient de passer en phase{' '}
        <strong>{phaseName}</strong>.
      </Text>

      <Text
        style={{
          ...baseStyles.paragraph,
          backgroundColor: '#f8f9fa',
          padding: '12px 16px',
          borderRadius: '6px',
          textAlign: 'center' as const,
          fontSize: '16px',
        }}
      >
        Nouvelle phase : <strong>{phaseName}</strong>
      </Text>

      <Link href={`${baseUrl}${projectLink}`} style={{ textDecoration: 'none' }}>
        <Text style={baseStyles.button}>Voir le projet</Text>
      </Link>

      <Text style={baseStyles.paragraph}>
        Connectez-vous pour consulter les prochaines étapes de votre projet.
      </Text>
    </EmailLayout>
  )
}

export default PhaseChangedEmail

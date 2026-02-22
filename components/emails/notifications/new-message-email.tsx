import { Link, Text } from '@react-email/components'

import { baseStyles } from '@/components/emails/_styles'
import { getBaseUrl } from '@/lib/utils'
import { EmailLayout } from '../components/email-layout'

interface NewMessageEmailProps {
  senderName: string
  projectTitle: string
  messagePreview?: string
  projectLink: string
}

export function NewMessageEmail({
  senderName,
  projectTitle,
  messagePreview,
  projectLink,
}: NewMessageEmailProps) {
  const baseUrl = getBaseUrl()

  return (
    <EmailLayout preview={`Nouveau message de ${senderName} dans votre projet ${projectTitle}`}>
      <Text style={{ ...baseStyles.paragraph, marginTop: 0 }}>Bonjour,</Text>
      <Text style={baseStyles.paragraph}>
        <strong>{senderName}</strong> vous a envoyé un message dans le projet{' '}
        <strong>{projectTitle}</strong>.
      </Text>

      {messagePreview && (
        <Text
          style={{
            ...baseStyles.paragraph,
            backgroundColor: '#f8f9fa',
            padding: '12px 16px',
            borderRadius: '6px',
            borderLeft: '3px solid #b8960c',
          }}
        >
          &ldquo;{messagePreview}&rdquo;
        </Text>
      )}

      <Link href={`${baseUrl}${projectLink}`} style={{ textDecoration: 'none' }}>
        <Text style={baseStyles.button}>Voir le message</Text>
      </Link>

      <Text style={baseStyles.paragraph}>
        Vous recevez cet email car vous participez au projet {projectTitle} sur Gradia.
      </Text>
    </EmailLayout>
  )
}

export default NewMessageEmail

import { Link, Text } from '@react-email/components'

import { baseStyles } from '@/components/emails/_styles'
import { getBaseUrl } from '@/lib/utils'
import { EmailLayout } from '../components/email-layout'

interface DocumentUploadedEmailProps {
  projectTitle: string
  documentName: string
  uploaderName?: string
  projectLink: string
}

export function DocumentUploadedEmail({
  projectTitle,
  documentName,
  uploaderName,
  projectLink,
}: DocumentUploadedEmailProps) {
  const baseUrl = getBaseUrl()

  return (
    <EmailLayout preview={`Nouveau document ajouté à votre projet ${projectTitle}`}>
      <Text style={{ ...baseStyles.paragraph, marginTop: 0 }}>Bonjour,</Text>
      <Text style={baseStyles.paragraph}>
        Un nouveau document a été ajouté au projet <strong>{projectTitle}</strong>
        {uploaderName && (
          <> par <strong>{uploaderName}</strong></>
        )}
        .
      </Text>

      <Text
        style={{
          ...baseStyles.paragraph,
          backgroundColor: '#f8f9fa',
          padding: '12px 16px',
          borderRadius: '6px',
        }}
      >
        Document : <strong>{documentName}</strong>
      </Text>

      <Link href={`${baseUrl}${projectLink}`} style={{ textDecoration: 'none' }}>
        <Text style={baseStyles.button}>Voir les documents</Text>
      </Link>

      <Text style={baseStyles.paragraph}>
        Connectez-vous pour consulter le document.
      </Text>
    </EmailLayout>
  )
}

export default DocumentUploadedEmail

import { Link, Text } from '@react-email/components'

import { baseStyles } from '@/components/emails/_styles'
import { getBaseUrl } from '@/lib/utils'
import { EmailLayout } from '../components/email-layout'

interface NewProposalEmailProps {
  projectTitle: string
  contractorName?: string
  amount?: string
  projectLink: string
}

export function NewProposalEmail({
  projectTitle,
  contractorName,
  amount,
  projectLink,
}: NewProposalEmailProps) {
  const baseUrl = getBaseUrl()

  return (
    <EmailLayout preview={`Nouveau devis reçu pour votre projet ${projectTitle}`}>
      <Text style={{ ...baseStyles.paragraph, marginTop: 0 }}>Bonjour,</Text>
      <Text style={baseStyles.paragraph}>
        Un nouveau devis a été soumis pour votre projet <strong>{projectTitle}</strong>
        {contractorName && (
          <> par <strong>{contractorName}</strong></>
        )}
        .
      </Text>

      {amount && (
        <Text
          style={{
            ...baseStyles.paragraph,
            backgroundColor: '#f8f9fa',
            padding: '12px 16px',
            borderRadius: '6px',
            textAlign: 'center' as const,
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          Montant : {amount} &euro;
        </Text>
      )}

      <Link href={`${baseUrl}${projectLink}`} style={{ textDecoration: 'none' }}>
        <Text style={baseStyles.button}>Consulter le devis</Text>
      </Link>

      <Text style={baseStyles.paragraph}>
        Connectez-vous pour examiner et accepter ou refuser cette proposition.
      </Text>
    </EmailLayout>
  )
}

export default NewProposalEmail

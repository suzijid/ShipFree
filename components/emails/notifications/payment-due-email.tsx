import { Link, Text } from '@react-email/components'

import { baseStyles } from '@/components/emails/_styles'
import { getBaseUrl } from '@/lib/utils'
import { EmailLayout } from '../components/email-layout'

interface PaymentDueEmailProps {
  projectTitle: string
  milestoneLabel: string
  amount: string
  dueDate?: string
  projectLink: string
}

export function PaymentDueEmail({
  projectTitle,
  milestoneLabel,
  amount,
  dueDate,
  projectLink,
}: PaymentDueEmailProps) {
  const baseUrl = getBaseUrl()

  return (
    <EmailLayout preview={`Paiement en attente : ${milestoneLabel} — ${amount}€`}>
      <Text style={{ ...baseStyles.paragraph, marginTop: 0 }}>Bonjour,</Text>
      <Text style={baseStyles.paragraph}>
        Un paiement est en attente pour votre projet <strong>{projectTitle}</strong>.
      </Text>

      <table
        cellPadding={0}
        cellSpacing={0}
        style={{
          backgroundColor: '#f8f9fa',
          padding: '16px',
          borderRadius: '6px',
          width: '100%',
          margin: '16px 0',
        }}
      >
        <tbody>
          <tr>
            <td style={{ ...baseStyles.paragraph, margin: 0, padding: '4px 16px' }}>
              <strong>Jalon :</strong> {milestoneLabel}
            </td>
          </tr>
          <tr>
            <td style={{ ...baseStyles.paragraph, margin: 0, padding: '4px 16px' }}>
              <strong>Montant :</strong> {amount} &euro;
            </td>
          </tr>
          {dueDate && (
            <tr>
              <td style={{ ...baseStyles.paragraph, margin: 0, padding: '4px 16px' }}>
                <strong>&Eacute;ch&eacute;ance :</strong> {dueDate}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Link href={`${baseUrl}${projectLink}`} style={{ textDecoration: 'none' }}>
        <Text style={baseStyles.button}>Voir les finances</Text>
      </Link>

      <Text style={baseStyles.paragraph}>
        Connectez-vous pour consulter les détails et effectuer le paiement.
      </Text>
    </EmailLayout>
  )
}

export default PaymentDueEmail

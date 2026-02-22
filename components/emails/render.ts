import { render } from '@react-email/components'
import { OTPVerificationEmail, ResetPasswordEmail, WelcomeEmail } from '@/components/emails/auth'
import {
  NewMessageEmail,
  NewProposalEmail,
  PaymentDueEmail,
  PhaseChangedEmail,
  DocumentUploadedEmail,
} from '@/components/emails/notifications'

export type { EmailSubjectType } from './subjects'
export { getEmailSubject } from './subjects'

export async function renderOTPEmail(
  otp: string,
  email: string,
  type: 'sign-in' | 'email-verification' | 'forget-password' = 'email-verification'
): Promise<string> {
  return await render(OTPVerificationEmail({ otp, email, type }))
}

export async function renderPasswordResetEmail(
  username: string,
  resetLink: string
): Promise<string> {
  return await render(ResetPasswordEmail({ username, resetLink }))
}

export async function renderWelcomeEmail(userName?: string): Promise<string> {
  return await render(WelcomeEmail({ userName }))
}

// ── Notification email render functions ─────────────────────────────────

export async function renderNewMessageEmail(params: {
  senderName: string
  projectTitle: string
  messagePreview?: string
  projectLink: string
}): Promise<string> {
  return await render(NewMessageEmail(params))
}

export async function renderNewProposalEmail(params: {
  projectTitle: string
  contractorName?: string
  amount?: string
  projectLink: string
}): Promise<string> {
  return await render(NewProposalEmail(params))
}

export async function renderPaymentDueEmail(params: {
  projectTitle: string
  milestoneLabel: string
  amount: string
  dueDate?: string
  projectLink: string
}): Promise<string> {
  return await render(PaymentDueEmail(params))
}

export async function renderPhaseChangedEmail(params: {
  projectTitle: string
  phaseName: string
  projectLink: string
}): Promise<string> {
  return await render(PhaseChangedEmail(params))
}

export async function renderDocumentUploadedEmail(params: {
  projectTitle: string
  documentName: string
  uploaderName?: string
  projectLink: string
}): Promise<string> {
  return await render(DocumentUploadedEmail(params))
}

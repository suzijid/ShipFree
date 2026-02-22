'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'
import { client } from '@/lib/auth/auth-client'
import { cn, getBaseUrl } from '@/lib/utils'
import { quickValidateEmail } from '@/lib/messaging/email/validation'
import { SocialLoginButtons } from '../components/social-login-buttons'

const validateEmailField = (emailValue: string): string[] => {
  const errors: string[] = []

  if (!emailValue || !emailValue.trim()) {
    errors.push('L\'email est requis.')
    return errors
  }

  const validation = quickValidateEmail(emailValue.trim().toLowerCase())
  if (!validation.isValid) {
    errors.push(validation.reason || 'Veuillez entrer une adresse email valide.')
  }

  return errors
}

const PASSWORD_VALIDATIONS = {
  required: {
    test: (value: string) => Boolean(value && typeof value === 'string'),
    message: 'Le mot de passe est requis.',
  },
  notEmpty: {
    test: (value: string) => value.trim().length > 0,
    message: 'Le mot de passe ne peut pas être vide.',
  },
}

const validateCallbackUrl = (url: string): boolean => {
  try {
    if (url.startsWith('/')) {
      return true
    }

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    if (url.startsWith(currentOrigin)) {
      return true
    }

    return false
  } catch (error) {
    console.error('Error validating callback URL:', { error, url })
    return false
  }
}

const validatePassword = (passwordValue: string): string[] => {
  const errors: string[] = []

  if (!PASSWORD_VALIDATIONS.required.test(passwordValue)) {
    errors.push(PASSWORD_VALIDATIONS.required.message)
    return errors
  }

  if (!PASSWORD_VALIDATIONS.notEmpty.test(passwordValue)) {
    errors.push(PASSWORD_VALIDATIONS.notEmpty.message)
    return errors
  }

  return errors
}

export default function LoginPage({
  githubAvailable,
  googleAvailable,
  facebookAvailable,
  microsoftAvailable,
  isProduction,
}: {
  githubAvailable: boolean
  googleAvailable: boolean
  facebookAvailable: boolean
  microsoftAvailable: boolean
  isProduction: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [_mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [showValidationError, setShowValidationError] = useState(false)

  const [callbackUrl, setCallbackUrl] = useState('/dashboard')

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [isSubmittingReset, setIsSubmittingReset] = useState(false)
  const [resetStatus, setResetStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const [email, setEmail] = useState('')
  const [emailErrors, setEmailErrors] = useState<string[]>([])
  const [showEmailValidationError, setShowEmailValidationError] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (!searchParams) {
      return
    }

    const callback = searchParams.get('callbackUrl')
    if (!callback) {
      return
    }

    if (validateCallbackUrl(callback)) {
      setCallbackUrl(callback)
    } else {
      console.warn('Invalid callback URL detected and blocked:', { url: callback })
    }
  }, [searchParams])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && forgotPasswordOpen) {
        handleForgotPassword()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [forgotPasswordEmail, forgotPasswordOpen])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)

    const errors = validateEmailField(newEmail)
    setEmailErrors(errors)
    setShowEmailValidationError(false)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)

    const errors = validatePassword(newPassword)
    setPasswordErrors(errors)
    setShowValidationError(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const emailRaw = formData.get('email') as string
    const email = emailRaw.trim().toLowerCase()

    const emailValidationErrors = validateEmailField(email)
    setEmailErrors(emailValidationErrors)
    setShowEmailValidationError(emailValidationErrors.length > 0)

    const passwordValidationErrors = validatePassword(password)
    setPasswordErrors(passwordValidationErrors)
    setShowValidationError(passwordValidationErrors.length > 0)

    if (emailValidationErrors.length > 0 || passwordValidationErrors.length > 0) {
      setIsLoading(false)
      return
    }

    try {
      const safeCallbackUrl = validateCallbackUrl(callbackUrl) ? callbackUrl : '/dashboard'

      const result = await client.signIn.email(
        {
          email,
          password,
          callbackURL: safeCallbackUrl,
        },
        {
          onError: (ctx) => {
            console.error('Login error:', ctx.error)
            const errorMessage: string[] = ['Invalid email or password']

            if (ctx.error.code?.includes('EMAIL_NOT_VERIFIED')) {
              return
            }
            if (
              ctx.error.code?.includes('BAD_REQUEST') ||
              ctx.error.message?.includes('Email and password sign in is not enabled')
            ) {
              errorMessage.push('Email sign in is currently disabled.')
            } else if (
              ctx.error.code?.includes('INVALID_CREDENTIALS') ||
              ctx.error.message?.includes('invalid password')
            ) {
              errorMessage.push('Invalid email or password. Please try again.')
            } else if (
              ctx.error.code?.includes('USER_NOT_FOUND') ||
              ctx.error.message?.includes('not found')
            ) {
              errorMessage.push('No account found with this email. Please sign up first.')
            } else if (ctx.error.code?.includes('MISSING_CREDENTIALS')) {
              errorMessage.push('Please enter both email and password.')
            } else if (ctx.error.code?.includes('EMAIL_PASSWORD_DISABLED')) {
              errorMessage.push('Email and password login is disabled.')
            } else if (ctx.error.code?.includes('FAILED_TO_CREATE_SESSION')) {
              errorMessage.push('Failed to create session. Please try again later.')
            } else if (ctx.error.code?.includes('too many attempts')) {
              errorMessage.push(
                'Too many login attempts. Please try again later or reset your password.'
              )
            } else if (ctx.error.code?.includes('account locked')) {
              errorMessage.push(
                'Your account has been locked for security. Please reset your password.'
              )
            } else if (ctx.error.code?.includes('network')) {
              errorMessage.push('Network error. Please check your connection and try again.')
            } else if (ctx.error.message?.includes('rate limit')) {
              errorMessage.push('Too many requests. Please wait a moment before trying again.')
            }

            setPasswordErrors(errorMessage)
            setShowValidationError(true)
          },
        }
      )

      if (!result || result.error) {
        setIsLoading(false)
        return
      }

      // Redirect after successful login
      router.push(safeCallbackUrl)
    } catch (err: any) {
      if (err.message?.includes('not verified') || err.code?.includes('EMAIL_NOT_VERIFIED')) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('verificationEmail', email)
        }
        router.push('/verify')
        return
      }

      console.error('Uncaught login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setResetStatus({
        type: 'error',
        message: 'Veuillez entrer votre adresse email',
      })
      return
    }

    const emailValidation = quickValidateEmail(forgotPasswordEmail.trim().toLowerCase())
    if (!emailValidation.isValid) {
      setResetStatus({
        type: 'error',
        message: 'Veuillez entrer une adresse email valide',
      })
      return
    }

    try {
      setIsSubmittingReset(true)
      setResetStatus({ type: null, message: '' })

      const response = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          redirectTo: `${getBaseUrl()}/reset-password`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        let errorMessage = errorData.message || 'Failed to request password reset'

        if (
          errorMessage.includes('Invalid body parameters') ||
          errorMessage.includes('invalid email')
        ) {
          errorMessage = 'Please enter a valid email address'
        } else if (errorMessage.includes('Email is required')) {
          errorMessage = 'Please enter your email address'
        } else if (
          errorMessage.includes('user not found') ||
          errorMessage.includes('User not found')
        ) {
          errorMessage = 'No account found with this email address'
        }

        throw new Error(errorMessage)
      }

      setResetStatus({
        type: 'success',
        message: 'Lien de réinitialisation envoyé par email',
      })

      setTimeout(() => {
        setForgotPasswordOpen(false)
        setResetStatus({ type: null, message: '' })
      }, 2000)
    } catch (error) {
      console.error('Error requesting password reset:', { error })
      setResetStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to request password reset',
      })
    } finally {
      setIsSubmittingReset(false)
    }
  }

  const hasSocial = githubAvailable || googleAvailable
  const showDivider = hasSocial

  const inputClasses = 'border-0 border-b border-[#e0e0e0] rounded-none px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc]'
  const labelClasses = 'uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'

  return (
    <>
      <div className='text-center'>
        <h1 className='uppercase tracking-[0.2em] text-[13px] font-normal text-[#202020]'>
          Connexion
        </h1>
      </div>

      <form onSubmit={onSubmit} className='mt-10 space-y-8'>
        <div className='space-y-6'>
          <div className='space-y-1'>
            <label htmlFor='email' className={labelClasses}>
              Adresse email
            </label>
            <input
              id='email'
              name='email'
              placeholder='votre@email.fr'
              required
              autoCapitalize='none'
              autoComplete='email'
              autoCorrect='off'
              value={email}
              onChange={handleEmailChange}
              className={cn(
                inputClasses,
                showEmailValidationError &&
                  emailErrors.length > 0 &&
                  'border-red-500 focus:border-red-500'
              )}
            />
            {showEmailValidationError && emailErrors.length > 0 && (
              <div className='mt-1 space-y-1 text-red-400 text-[11px]'>
                {emailErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
          <div className='space-y-1'>
            <div className='flex items-center justify-between'>
              <label htmlFor='password' className={labelClasses}>
                Mot de passe
              </label>
              <button
                type='button'
                onClick={() => setForgotPasswordOpen(true)}
                className='uppercase text-[11px] tracking-[0.1em] text-[#999] hover:text-[#202020] transition-colors'
              >
                Mot de passe oubli&eacute; ?
              </button>
            </div>
            <div className='relative'>
              <input
                id='password'
                name='password'
                required
                type={showPassword ? 'text' : 'password'}
                autoCapitalize='none'
                autoComplete='current-password'
                autoCorrect='off'
                placeholder='Votre mot de passe'
                value={password}
                onChange={handlePasswordChange}
                className={cn(
                  inputClasses,
                  'pr-10',
                  showValidationError &&
                    passwordErrors.length > 0 &&
                    'border-red-500 focus:border-red-500'
                )}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='-translate-y-1/2 absolute top-1/2 right-0 text-[#999] transition hover:text-[#202020]'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {showValidationError && passwordErrors.length > 0 && (
              <div className='mt-1 space-y-1 text-red-400 text-[11px]'>
                {passwordErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type='submit'
          className='bg-[#202020] text-white rounded-none uppercase tracking-[0.15em] text-[13px] font-normal h-12 w-full hover:bg-[#333] transition-colors disabled:opacity-50'
          disabled={isLoading}
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      {showDivider && (
        <div className='relative my-8'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-[#e0e0e0]' />
          </div>
          <div className='relative flex justify-center'>
            <span className='bg-white px-4 text-[12px] text-[#999]'>ou</span>
          </div>
        </div>
      )}

      {hasSocial && (
        <div>
          <SocialLoginButtons
            googleAvailable={googleAvailable}
            githubAvailable={githubAvailable}
            facebookAvailable={facebookAvailable}
            microsoftAvailable={microsoftAvailable}
            isProduction={isProduction}
            callbackURL={callbackUrl}
          />
        </div>
      )}

      <div className='pt-8 text-center'>
        <span className='text-[13px] text-[#999]'>Pas encore de compte ?{' '}</span>
        <Link
          href={`/register?callbackUrl=${callbackUrl}`}
          className='text-[13px] text-[#202020] underline underline-offset-4 hover:text-[#000] transition-colors'
        >
          Cr&eacute;er un compte
        </Link>
      </div>

      <div className='mt-8 text-center text-[11px] leading-relaxed text-[#999]'>
        En vous connectant, vous acceptez nos{' '}
        <Link
          href='/terms'
          target='_blank'
          rel='noopener noreferrer'
          className='underline underline-offset-2 hover:text-[#202020] transition-colors'
        >
          Conditions d&apos;utilisation
        </Link>{' '}
        et notre{' '}
        <Link
          href='/privacy'
          target='_blank'
          rel='noopener noreferrer'
          className='underline underline-offset-2 hover:text-[#202020] transition-colors'
        >
          Politique de confidentialit&eacute;
        </Link>
      </div>

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle className='uppercase tracking-[0.2em] text-[13px] font-normal text-[#202020]'>
              Mot de passe oubli&eacute;
            </DialogTitle>
            <DialogDescription className='text-[12px] text-[#999] mt-2'>
              Entrez votre adresse email et nous vous enverrons un lien pour r&eacute;initialiser votre mot de passe.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className='space-y-4'>
            <div className='space-y-1'>
              <label htmlFor='reset-email' className={labelClasses}>
                Adresse email
              </label>
              <input
                id='reset-email'
                value={forgotPasswordEmail}
                onChange={(event) => setForgotPasswordEmail(event.target.value)}
                placeholder='votre@email.fr'
                type='email'
                className={cn(
                  inputClasses,
                  resetStatus.type === 'error' &&
                    'border-red-500 focus:border-red-500'
                )}
              />
              {resetStatus.type === 'error' && (
                <div className='mt-1 space-y-1 text-[11px] text-red-400'>
                  <p>{resetStatus.message}</p>
                </div>
              )}
            </div>
            {resetStatus.type === 'success' && (
              <div className='mt-1 space-y-1 text-[11px] text-[#4CAF50]'>
                <p>{resetStatus.message}</p>
              </div>
            )}
          </DialogPanel>
          <DialogFooter>
            <button
              type='button'
              onClick={handleForgotPassword}
              className='bg-[#202020] text-white rounded-none uppercase tracking-[0.15em] text-[13px] font-normal h-12 w-full hover:bg-[#333] transition-colors disabled:opacity-50'
              disabled={isSubmittingReset}
            >
              {isSubmittingReset ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </>
  )
}

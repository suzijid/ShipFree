'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { client } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'
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
  minLength: {
    test: (value: string) => value.length >= 8,
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  },
}

const validatePassword = (passwordValue: string): string[] => {
  const errors: string[] = []

  if (!PASSWORD_VALIDATIONS.minLength.test(passwordValue)) {
    errors.push(PASSWORD_VALIDATIONS.minLength.message)
  }

  return errors
}

export default function RegisterForm({
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
  const [, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [showValidationError, setShowValidationError] = useState(false)

  const [name, setName] = useState('')
  const [nameErrors, setNameErrors] = useState<string[]>([])
  const [showNameValidationError, setShowNameValidationError] = useState(false)

  const [email, setEmail] = useState('')
  const [emailErrors, setEmailErrors] = useState<string[]>([])
  const [showEmailValidationError, setShowEmailValidationError] = useState(false)

  const [callbackUrl, setCallbackUrl] = useState('/dashboard')

  useEffect(() => {
    setMounted(true)

    if (!searchParams) {
      return
    }

    const callback = searchParams.get('callbackUrl')
    if (callback?.startsWith('/')) {
      setCallbackUrl(callback)
    }
  }, [searchParams])

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setName(value)

    const trimmed = value.trim()
    const errors: string[] = []

    if (!trimmed) {
      errors.push('Le nom est requis.')
    }

    setNameErrors(errors)
    setShowNameValidationError(false)
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value
    setEmail(newEmail)

    const errors = validateEmailField(newEmail)
    setEmailErrors(errors)
    setShowEmailValidationError(false)
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value
    setPassword(newPassword)

    const errors = validatePassword(newPassword)
    setPasswordErrors(errors)
    setShowValidationError(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const emailRaw = formData.get('email') as string
    const emailValue = emailRaw.trim().toLowerCase()
    const passwordValue = password
    const nameValue = (formData.get('name') as string).trim()

    const nameValidationErrors: string[] = []
    if (!nameValue) {
      nameValidationErrors.push('Name is required.')
    }
    setNameErrors(nameValidationErrors)
    setShowNameValidationError(nameValidationErrors.length > 0)

    const emailValidationErrors = validateEmailField(emailValue)
    setEmailErrors(emailValidationErrors)
    setShowEmailValidationError(emailValidationErrors.length > 0)

    const passwordValidationErrors = validatePassword(passwordValue)
    setPasswordErrors(passwordValidationErrors)
    setShowValidationError(passwordValidationErrors.length > 0)

    if (
      nameValidationErrors.length > 0 ||
      emailValidationErrors.length > 0 ||
      passwordValidationErrors.length > 0
    ) {
      setIsLoading(false)
      return
    }

    try {
      const response = await client.signUp.email(
        {
          email: emailValue,
          password: passwordValue,
          name: nameValue,
        },
        {}
      )

      if (!response || response.error) {
        setIsLoading(false)
        return
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('verificationEmail', emailValue)
      }

      router.push('/verify?fromSignup=true')
    } catch (error) {
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const hasSocial = githubAvailable || googleAvailable || facebookAvailable || microsoftAvailable
  const showDivider = hasSocial

  const inputClasses = 'border-0 border-b border-[#e0e0e0] rounded-none px-0 py-3 text-sm text-[#202020] bg-transparent focus:border-[#202020] focus:outline-none transition-colors w-full placeholder:text-[#ccc]'
  const labelClasses = 'uppercase text-[11px] tracking-[0.15em] text-[#999] font-normal'

  return (
    <>
      <div className='text-center'>
        <h1 className='uppercase tracking-[0.2em] text-[13px] font-normal text-[#202020]'>
          Cr&eacute;er un compte
        </h1>
        {searchParams?.get('from') === 'questionnaire' && (
          <p className='mt-2 text-[12px] text-[#999]'>
            Cr&eacute;ez votre compte pour recevoir votre fiche projet
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className='mt-10 space-y-8'>
        <div className='space-y-6'>
          <div className='space-y-1'>
            <label htmlFor='name' className={labelClasses}>
              Nom complet
            </label>
            <input
              id='name'
              name='name'
              placeholder='Votre nom'
              autoCapitalize='words'
              autoComplete='name'
              value={name}
              onChange={handleNameChange}
              className={cn(
                inputClasses,
                showNameValidationError &&
                  nameErrors.length > 0 &&
                  'border-red-500 focus:border-red-500'
              )}
            />
            {showNameValidationError && nameErrors.length > 0 && (
              <div className='mt-1 space-y-1 text-[11px] text-red-400'>
                {nameErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

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
              <div className='mt-1 space-y-1 text-[11px] text-red-400'>
                {emailErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          <div className='space-y-1'>
            <label htmlFor='password' className={labelClasses}>
              Mot de passe
            </label>
            <div className='relative'>
              <input
                id='password'
                name='password'
                required
                type={showPassword ? 'text' : 'password'}
                autoCapitalize='none'
                autoComplete='new-password'
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
              <div className='mt-1 space-y-1 text-[11px] text-red-400'>
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
          {isLoading ? 'Cr\u00e9ation en cours...' : 'Cr\u00e9er mon compte'}
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
        <span className='text-[13px] text-[#999]'>D&eacute;j&agrave; un compte ?{' '}</span>
        <Link
          href={`/login?callbackUrl=${callbackUrl}`}
          className='text-[13px] text-[#202020] underline underline-offset-4 hover:text-[#000] transition-colors'
        >
          Se connecter
        </Link>
      </div>

      <div className='mt-8 text-center text-[11px] leading-relaxed text-[#999]'>
        En cr&eacute;ant un compte, vous acceptez nos{' '}
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
    </>
  )
}

'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { GitHubIcon, GoogleIcon, MicrosoftIcon, FacebookIcon } from './icons'
import { client } from '@/lib/auth/auth-client'

interface SocialLoginButtonsProps {
  githubAvailable: boolean
  googleAvailable: boolean
  microsoftAvailable: boolean
  facebookAvailable: boolean
  callbackURL?: string
  isProduction: boolean
  children?: ReactNode
}

export function SocialLoginButtons({
  githubAvailable,
  googleAvailable,
  microsoftAvailable,
  facebookAvailable,
  callbackURL = '/dashboard',
  children,
}: SocialLoginButtonsProps) {
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)
  const [isFacebookLoading, setIsFacebookLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render on the client side to avoid hydration errors
  if (!mounted) return null

  async function signInWithGithub() {
    if (!githubAvailable) return

    setIsGithubLoading(true)
    try {
      await client.signIn.social({ provider: 'github', callbackURL })
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with GitHub'

      if (err.message?.includes('account exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (err.message?.includes('cancelled')) {
        errorMessage = 'GitHub sign in was cancelled. Please try again.'
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (err.message?.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.'
      }
    } finally {
      setIsGithubLoading(false)
    }
  }

  async function signInWithGoogle() {
    if (!googleAvailable) return

    setIsGoogleLoading(true)
    try {
      await client.signIn.social({ provider: 'google', callbackURL })
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with Google'

      if (err.message?.includes('account exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (err.message?.includes('cancelled')) {
        errorMessage = 'Google sign in was cancelled. Please try again.'
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (err.message?.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.'
      }
    } finally {
      setIsGoogleLoading(false)
    }
  }

  async function signInWithMicrosoft() {
    if (!microsoftAvailable) return

    setIsMicrosoftLoading(true)
    try {
      await client.signIn.social({ provider: 'microsoft', callbackURL })
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with Microsoft'

      if (err.message?.includes('account exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (err.message?.includes('cancelled')) {
        errorMessage = 'Microsoft sign in was cancelled. Please try again.'
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (err.message?.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.'
      }
    } finally {
      setIsMicrosoftLoading(false)
    }
  }

  async function signInWithFacebook() {
    if (!facebookAvailable) return

    setIsFacebookLoading(true)
    try {
      await client.signIn.social({ provider: 'facebook', callbackURL })
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with Facebook'

      if (err.message?.includes('account exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (err.message?.includes('cancelled')) {
        errorMessage = 'Facebook sign in was cancelled. Please try again.'
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (err.message?.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.'
      }
    } finally {
      setIsFacebookLoading(false)
    }
  }

  const btnClasses = 'flex items-center justify-center gap-2 border border-[#202020] rounded-none bg-transparent text-[#202020] uppercase tracking-[0.15em] text-[13px] font-normal h-12 w-full hover:bg-[#f5f5f5] transition-colors disabled:opacity-50 cursor-pointer'

  const githubButton = (
    <button
      className={btnClasses}
      disabled={!githubAvailable || isGithubLoading}
      onClick={signInWithGithub}
    >
      <GitHubIcon className='h-[18px] w-[18px]' />
      {isGithubLoading ? 'Connexion...' : 'GitHub'}
    </button>
  )

  const googleButton = (
    <button
      className={btnClasses}
      disabled={!googleAvailable || isGoogleLoading}
      onClick={signInWithGoogle}
    >
      <GoogleIcon className='h-[18px] w-[18px]' />
      {isGoogleLoading ? 'Connexion...' : 'Google'}
    </button>
  )

  const microsoftButton = (
    <button
      className={btnClasses}
      disabled={!microsoftAvailable || isMicrosoftLoading}
      onClick={signInWithMicrosoft}
    >
      <MicrosoftIcon className='h-[18px] w-[18px]' />
      {isMicrosoftLoading ? 'Connexion...' : 'Microsoft'}
    </button>
  )

  const facebookButton = (
    <button
      className={btnClasses}
      disabled={!facebookAvailable || isFacebookLoading}
      onClick={signInWithFacebook}
    >
      <FacebookIcon className='h-[18px] w-[18px]' />
      {isFacebookLoading ? 'Connexion...' : 'Facebook'}
    </button>
  )

  const hasAnyOAuthProvider = githubAvailable || googleAvailable

  if (!hasAnyOAuthProvider && !children) {
    return null
  }

  return (
    <div className='grid gap-3'>
      {googleAvailable && googleButton}
      {githubAvailable && githubButton}
      {microsoftAvailable && microsoftButton}
      {facebookAvailable && facebookButton}
      {children}
    </div>
  )
}

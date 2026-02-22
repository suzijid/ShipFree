'use client'

import { useEffect } from 'react'

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center p-6'>
      <h2 className='text-lg font-semibold text-[#1a1a2e] mb-2'>
        Une erreur est survenue
      </h2>
      <p className='text-sm text-[#6b6b6b] mb-6 text-center max-w-md'>
        Un problème inattendu s&apos;est produit. Veuillez réessayer ou contacter le support si le problème persiste.
      </p>
      <button
        onClick={reset}
        className='px-4 py-2 text-sm font-medium text-white bg-[#202020] hover:bg-[#333] transition-colors'
      >
        Réessayer
      </button>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const ProjectCreator = () => {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasRun = useRef(false)

  const createProject = async () => {
    const raw = localStorage.getItem('gradia_questionnaire')
    if (!raw) return

    setIsCreating(true)
    setError(null)

    try {
      const data = JSON.parse(raw)
      const res = await fetch('/api/project/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const { projectId } = await res.json()
        localStorage.removeItem('gradia_questionnaire')
        router.push(`/dashboard/projects/${projectId}`)
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('Project creation failed:', res.status, errorData)
        setError(errorData.error || 'Une erreur est survenue lors de la création du projet.')
        setIsCreating(false)
      }
    } catch (err) {
      console.error('Project creation error:', err)
      setError('Erreur de connexion. Veuillez réessayer.')
      setIsCreating(false)
    }
  }

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const raw = localStorage.getItem('gradia_questionnaire')
    if (!raw) return

    createProject()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    setError(null)
    createProject()
  }

  const handleDismiss = () => {
    localStorage.removeItem('gradia_questionnaire')
    setError(null)
    router.refresh()
  }

  if (error) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
        <div className='flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-white p-8 shadow-lg max-w-md'>
          <AlertCircle className='size-8 text-red-500' />
          <div className='text-center'>
            <p
              className='font-semibold text-[#1a1a2e]'
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Erreur de création
            </p>
            <p className='text-sm text-muted-foreground mt-1'>
              {error}
            </p>
          </div>
          <div className='flex gap-3'>
            <Button
              variant='outline'
              onClick={handleDismiss}
              className='border-[#e8e4df]'
            >
              Ignorer
            </Button>
            <Button
              onClick={handleRetry}
              className='bg-[#c9a96e] text-white hover:bg-[#b8944f]'
            >
              <RefreshCw className='size-4 mr-2' />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isCreating) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
      <div className='flex flex-col items-center gap-4 rounded-xl border border-[#e8e4df] bg-white p-8 shadow-lg'>
        <Loader2 className='size-8 animate-spin text-[#c9a96e]' />
        <div className='text-center'>
          <p
            className='font-semibold text-[#1a1a2e]'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Création de votre projet...
          </p>
          <p className='text-sm text-muted-foreground mt-1'>
            Nous préparons votre fiche projet
          </p>
        </div>
      </div>
    </div>
  )
}

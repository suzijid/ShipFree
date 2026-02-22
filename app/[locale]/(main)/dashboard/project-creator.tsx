'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'

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
        router.refresh()
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
    setError(null)
    setIsCreating(false)
  }

  if (error) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
        <div className='flex flex-col items-center gap-4 border border-red-200 bg-white p-8 max-w-md'>
          <AlertCircle className='size-8 text-red-500' />
          <div className='text-center'>
            <p className='uppercase tracking-[0.15em] text-[13px] font-normal text-[#202020]'>
              Erreur de création
            </p>
            <p className='text-sm text-[#999] mt-1'>
              {error}
            </p>
          </div>
          <div className='flex gap-3'>
            <button
              onClick={handleDismiss}
              className='border border-[#e0e0e0] px-4 py-2 text-[13px] text-[#666] hover:bg-[#f5f5f5] uppercase tracking-[0.1em] transition-colors'
            >
              Ignorer
            </button>
            <button
              onClick={handleRetry}
              className='bg-[#202020] text-white px-4 py-2 text-[13px] hover:bg-[#333] uppercase tracking-[0.1em] transition-colors flex items-center gap-2'
            >
              <RefreshCw className='size-4' />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isCreating) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='flex flex-col items-center gap-4 border border-[#e0e0e0] bg-white p-8'>
        <Loader2 className='size-8 animate-spin text-[#202020]' />
        <div className='text-center'>
          <p className='uppercase tracking-[0.15em] text-[13px] font-normal text-[#202020]'>
            Création de votre projet...
          </p>
          <p className='text-sm text-[#999] mt-1'>
            Nous préparons votre fiche projet
          </p>
        </div>
      </div>
    </div>
  )
}

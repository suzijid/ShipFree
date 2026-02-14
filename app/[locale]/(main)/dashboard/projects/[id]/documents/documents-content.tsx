'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen,
  Upload,
  FileText,
  Image,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react'
import { GlassCard } from '../../../../components/glass-primitives'
import { useProject } from '../../../../components/project-context'
import { FILE_CATEGORY_LABELS, ALLOWED_FILE_TYPES, MAX_FILE_SIZE, type FileCategory } from '@/config/project'

interface Document {
  id: string
  name: string
  url: string
  mimeType: string | null
  size: number | null
  category: string
  createdAt: string
  uploadedByName: string
}

interface DocumentsContentProps {
  projectId: string
  documents: Document[]
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export const DocumentsContent = ({ projectId, documents }: DocumentsContentProps) => {
  const { project } = useProject()
  const designModuleActive = project.modules.design

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [uploading, setUploading] = useState(false)
  const [docs, setDocs] = useState<Document[]>(documents)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'plans', label: 'Plans' },
    { id: 'devis', label: 'Devis' },
    { id: 'photos', label: 'Photos' },
    { id: 'administratif', label: 'Administratif' },
  ]
  if (designModuleActive) categories.push({ id: 'conception', label: 'Conception' })

  const filteredDocs = activeCategory === 'all' ? docs : docs.filter((d) => d.category === activeCategory)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) {
      return 'Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG, WebP'
    }
    if (file.size > MAX_FILE_SIZE) return 'Fichier trop volumineux. Taille maximale : 10 Mo'
    return null
  }

  const processFile = useCallback(
    async (file: File) => {
      setError(null)
      const validationError = validateFile(file)
      if (validationError) { setError(validationError); return }

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', activeCategory === 'all' ? 'photos' : activeCategory)

        const res = await fetch(`/api/project/${projectId}/documents/upload`, {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Erreur lors de l\'upload')
          return
        }

        const newDoc = await res.json()
        setDocs((prev) => [...prev, newDoc])
      } catch {
        setError('Erreur réseau lors de l\'upload')
      } finally {
        setUploading(false)
      }
    },
    [activeCategory, projectId],
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    await processFile(files[0])
    e.target.value = ''
  }

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Supprimer ce document ?')) return
    setDeletingId(docId)
    try {
      const res = await fetch(`/api/project/${projectId}/documents/${docId}`, { method: 'DELETE' })
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== docId))
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur réseau lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) await processFile(file)
    },
    [processFile],
  )

  return (
    <div
      className='h-full flex flex-col p-4 md:p-6 relative'
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className='absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-[#c9a96e] bg-[#c9a96e]/10 backdrop-blur-sm'>
          <div className='text-center'>
            <Upload className='size-8 text-[#c9a96e] mx-auto mb-2' />
            <p className='text-sm font-medium text-[#c9a96e]'>Déposez votre fichier ici</p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className='rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 flex items-center justify-between mb-4'>
          <span>{error}</span>
          <button onClick={() => setError(null)} className='ml-2 text-red-400/60 hover:text-red-400'>&times;</button>
        </div>
      )}

      {/* Category filters + upload */}
      <div className='flex items-center justify-between gap-4 mb-4'>
        <div className='flex items-center gap-1 overflow-x-auto'>
          {categories.map((cat) => {
            const count = cat.id === 'all' ? docs.length : docs.filter((d) => d.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-sm transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#c9a96e]/15 text-[#c9a96e] font-medium'
                    : 'bg-white/5 text-white/40 hover:bg-white/8 hover:text-white/60'
                }`}
              >
                {cat.label}
                {count > 0 && (
                  <span className={`text-xs ${activeCategory === cat.id ? 'text-[#c9a96e]/60' : 'text-white/20'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <label className='shrink-0'>
          <input type='file' className='hidden' accept='.pdf,.jpg,.jpeg,.png,.webp' onChange={handleUpload} disabled={uploading} />
          <span className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#b8944f] px-3 py-1.5 text-xs font-medium text-white shadow-[0_2px_12px_rgba(201,169,110,0.25)] hover:brightness-110 cursor-pointer transition-all'>
            {uploading ? <Loader2 className='size-4 animate-spin' /> : <Upload className='size-4' />}
            Ajouter
          </span>
        </label>
      </div>

      {/* Documents */}
      <div className='flex-1 overflow-y-auto'>
        {filteredDocs.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full'>
            <FolderOpen className='size-8 text-white/15 mb-3' />
            <p className='text-sm text-white/30'>
              {activeCategory === 'all'
                ? 'Aucun document pour le moment'
                : `Aucun document dans "${FILE_CATEGORY_LABELS[activeCategory as FileCategory] || activeCategory}"`}
            </p>
            <p className='text-xs text-white/20 mt-1'>Glissez-déposez ou cliquez sur Ajouter</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {filteredDocs.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <GlassCard hover className='p-4 group'>
                  <div className='flex items-start gap-3'>
                    <div className='shrink-0 rounded-lg bg-white/5 p-2'>
                      {doc.mimeType?.startsWith('image/') ? (
                        <Image className='size-5 text-[#c9a96e]' />
                      ) : (
                        <FileText className='size-5 text-[#c9a96e]' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-white/90 truncate'>{doc.name}</p>
                      <div className='flex items-center gap-2 text-xs text-white/30 mt-0.5'>
                        <span>{FILE_CATEGORY_LABELS[doc.category as FileCategory] || doc.category}</span>
                        {doc.size && <span>{formatFileSize(doc.size)}</span>}
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-1 shrink-0'>
                      <a
                        href={doc.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='p-1.5 rounded-lg text-white/30 hover:bg-white/10 hover:text-white/60 transition-all'
                      >
                        <Download className='size-4' />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className='p-1.5 rounded-lg text-white/30 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50'
                      >
                        {deletingId === doc.id ? <Loader2 className='size-4 animate-spin' /> : <Trash2 className='size-4' />}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

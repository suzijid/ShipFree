'use client'

import { useState, useCallback } from 'react'
import {
  FolderOpen,
  Upload,
  FileText,
  Image,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react'
import { FILE_CATEGORY_LABELS, ALLOWED_FILE_TYPES, MAX_FILE_SIZE, type FileCategory } from '@/config/project'

interface Document {
  id: string
  name: string
  url: string
  mimeType: string | null
  size: number | null
  category: string
  createdAt: Date
  uploadedByName: string
}

interface DocumentsTabProps {
  projectId: string
  documents: Document[]
  designModuleActive: boolean
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export const DocumentsTab = ({ projectId, documents, designModuleActive }: DocumentsTabProps) => {
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

  if (designModuleActive) {
    categories.push({ id: 'conception', label: 'Conception' })
  }

  const filteredDocs = activeCategory === 'all'
    ? docs
    : docs.filter((d) => d.category === activeCategory)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
      return 'Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG, WebP'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Fichier trop volumineux. Taille maximale : 10 Mo'
    }
    return null
  }

  const processFile = useCallback(async (file: File) => {
    setError(null)

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

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
  }, [activeCategory, projectId])

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
      const res = await fetch(`/api/project/${projectId}/documents/${docId}`, {
        method: 'DELETE',
      })

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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      await processFile(file)
    }
  }, [processFile])

  return (
    <div
      className='space-y-4 relative'
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className='absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-[#c9a96e] bg-[#c9a96e]/10'>
          <div className='text-center'>
            <Upload className='size-8 text-[#c9a96e] mx-auto mb-2' />
            <p className='text-sm font-medium text-[#c9a96e]'>Déposez votre fichier ici</p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 flex items-center justify-between'>
          <span>{error}</span>
          <button onClick={() => setError(null)} className='ml-2 text-red-500 hover:text-red-700'>
            &times;
          </button>
        </div>
      )}

      {/* Category filters + upload */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-1 overflow-x-auto'>
          {categories.map((cat) => {
            const count = cat.id === 'all'
              ? docs.length
              : docs.filter((d) => d.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#1a1a2e] text-white'
                    : 'bg-[#f5f5f3] text-muted-foreground hover:bg-[#e8e4df]'
                }`}
              >
                {cat.label}
                {count > 0 && (
                  <span className={`text-xs ${activeCategory === cat.id ? 'text-white/70' : 'text-muted-foreground/60'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <label className='shrink-0'>
          <input
            type='file'
            className='hidden'
            accept='.pdf,.jpg,.jpeg,.png,.webp'
            onChange={handleUpload}
            disabled={uploading}
          />
          <span
            className='inline-flex items-center gap-1 rounded-md bg-[#c9a96e] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#b8944f] cursor-pointer transition-colors'
          >
            {uploading ? (
              <Loader2 className='size-4 mr-2 animate-spin' />
            ) : (
              <Upload className='size-4 mr-2' />
            )}
            Ajouter
          </span>
        </label>
      </div>

      {/* Documents list */}
      {filteredDocs.length === 0 ? (
        <div className='rounded-xl border border-dashed border-[#e8e4df] bg-[#fafaf8] p-8 text-center'>
          <FolderOpen className='size-8 text-muted-foreground/40 mx-auto mb-3' />
          <p className='text-sm text-muted-foreground'>
            {activeCategory === 'all'
              ? 'Aucun document pour le moment'
              : `Aucun document dans "${FILE_CATEGORY_LABELS[activeCategory as FileCategory] || activeCategory}"`}
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            Cliquez sur &quot;Ajouter&quot; ou glissez-déposez un fichier
          </p>
        </div>
      ) : (
        <div className='rounded-xl border border-[#e8e4df] bg-white divide-y divide-[#e8e4df]'>
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className='group flex items-center gap-3 px-4 py-3 hover:bg-[#fafaf8] transition-colors'
            >
              <div className='shrink-0'>
                {doc.mimeType?.startsWith('image/') ? (
                  <Image className='size-5 text-[#c9a96e]' />
                ) : (
                  <FileText className='size-5 text-[#c9a96e]' />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-[#1a1a2e] truncate'>{doc.name}</p>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span>{FILE_CATEGORY_LABELS[doc.category as FileCategory] || doc.category}</span>
                  {doc.size && <span>{formatFileSize(doc.size)}</span>}
                  <span>
                    {new Date(doc.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span>par {doc.uploadedByName}</span>
                </div>
              </div>
              <a
                href={doc.url}
                target='_blank'
                rel='noopener noreferrer'
                className='shrink-0 p-1.5 rounded-md text-muted-foreground hover:bg-[#e8e4df] transition-colors'
              >
                <Download className='size-4' />
              </a>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                className='shrink-0 p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50'
              >
                {deletingId === doc.id ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <Trash2 className='size-4' />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

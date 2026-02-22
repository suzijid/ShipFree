'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen,
  Upload,
  FileText,
  Image,
  Download,
  Trash2,
  Loader2,
  Eye,
  X,
  History,
} from 'lucide-react'
import { GlassCard, GlassBadge } from '../../../../components/glass-primitives'
import { useProject } from '../../../../components/project-context'
import { FILE_CATEGORY_LABELS, ALLOWED_FILE_TYPES, MAX_FILE_SIZE, type FileCategory } from '@/config/project'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Document {
  id: string
  name: string
  url: string
  mimeType: string | null
  size: number | null
  category: string
  version?: number
  parentDocumentId?: string | null
  createdAt: string
  uploadedByName: string
}

interface VersionDoc {
  id: string
  name: string
  url: string
  mimeType: string | null
  size: number | null
  category: string
  version: number
  parentDocumentId: string | null
  createdAt: string
  uploadedByName: string
}

interface DocumentsContentProps {
  projectId: string
  documents: Document[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

const isImageType = (mimeType: string | null) =>
  mimeType?.startsWith('image/') ?? false

const isPdfType = (mimeType: string | null) =>
  mimeType === 'application/pdf'

// ─── Document Preview Modal ────────────────────────────────────────────────

const DocumentPreview = ({
  doc,
  onClose,
}: {
  doc: Document | VersionDoc
  onClose: () => void
}) => {
  const isImage = isImageType(doc.mimeType)
  const isPdf = isPdfType(doc.mimeType)

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='relative bg-white max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0]'>
          <div className='flex items-center gap-2 min-w-0'>
            <span className='text-sm font-medium text-[#202020] truncate'>{doc.name}</span>
            {(doc as VersionDoc).version && (doc as VersionDoc).version > 1 && (
              <GlassBadge variant='gold'>v{(doc as VersionDoc).version}</GlassBadge>
            )}
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            <a
              href={doc.url}
              target='_blank'
              rel='noopener noreferrer'
              className='p-1.5 text-[#999] hover:text-[#333] transition-colors'
              title='Ouvrir dans un nouvel onglet'
            >
              <Download className='size-4' />
            </a>
            <button
              onClick={onClose}
              className='p-1.5 text-[#999] hover:text-[#333] transition-colors'
            >
              <X className='size-4' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-auto flex items-center justify-center p-4 min-h-[300px]'>
          {isImage && (
            <img
              src={doc.url}
              alt={doc.name}
              className='max-w-full max-h-[70vh] object-contain'
            />
          )}
          {isPdf && (
            <iframe
              src={doc.url}
              className='w-full h-[70vh] border-0'
              title={doc.name}
            />
          )}
          {!isImage && !isPdf && (
            <div className='text-center'>
              <FileText className='size-12 text-[#ccc] mx-auto mb-3' />
              <p className='text-sm text-[#999]'>Apercu non disponible pour ce type de fichier</p>
              <a
                href={doc.url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#202020] text-white text-xs font-medium hover:bg-[#333] transition-colors'
              >
                <Download className='size-3.5' />
                Télécharger
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Version History Panel ─────────────────────────────────────────────────

const VersionHistory = ({
  projectId,
  docId,
  onPreview,
  onClose,
}: {
  projectId: string
  docId: string
  onPreview: (doc: VersionDoc) => void
  onClose: () => void
}) => {
  const [versions, setVersions] = useState<VersionDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await fetch(`/api/project/${projectId}/documents/${docId}/versions`)
        if (res.ok) {
          const data = await res.json()
          setVersions(data.versions || [])
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchVersions()
  }, [projectId, docId])

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='relative bg-white max-w-md w-full mx-4'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0]'>
          <span className='text-sm font-medium text-[#202020]'>Historique des versions</span>
          <button
            onClick={onClose}
            className='p-1.5 text-[#999] hover:text-[#333] transition-colors'
          >
            <X className='size-4' />
          </button>
        </div>
        <div className='p-4 max-h-[400px] overflow-y-auto'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='size-5 animate-spin text-[#999]' />
            </div>
          ) : versions.length === 0 ? (
            <p className='text-sm text-[#999] text-center py-4'>Aucune version trouvée</p>
          ) : (
            <div className='space-y-2'>
              {versions.map((v) => (
                <div
                  key={v.id}
                  className='flex items-center gap-3 p-3 bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors cursor-pointer group'
                  onClick={() => onPreview(v)}
                >
                  <div className='shrink-0'>
                    <GlassBadge variant={v.version === versions[0]?.version ? 'gold' : 'default'}>
                      v{v.version}
                    </GlassBadge>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-medium text-[#333] truncate'>{v.name}</p>
                    <div className='flex items-center gap-2 text-[10px] text-[#999] mt-0.5'>
                      <span>{v.uploadedByName}</span>
                      <span>
                        {new Date(v.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {v.size && <span>{formatFileSize(v.size)}</span>}
                    </div>
                  </div>
                  <Eye className='size-3.5 text-[#bbb] group-hover:text-[#666] shrink-0' />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export const DocumentsContent = ({ projectId, documents }: DocumentsContentProps) => {
  const { project } = useProject()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [uploading, setUploading] = useState(false)
  const [docs, setDocs] = useState<Document[]>(documents)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<Document | VersionDoc | null>(null)
  const [versionHistoryDocId, setVersionHistoryDocId] = useState<string | null>(null)

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'plans', label: 'Plans' },
    { id: 'devis', label: 'Devis' },
    { id: 'photos', label: 'Photos' },
    { id: 'administratif', label: 'Administratif' },
    { id: 'conception', label: 'Conception' },
  ]

  // Show only the latest version of each document
  const getLatestVersionDocs = (allDocs: Document[]) => {
    const docsByParent = new Map<string, Document[]>()
    const standaloneDocs: Document[] = []

    for (const doc of allDocs) {
      const parentId = doc.parentDocumentId
      if (parentId) {
        const group = docsByParent.get(parentId) || []
        group.push(doc)
        docsByParent.set(parentId, group)
      } else if (allDocs.some((d) => d.parentDocumentId === doc.id)) {
        // This is a parent document
        const group = docsByParent.get(doc.id) || []
        group.push(doc)
        docsByParent.set(doc.id, group)
      } else {
        standaloneDocs.push(doc)
      }
    }

    // For each group, pick the latest version
    const latestDocs: Document[] = [...standaloneDocs]
    for (const [, group] of docsByParent) {
      const sorted = group.sort((a, b) => (b.version || 1) - (a.version || 1))
      latestDocs.push(sorted[0])
    }

    return latestDocs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  const latestDocs = getLatestVersionDocs(docs)
  const filteredDocs =
    activeCategory === 'all' ? latestDocs : latestDocs.filter((d) => d.category === activeCategory)

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
          setError(data.error || "Erreur lors de l'upload")
          return
        }

        const newDoc = await res.json()
        setDocs((prev) => [...prev, newDoc])
      } catch {
        setError("Erreur réseau lors de l'upload")
      } finally {
        setUploading(false)
      }
    },
    [activeCategory, projectId]
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

  const handlePreview = (doc: Document) => {
    const canPreview = isImageType(doc.mimeType) || isPdfType(doc.mimeType)
    if (canPreview) {
      setPreviewDoc(doc)
    } else {
      window.open(doc.url, '_blank')
    }
  }

  const hasVersions = (doc: Document) => {
    return (
      (doc.version && doc.version > 1) ||
      docs.some((d) => d.parentDocumentId === doc.id)
    )
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) await processFile(file)
    },
    [processFile]
  )

  return (
    <div
      className='h-full flex flex-col p-4 md:p-6 relative'
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Preview modal */}
      {previewDoc && (
        <DocumentPreview doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}

      {/* Version history modal */}
      {versionHistoryDocId && (
        <VersionHistory
          projectId={projectId}
          docId={versionHistoryDocId}
          onPreview={(v) => {
            setVersionHistoryDocId(null)
            setPreviewDoc(v)
          }}
          onClose={() => setVersionHistoryDocId(null)}
        />
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className='absolute inset-0 z-10 flex items-center justify-center rounded-none border-2 border-dashed border-[#202020] bg-[#202020]/5 backdrop-blur-sm'>
          <div className='text-center'>
            <Upload className='size-8 text-[#202020] mx-auto mb-2' />
            <p className='text-sm font-medium text-[#202020]'>Déposez votre fichier ici</p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className='rounded-none border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 flex items-center justify-between mb-4'>
          <span>{error}</span>
          <button onClick={() => setError(null)} className='ml-2 text-red-400 hover:text-red-600'>
            &times;
          </button>
        </div>
      )}

      {/* Category filters + upload */}
      <div className='flex items-center justify-between gap-4 mb-4'>
        <div className='flex items-center gap-1 overflow-x-auto'>
          {categories.map((cat) => {
            const count =
              cat.id === 'all'
                ? latestDocs.length
                : latestDocs.filter((d) => d.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-none px-3 py-1.5 text-sm transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#202020]/5 text-[#202020] font-medium'
                    : 'bg-[#f5f5f5] text-[#999] hover:bg-[#f0f0f0] hover:text-[#666]'
                }`}
              >
                {cat.label}
                {count > 0 && (
                  <span
                    className={`text-xs ${activeCategory === cat.id ? 'text-[#202020]/40' : 'text-[#bbb]'}`}
                  >
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
          <span className='inline-flex items-center gap-2 rounded-none bg-[#202020] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#333] cursor-pointer transition-all'>
            {uploading ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Upload className='size-4' />
            )}
            Ajouter
          </span>
        </label>
      </div>

      {/* Documents */}
      <div className='flex-1 overflow-y-auto'>
        {filteredDocs.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full'>
            <FolderOpen className='size-8 text-[#ccc] mb-3' />
            <p className='text-sm text-[#999]'>
              {activeCategory === 'all'
                ? 'Aucun document pour le moment'
                : `Aucun document dans "${FILE_CATEGORY_LABELS[activeCategory as FileCategory] || activeCategory}"`}
            </p>
            <p className='text-xs text-[#bbb] mt-1'>Glissez-déposez ou cliquez sur Ajouter</p>
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
                    <button
                      onClick={() => handlePreview(doc)}
                      className='shrink-0 rounded-none bg-[#f5f5f5] p-2 hover:bg-[#eee] transition-colors cursor-pointer'
                      title='Apercu'
                    >
                      {doc.mimeType?.startsWith('image/') ? (
                        <Image className='size-5 text-[#202020]' />
                      ) : (
                        <FileText className='size-5 text-[#202020]' />
                      )}
                    </button>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handlePreview(doc)}
                          className='text-sm font-medium text-[#202020] truncate hover:underline cursor-pointer text-left'
                        >
                          {doc.name}
                        </button>
                        {doc.version && doc.version > 1 && (
                          <GlassBadge variant='gold'>v{doc.version}</GlassBadge>
                        )}
                      </div>
                      <div className='flex items-center gap-2 text-xs text-[#999] mt-0.5'>
                        <span>
                          {FILE_CATEGORY_LABELS[doc.category as FileCategory] || doc.category}
                        </span>
                        {doc.size && <span>{formatFileSize(doc.size)}</span>}
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-1 shrink-0'>
                      {/* Preview button */}
                      {(isImageType(doc.mimeType) || isPdfType(doc.mimeType)) && (
                        <button
                          onClick={() => handlePreview(doc)}
                          className='p-1.5 rounded-none text-[#999] hover:bg-[#f5f5f5] hover:text-[#666] transition-all'
                          title='Apercu'
                        >
                          <Eye className='size-4' />
                        </button>
                      )}
                      {/* Version history */}
                      {hasVersions(doc) && (
                        <button
                          onClick={() =>
                            setVersionHistoryDocId(doc.parentDocumentId || doc.id)
                          }
                          className='p-1.5 rounded-none text-[#999] hover:bg-[#f5f5f5] hover:text-[#666] transition-all'
                          title='Historique des versions'
                        >
                          <History className='size-4' />
                        </button>
                      )}
                      <a
                        href={doc.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='p-1.5 rounded-none text-[#999] hover:bg-[#f5f5f5] hover:text-[#666] transition-all'
                      >
                        <Download className='size-4' />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className='p-1.5 rounded-none text-[#999] opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50'
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className='size-4 animate-spin' />
                        ) : (
                          <Trash2 className='size-4' />
                        )}
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

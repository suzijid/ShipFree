'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react'

import { GlassCard, GlassButton, GlassBadge, GlassInput } from '@/app/[locale]/(main)/components/glass-primitives'
import { SCHEDULE_PAYMENT_STATUS_LABELS, type SchedulePaymentStatus } from '@/config/project'

interface Schedule {
  id: string
  label: string
  amount: string
  dueDate: Date
  status: string
  paidAt: Date | null
  createdAt: Date
}

interface FinancesTabProps {
  projectId: string
  schedules: Schedule[]
}

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'success' | 'warning'> = {
  pending: 'default',
  paid: 'success',
  overdue: 'warning',
}

const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(amount))

export const FinancesTab = ({ projectId, schedules }: FinancesTabProps) => {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ label: '', amount: '', dueDate: '', status: 'pending' })

  const total = schedules.reduce((sum, s) => sum + Number(s.amount), 0)
  const paid = schedules.filter((s) => s.status === 'paid').reduce((sum, s) => sum + Number(s.amount), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      label: form.label,
      amount: parseFloat(form.amount),
      dueDate: new Date(form.dueDate).toISOString(),
      status: form.status,
    }

    if (editId) {
      await fetch(`/api/admin/projects/${projectId}/payment-schedule/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch(`/api/admin/projects/${projectId}/payment-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setLoading(false)
    setShowForm(false)
    setEditId(null)
    setForm({ label: '', amount: '', dueDate: '', status: 'pending' })
    router.refresh()
  }

  const handleEdit = (s: Schedule) => {
    setForm({
      label: s.label,
      amount: s.amount,
      dueDate: new Date(s.dueDate).toISOString().split('T')[0],
      status: s.status,
    })
    setEditId(s.id)
    setShowForm(true)
  }

  const handleDelete = async (sid: string) => {
    if (!confirm('Supprimer cette entrée ?')) return
    await fetch(`/api/admin/projects/${projectId}/payment-schedule/${sid}`, {
      method: 'DELETE',
    })
    router.refresh()
  }

  return (
    <div className='space-y-6'>
      {/* Summary */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
        <GlassCard className='p-4'>
          <p className='text-xs text-[#9b9b9b]'>Total échéancier</p>
          <p className='text-lg font-bold text-[#1a1a2e] mt-1'>{formatCurrency(total)}</p>
        </GlassCard>
        <GlassCard className='p-4'>
          <p className='text-xs text-[#9b9b9b]'>Encaissé</p>
          <p className='text-lg font-bold text-emerald-600 mt-1'>{formatCurrency(paid)}</p>
        </GlassCard>
        <GlassCard className='p-4'>
          <p className='text-xs text-[#9b9b9b]'>Restant</p>
          <p className='text-lg font-bold text-[#c9a96e] mt-1'>{formatCurrency(total - paid)}</p>
        </GlassCard>
      </div>

      {/* Add button */}
      <div className='flex justify-end'>
        <GlassButton
          size='sm'
          variant='gold'
          onClick={() => {
            setShowForm(!showForm)
            setEditId(null)
            setForm({ label: '', amount: '', dueDate: '', status: 'pending' })
          }}
        >
          <Plus className='size-4' /> Ajouter une échéance
        </GlassButton>
      </div>

      {/* Form */}
      {showForm && (
        <GlassCard className='p-5'>
          <h3 className='text-sm font-semibold text-[#1a1a2e] mb-4'>
            {editId ? 'Modifier l\'échéance' : 'Nouvelle échéance'}
          </h3>
          <form onSubmit={handleSubmit} className='grid sm:grid-cols-2 gap-4'>
            <div>
              <label className='text-xs text-[#9b9b9b] block mb-1'>Libellé</label>
              <GlassInput
                required
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder='Ex: Acompte travaux'
              />
            </div>
            <div>
              <label className='text-xs text-[#9b9b9b] block mb-1'>Montant (EUR)</label>
              <GlassInput
                required
                type='number'
                step='0.01'
                min='0'
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder='1500.00'
              />
            </div>
            <div>
              <label className='text-xs text-[#9b9b9b] block mb-1'>Date d&apos;échéance</label>
              <GlassInput
                required
                type='date'
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className='text-xs text-[#9b9b9b] block mb-1'>Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className='w-full rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm text-[#1a1a2e]'
              >
                {Object.entries(SCHEDULE_PAYMENT_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className='sm:col-span-2 flex gap-2 justify-end'>
              <GlassButton type='button' variant='ghost' size='sm' onClick={() => setShowForm(false)}>
                Annuler
              </GlassButton>
              <GlassButton type='submit' variant='gold' size='sm' disabled={loading}>
                {loading ? 'Enregistrement...' : editId ? 'Modifier' : 'Créer'}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Table */}
      {schedules.length === 0 ? (
        <GlassCard className='p-8 text-center'>
          <Wallet className='size-8 text-[#9b9b9b] mx-auto mb-3' />
          <p className='text-sm text-[#9b9b9b]'>Aucune échéance définie</p>
        </GlassCard>
      ) : (
        <GlassCard className='overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-[#e8e4df]'>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Libellé</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Montant</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden sm:table-cell'>Échéance</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Statut</th>
                <th className='w-20' />
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className='border-b border-[#f5f3f0] last:border-0'>
                  <td className='px-4 py-3 text-[#1a1a2e]'>{s.label}</td>
                  <td className='px-4 py-3 font-medium text-[#1a1a2e]'>{formatCurrency(s.amount)}</td>
                  <td className='px-4 py-3 text-[#9b9b9b] hidden sm:table-cell'>
                    {new Date(s.dueDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className='px-4 py-3'>
                    <GlassBadge variant={STATUS_BADGE_VARIANT[s.status] ?? 'default'}>
                      {SCHEDULE_PAYMENT_STATUS_LABELS[s.status as SchedulePaymentStatus] ?? s.status}
                    </GlassBadge>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-1'>
                      <button
                        onClick={() => handleEdit(s)}
                        className='p-1.5 rounded-lg hover:bg-[#f5f3f0] text-[#9b9b9b] hover:text-[#1a1a2e]'
                      >
                        <Pencil className='size-3.5' />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className='p-1.5 rounded-lg hover:bg-red-50 text-[#9b9b9b] hover:text-red-500'
                      >
                        <Trash2 className='size-3.5' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users } from 'lucide-react'

import { GlassCard, GlassBadge, GlassInput } from '@/app/[locale]/(main)/components/glass-primitives'
import { USER_ROLE_LABELS, type UserRole } from '@/config/project'

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  projectCount: number
}

const ROLE_BADGE_VARIANT: Record<string, 'default' | 'gold' | 'success' | 'warning'> = {
  client: 'default',
  manager: 'gold',
  admin: 'warning',
}

export const UsersList = ({ users }: { users: UserRow[] }) => {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [changingRole, setChangingRole] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      return matchSearch && matchRole
    })
  }, [users, search, roleFilter])

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Changer le rôle de cet utilisateur en "${USER_ROLE_LABELS[newRole as UserRole]}" ?`)) return
    setChangingRole(userId)
    await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setChangingRole(null)
    router.refresh()
  }

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold text-[#1a1a2e]'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Utilisateurs
        </h1>
        <p className='text-sm text-[#9b9b9b] mt-1'>{users.length} utilisateur{users.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9b9b9b]' />
          <GlassInput
            placeholder='Rechercher par nom ou email...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className='rounded-xl border border-[#e8e4df] bg-white px-3 py-2.5 text-sm text-[#1a1a2e]'
        >
          <option value='all'>Tous les rôles</option>
          {Object.entries(USER_ROLE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <GlassCard className='overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-[#e8e4df]'>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Nom</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Email</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b]'>Rôle</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden md:table-cell'>Projets</th>
                <th className='text-left px-4 py-3 font-medium text-[#9b9b9b] hidden md:table-cell'>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className='text-center py-12 text-[#9b9b9b]'>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className='border-b border-[#f5f3f0] last:border-0 hover:bg-[#faf9f7] transition-colors'>
                    <td className='px-4 py-3 font-medium text-[#1a1a2e]'>{u.name}</td>
                    <td className='px-4 py-3 text-[#9b9b9b]'>{u.email}</td>
                    <td className='px-4 py-3'>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={changingRole === u.id}
                        className='rounded-lg border border-[#e8e4df] bg-white px-2 py-1 text-xs text-[#1a1a2e] disabled:opacity-50'
                      >
                        {Object.entries(USER_ROLE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className='px-4 py-3 hidden md:table-cell text-[#9b9b9b]'>{u.projectCount}</td>
                    <td className='px-4 py-3 hidden md:table-cell text-[#9b9b9b]'>
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}

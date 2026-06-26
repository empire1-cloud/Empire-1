'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { setSla113Session, type Sla113Role } from '@/lib/sla113Auth';

const ROLE_OPTIONS: Array<{ value: Sla113Role; label: string }> = [
  { value: 'operator_standard', label: 'Operator Standard' },
  { value: 'operator_advanced', label: 'Operator Advanced' },
  { value: 'operator_executive', label: 'Executive' },
  { value: 'engineer_platform', label: 'Engineer Platform' },
]

export default function AdminLoginPage() {
  const router = useRouter()
  const [adminKey, setAdminKey] = useState('')
  const [role, setRole] = useState<Sla113Role>('operator_advanced')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedKey = adminKey.trim()
    if (!normalizedKey) {
      setError('Enter your SLA113 operator key.')
      return
    }

    setSla113Session(normalizedKey, role)
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-zinc-800 bg-black/80 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-400 mb-3">SLA113 Admin Access</p>
          <h1 className="text-2xl font-semibold text-white">Operator Login</h1>
          <p className="text-sm text-zinc-400 mt-2">Use your SLA113 operator key to enter the admin host.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-300 mb-2">Operator key</label>
            <input
              type="password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-cyan-400"
              placeholder="Paste SLA113 key"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Role</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Sla113Role)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-cyan-400"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-400 text-black font-semibold py-3 hover:bg-cyan-300 transition-colors"
          >
            Enter Admin
          </button>
        </form>
      </div>
    </div>
  )
}
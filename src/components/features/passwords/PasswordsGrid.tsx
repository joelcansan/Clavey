'use client'

import { useState, useTransition } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import { createPassword, deletePassword } from '@/actions/passwords'
import PasswordCard from './PasswordCard'

type PasswordEntry = {
  id: string
  service_name: string
  service_icon: string | null
  username: string
  created_at: string
  updated_at: string
}

export default function PasswordsGrid({ initialPasswords }: { initialPasswords: PasswordEntry[] }) {
  const [passwords, setPasswords] = useState<PasswordEntry[]>(initialPasswords)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const form = e.currentTarget
    startTransition(async () => {
      const result = await createPassword(formData)
      if (result.error) { setError(result.error); return }
      setPasswords(prev => [{
        id: crypto.randomUUID(),
        service_name: formData.get('service_name') as string,
        service_icon: formData.get('service_icon') as string || null,
        username: formData.get('username') as string,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, ...prev])
      setShowForm(false)
      form.reset()
    })
  }

  const inputStyle = { padding: '10px 13px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10, fontSize: 14, color: '#1d1d1f', background: '#fafafa', outline: 'none', width: '100%' }
  const labelStyle = { fontSize: 12, fontWeight: 600 as const, color: '#1d1d1f' }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setShowForm(v => !v)} aria-expanded={showForm}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.2px' }}>
          <Plus size={15} aria-hidden="true" />
          {showForm ? 'Cancelar' : 'Añadir contraseña'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} aria-label="Añadir contraseña" noValidate
          style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', marginBottom: 18, letterSpacing: '-0.3px' }}>Nueva entrada</h2>

          {error && (
            <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#b91c1c', marginBottom: 16 }}>
              <AlertCircle size={14} aria-hidden="true" /> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label htmlFor="service_name" style={labelStyle}>Servicio</label>
              <input id="service_name" name="service_name" type="text" required placeholder="Google, GitHub..." style={inputStyle} disabled={isPending} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label htmlFor="service_icon" style={labelStyle}>Icono URL <span style={{ color: '#aeaeb2', fontWeight: 400 }}>(opcional)</span></label>
              <input id="service_icon" name="service_icon" type="url" placeholder="https://..." style={inputStyle} disabled={isPending} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label htmlFor="username" style={labelStyle}>Email / Usuario</label>
              <input id="username" name="username" type="text" required placeholder="tu@email.com" autoComplete="off" style={inputStyle} disabled={isPending} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label htmlFor="password" style={labelStyle}>Contraseña</label>
              <input id="password" name="password" type="password" required placeholder="••••••••" autoComplete="new-password" style={inputStyle} disabled={isPending} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={isPending} aria-busy={isPending}
              style={{ background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1, letterSpacing: '-0.2px' }}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {passwords.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} aria-live="polite">
          <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.3px' }}>Sin contraseñas guardadas</p>
          <p style={{ fontSize: 14, color: '#aeaeb2' }}>Añade tu primera entrada para empezar</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }} role="list" aria-label="Contraseñas guardadas">
          {passwords.map(p => (
            <li key={p.id}>
              <PasswordCard entry={p} onDeleted={id => setPasswords(prev => prev.filter(p => p.id !== id))} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

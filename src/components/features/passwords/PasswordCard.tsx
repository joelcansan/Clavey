'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Eye, EyeOff, Copy, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { revealPassword, deletePassword } from '@/actions/passwords'

type PasswordEntry = {
  id: string
  service_name: string
  service_icon: string | null
  username: string
  created_at: string
  updated_at: string
}

const REVEAL_SECONDS = 60

export default function PasswordCard({ entry, onDeleted }: { entry: PasswordEntry; onDeleted: (id: string) => void }) {
  const [revealed, setRevealed] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startCountdown() {
    setCountdown(REVEAL_SECONDS)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); setRevealed(null); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  function handleReveal() {
    setError(null)
    startTransition(async () => {
      const result = await revealPassword(entry.id)
      if (result.error) { setError(result.error); return }
      setRevealed(result.decrypted!)
      startCountdown()
    })
  }

  function handleHide() {
    setRevealed(null)
    setCountdown(0)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function handleCopy() {
    if (!revealed) return
    navigator.clipboard.writeText(revealed)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${entry.service_name}"?`)) return
    startDelete(async () => {
      const result = await deletePassword(entry.id)
      if (result.success) onDeleted(entry.id)
    })
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const progress = (countdown / REVEAL_SECONDS) * 100
  const initial = entry.service_name[0].toUpperCase()

  return (
    <article style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 18, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }} aria-label={`Contraseña de ${entry.service_name}`}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }} aria-hidden="true">
          {entry.service_icon
            ? <Image src={entry.service_icon} alt="" width={24} height={24} style={{ objectFit: 'contain' }} />
            : <span style={{ fontSize: 15, fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.5px' }}>{initial}</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.service_name}</p>
          <p style={{ fontSize: 12, color: '#aeaeb2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.username}</p>
        </div>
        <button onClick={handleDelete} disabled={isDeleting} aria-label={`Eliminar ${entry.service_name}`} title="Eliminar"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: 8, color: '#aeaeb2', display: 'flex', alignItems: 'center', opacity: isDeleting ? 0.4 : 0.5, transition: 'opacity .15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}>
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>

      {error && <p style={{ fontSize: 12, color: '#b91c1c', background: '#fff2f2', borderRadius: 8, padding: '8px 10px' }} role="alert">{error}</p>}

      {revealed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Progress bar */}
          <div style={{ width: '100%', height: 2, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }} role="progressbar" aria-valuenow={countdown} aria-valuemin={0} aria-valuemax={REVEAL_SECONDS} aria-label={`Se oculta en ${countdown}s`}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#1d1d1f', borderRadius: 2, transition: 'width 1s linear' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f7', borderRadius: 10, padding: '9px 12px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <code style={{ flex: 1, fontSize: 13, color: '#1d1d1f', fontFamily: '"SF Mono","Fira Code","Courier New",monospace', wordBreak: 'break-all' }} aria-label="Contraseña revelada">{revealed}</code>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button onClick={handleCopy} aria-label="Copiar contraseña" title={copied ? 'Copiado' : 'Copiar'}
                style={{ background: copied ? '#f0faf4' : 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 6, color: copied ? '#16a34a' : '#6e6e73', display: 'flex', alignItems: 'center', transition: 'color .15s' }}>
                <Copy size={13} aria-hidden="true" />
              </button>
              <button onClick={handleHide} aria-label="Ocultar contraseña" title="Ocultar"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 6, color: '#6e6e73', display: 'flex', alignItems: 'center' }}>
                <EyeOff size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#aeaeb2', textAlign: 'right' }} aria-live="polite">Se oculta en <strong style={{ color: '#6e6e73' }}>{countdown}s</strong></p>
        </div>
      ) : (
        <button onClick={handleReveal} disabled={isPending} aria-busy={isPending} aria-label={`Ver contraseña de ${entry.service_name}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 600, color: '#1d1d1f', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1, letterSpacing: '-0.1px', transition: 'background .15s' }}
          onMouseEnter={e => { if (!isPending) (e.currentTarget as HTMLButtonElement).style.background = '#ebebeb' }}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f7'}>
          <Eye size={14} aria-hidden="true" />
          {isPending ? 'Descifrando...' : 'Ver contraseña'}
        </button>
      )}
    </article>
  )
}

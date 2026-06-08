'use client'

import { useTransition } from 'react'
import { Trash2, FileDown } from 'lucide-react'
import type { Note } from '@/types/database'
import { deleteNote } from '@/actions/notes'

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDeleted: (id: string) => void
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function NoteCard({ note, onEdit, onDeleted }: NoteCardProps) {
  const [isPending, startTransition] = useTransition()
  const preview = note.content ? stripHtml(note.content).slice(0, 110) : ''
  const isLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 160
  }
  const bg = note.bg_color || '#ffffff'
  const textColor = isLight(bg) ? '#1d1d1f' : '#f5f5f7'
  const mutedColor = isLight(bg) ? '#6e6e73' : 'rgba(255,255,255,0.6)'
  const tagBg = isLight(bg) ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.15)'

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta nota?')) return
    startTransition(async () => {
      const result = await deleteNote(note.id)
      if (result.success) onDeleted(note.id)
    })
  }

  return (
    <article
      style={{ backgroundColor: bg, borderRadius: 18, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow .2s, transform .2s', cursor: 'pointer' }}
      aria-label={`Nota: ${note.title}`}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
    >
      <button
        onClick={() => onEdit(note)}
        aria-label={`Editar nota: ${note.title}`}
        style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, padding: '18px 18px 12px', flex: 1, textAlign: 'left' }}
      >
        {note.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }} aria-label="Etiquetas">
            {note.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ background: tagBg, color: mutedColor, fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 980 }}>{tag}</span>
            ))}
          </div>
        )}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: textColor, letterSpacing: '-0.3px', lineHeight: 1.3 }}>{note.title}</h3>
        {preview && (
          <p style={{ fontSize: 13, color: mutedColor, lineHeight: 1.55 }}>{preview}{preview.length >= 110 ? '...' : ''}</p>
        )}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 14px' }}>
        <time style={{ fontSize: 11, color: mutedColor }} dateTime={note.updated_at}>{formatDate(note.updated_at)}</time>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={handleDelete} disabled={isPending} aria-label={`Eliminar nota: ${note.title}`} title="Eliminar"
            style={{ background: 'none', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', padding: '4px 6px', borderRadius: 7, color: mutedColor, opacity: 0.6, display: 'flex', alignItems: 'center', transition: 'opacity .15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}>
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}

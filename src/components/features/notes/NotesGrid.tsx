'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import type { Note } from '@/types/database'
import NoteCard from './NoteCard'
import NoteEditor from './NoteEditor'

interface NotesGridProps {
  initialNotes: Note[]
}

export default function NotesGrid({ initialNotes }: NotesGridProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [search, setSearch] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return notes
    const q = search.toLowerCase()
    return notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      (n.content ?? '').toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [notes, search])

  function handleCreated(note: Note) { setNotes(prev => [note, ...prev]); setShowEditor(false) }
  function handleUpdated(note: Note) { setNotes(prev => prev.map(n => n.id === note.id ? note : n)); setEditingNote(null); setShowEditor(false) }
  function handleDeleted(id: string) { setNotes(prev => prev.filter(n => n.id !== id)) }
  function handleEdit(note: Note) { setEditingNote(note); setShowEditor(true) }
  function handleClose() { setShowEditor(false); setEditingNote(null) }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aeaeb2', pointerEvents: 'none' }} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar notas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar notas"
            style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, fontSize: 14, background: '#fff', color: '#1d1d1f', outline: 'none' }}
          />
        </div>
        <button
          onClick={() => { setEditingNote(null); setShowEditor(true) }}
          aria-label="Crear nueva nota"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}
        >
          <Plus size={15} aria-hidden="true" /> Nueva nota
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }} aria-live="polite">
          {search ? (
            <p style={{ color: '#6e6e73', fontSize: 15 }}>No se encontraron notas para <strong>"{search}"</strong></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={22} color="#aeaeb2" aria-hidden="true" />
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.3px' }}>Sin notas todavía</p>
              <p style={{ fontSize: 14, color: '#aeaeb2', marginBottom: 8 }}>Crea tu primera nota para empezar</p>
              <button onClick={() => setShowEditor(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={15} aria-hidden="true" /> Crear nota
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }} role="list" aria-label="Lista de notas">
          {filtered.map(note => (
            <li key={note.id}>
              <NoteCard note={note} onEdit={handleEdit} onDeleted={handleDeleted} />
            </li>
          ))}
        </ul>
      )}

      {showEditor && (
        <NoteEditor note={editingNote} onCreated={handleCreated} onUpdated={handleUpdated} onClose={handleClose} />
      )}
    </div>
  )
}

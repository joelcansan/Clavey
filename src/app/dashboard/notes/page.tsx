import { createClient } from '@/lib/supabase/server'
import NotesGrid from '@/components/features/notes/NotesGrid'
import type { Note } from '@/types/database'

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: notesRaw } = await (supabase.from('notes') as any)
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  const notes = (notesRaw ?? []) as Note[]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis notas</h1>
          <p className="page-subtitle">{notes.length} nota{notes.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <NotesGrid initialNotes={notes} />
      <style>{`
        .page { padding: 36px 40px; max-width: 1200px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
        .page-title { font-size: 28px; font-weight: 700; letter-spacing: -0.6px; color: #1d1d1f; }
        .page-subtitle { font-size: 14px; color: #aeaeb2; margin-top: 2px; }
        @media (max-width: 768px) { .page { padding: 24px 20px; } }
      `}</style>
    </div>
  )
}

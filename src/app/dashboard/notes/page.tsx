import { createClient } from '@/lib/supabase/server'
import NotesGrid from '@/components/features/notes/NotesGrid'

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis notas</h1>
          <p className="page-subtitle">{notes?.length ?? 0} nota{notes?.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <NotesGrid initialNotes={notes ?? []} />
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

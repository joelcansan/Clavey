import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/features/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user!.id)
    .single()

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Perfil</h1>
        <p className="page-subtitle">Gestiona tu cuenta y preferencias</p>
      </div>
      <ProfileForm
        userName={profile?.full_name ?? 'Usuario'}
        userEmail={user!.email ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <style>{`
        .page { padding: 36px 40px; max-width: 720px; }
        .page-header { margin-bottom: 28px; }
        .page-title { font-size: 28px; font-weight: 700; letter-spacing: -0.6px; color: #1d1d1f; }
        .page-subtitle { font-size: 14px; color: #aeaeb2; margin-top: 2px; }
        @media (max-width: 768px) { .page { padding: 24px 20px; } }
      `}</style>
    </div>
  )
}

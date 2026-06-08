import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="dashboard">
      <Sidebar
        userName={profile?.full_name ?? user.email ?? 'Usuario'}
        avatarUrl={profile?.avatar_url ?? null}
        userEmail={user.email ?? ''}
      />
      <main id="main-content" className="dashboard-main">
        {children}
      </main>
      <style>{`
        .dashboard { display: flex; min-height: 100vh; background: #f5f5f7; }
        .dashboard-main { flex: 1; min-width: 0; overflow-y: auto; }
      `}</style>
    </div>
  )
}

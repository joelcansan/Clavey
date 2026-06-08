'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { FileText, Lock, User, LogOut, Plus } from 'lucide-react'
import { logout } from '@/actions/auth'

interface SidebarProps {
  userName: string
  avatarUrl: string | null
  userEmail: string
}

const navItems = [
  { href: '/dashboard/notes', label: 'Notas', icon: FileText },
  { href: '/dashboard/passwords', label: 'Contraseñas', icon: Lock },
  { href: '/dashboard/profile', label: 'Perfil', icon: User },
]

export default function Sidebar({ userName, avatarUrl, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => { await logout() })
  }

  const initials = userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <aside style={{ width: 240, minHeight: '100vh', background: '#fff', borderRight: '1px solid rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', padding: '20px 10px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }} aria-label="Navegación del dashboard">

      {/* Logo */}
      <div style={{ padding: '2px 10px 24px' }}>
        <Link href="/" aria-label="NoteVault inicio" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#1d1d1f', fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect width="22" height="22" rx="6" fill="#1d1d1f"/>
            <path d="M6 11h10M11 6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          NoteVault
        </Link>
      </div>

      {/* Nav */}
      <nav aria-label="Secciones principales" style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }} role="list">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
                    borderRadius: 10, fontSize: 14, fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#1d1d1f' : '#6e6e73',
                    background: isActive ? '#f5f5f7' : 'transparent',
                    textDecoration: 'none', transition: 'background .15s, color .15s',
                  }}
                >
                  <item.icon size={16} aria-hidden="true" strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }} aria-label={`Sesión como ${userName}`}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt={`Avatar de ${userName}`} width={30} height={30} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1d1d1f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }} aria-hidden="true">
              {initials}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</span>
            <span style={{ fontSize: 11, color: '#aeaeb2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</span>
          </div>
        </div>
        <button onClick={handleLogout} disabled={isPending} aria-label="Cerrar sesión" title="Cerrar sesión"
          style={{ background: 'none', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', padding: 6, borderRadius: 8, color: '#aeaeb2', display: 'flex', alignItems: 'center', opacity: isPending ? 0.5 : 1, flexShrink: 0, transition: 'color .15s, background .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f7'; e.currentTarget.style.color = '#1d1d1f' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#aeaeb2' }}>
          <LogOut size={15} aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}

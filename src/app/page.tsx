'use client'

import Link from 'next/link'
import { ArrowRight, FileText, Lock, Cloud, Palette, Zap, FileOutput } from 'lucide-react'

const features = [
  { icon: FileText, name: 'Editor rico', desc: 'Escribe con formato completo. Negrita, cursiva, listas, cabeceras e imágenes integradas directamente en la nota.' },
  { icon: FileOutput, name: 'Exportar a PDF', desc: 'Convierte cualquier nota en un documento PDF con un solo clic. Ideal para compartir o archivar.' },
  { icon: Lock, name: 'Contraseñas cifradas', desc: 'Cifrado AES-256 en servidor. Solo tú puedes ver tus contraseñas, y únicamente durante 60 segundos.' },
  { icon: Cloud, name: 'Sincronización en la nube', desc: 'Tus datos siempre disponibles en cualquier dispositivo. Seguro, rápido y fiable con Supabase.' },
  { icon: Palette, name: 'Personalización total', desc: 'Elige el color de cada nota, añade etiquetas y organiza tu espacio exactamente como quieras.' },
  { icon: Zap, name: 'Rápido y ligero', desc: 'Construido con Next.js. Cada acción responde al instante, sin esperas ni recargas de página.' },
]

export default function HomePage() {
  return (
    <main id="main-content">
      <style>{`
        .nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.88); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,0,0,0.08); }
        .nav-inner { max-width: 1080px; margin: 0 auto; padding: 0 24px; height: 52px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #1d1d1f; font-weight: 700; font-size: 16px; letter-spacing: -0.4px; }
        .nav-actions { display: flex; align-items: center; gap: 8px; }
        .btn-ghost { padding: 7px 16px; border-radius: 980px; font-size: 14px; font-weight: 500; color: #1d1d1f; text-decoration: none; transition: background .15s; }
        .btn-ghost:hover { background: rgba(0,0,0,0.05); }
        .btn-dark { padding: 7px 18px; border-radius: 980px; font-size: 14px; font-weight: 600; color: #fff; background: #1d1d1f; text-decoration: none; letter-spacing: -0.2px; transition: background .15s; }
        .btn-dark:hover { background: #3a3a3c; }
        .hero { padding: 110px 24px 90px; text-align: center; background: #fff; }
        .hero-inner { max-width: 700px; margin: 0 auto; }
        .hero-badge { display: inline-flex; align-items: center; gap: 6px; background: #f5f5f7; border: 1px solid rgba(0,0,0,0.08); border-radius: 980px; padding: 5px 14px; font-size: 13px; color: #6e6e73; margin-bottom: 32px; font-weight: 500; }
        .hero-dot { width: 6px; height: 6px; border-radius: 50%; background: #34c759; display: inline-block; }
        .hero-title { font-size: clamp(42px,6vw,68px); font-weight: 700; letter-spacing: -1.5px; line-height: 1.05; color: #1d1d1f; margin-bottom: 22px; }
        .hero-title-muted { color: #6e6e73; }
        .hero-sub { font-size: 18px; color: #6e6e73; line-height: 1.65; max-width: 520px; margin: 0 auto 40px; }
        .hero-cta { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .btn-primary-lg { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; border-radius: 980px; font-size: 15px; font-weight: 600; color: #fff; background: #1d1d1f; text-decoration: none; letter-spacing: -0.2px; transition: background .15s; }
        .btn-primary-lg:hover { background: #3a3a3c; }
        .btn-outline-lg { display: inline-flex; align-items: center; gap: 6px; padding: 13px 22px; border-radius: 980px; font-size: 15px; font-weight: 500; color: #1d1d1f; text-decoration: none; border: 1px solid rgba(0,0,0,0.14); transition: background .15s; }
        .btn-outline-lg:hover { background: #f5f5f7; }
        .divider { height: 1px; background: rgba(0,0,0,0.06); }
        .features { padding: 90px 24px; background: #f5f5f7; }
        .features-inner { max-width: 1080px; margin: 0 auto; }
        .features-header { text-align: center; margin-bottom: 52px; }
        .features-title { font-size: 38px; font-weight: 700; letter-spacing: -0.8px; color: #1d1d1f; margin-bottom: 10px; }
        .features-sub { font-size: 17px; color: #6e6e73; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; }
        .feature-card { background: #fff; border-radius: 20px; padding: 28px; border: 1px solid rgba(0,0,0,0.06); transition: box-shadow .2s; }
        .feature-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
        .feature-icon { width: 40px; height: 40px; border-radius: 12px; background: #f5f5f7; border: 1px solid rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .feature-name { font-size: 16px; font-weight: 700; color: #1d1d1f; margin-bottom: 8px; letter-spacing: -0.3px; }
        .feature-desc { font-size: 14px; color: #6e6e73; line-height: 1.6; }
        .cta-section { padding: 90px 24px; background: #fff; }
        .cta-box { max-width: 560px; margin: 0 auto; background: #1d1d1f; border-radius: 28px; padding: 64px 48px; text-align: center; }
        .cta-title { font-size: 38px; font-weight: 700; color: #fff; letter-spacing: -0.8px; margin-bottom: 10px; }
        .cta-sub { font-size: 16px; color: rgba(255,255,255,0.5); margin-bottom: 32px; }
        .btn-white { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; border-radius: 980px; font-size: 15px; font-weight: 600; color: #1d1d1f; background: #fff; text-decoration: none; letter-spacing: -0.2px; transition: background .15s; }
        .btn-white:hover { background: #f5f5f7; }
        .footer { border-top: 1px solid rgba(0,0,0,0.07); padding: 28px 24px; background: #fff; }
        .footer-inner { max-width: 1080px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .footer-logo { font-weight: 700; font-size: 14px; color: #1d1d1f; letter-spacing: -0.3px; }
        .footer-copy { font-size: 13px; color: #aeaeb2; }
        @media (max-width: 600px) {
          .hero { padding: 70px 20px 56px; }
          .cta-box { padding: 44px 28px; border-radius: 20px; }
          .hero-cta { flex-direction: column; align-items: stretch; }
          .btn-primary-lg, .btn-outline-lg { justify-content: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav" role="navigation" aria-label="Navegación principal">
        <div className="nav-inner">
          <Link href="/" className="nav-logo" aria-label="NoteVault inicio">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect width="22" height="22" rx="6" fill="#1d1d1f"/>
              <path d="M6 11h10M11 6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            NoteVault
          </Link>
          <div className="nav-actions">
            <Link href="/auth/login" className="btn-ghost">Iniciar sesión</Link>
            <Link href="/auth/register" className="btn-dark">Empezar gratis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-dot" aria-hidden="true" />
            Tu espacio personal, organizado
          </div>
          <h1 id="hero-title" className="hero-title">
            Notas y contraseñas.<br />
            <span className="hero-title-muted">Todo en un lugar.</span>
          </h1>
          <p className="hero-sub">
            NoteVault es tu espacio personal para escribir, organizar y proteger lo que más importa. Editor rico, PDF y gestión de contraseñas cifradas.
          </p>
          <div className="hero-cta">
            <Link href="/auth/register" className="btn-primary-lg">
              Crear cuenta gratis <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/auth/login" className="btn-outline-lg">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* FEATURES */}
      <section className="features" aria-labelledby="features-title">
        <div className="features-inner">
          <div className="features-header">
            <h2 id="features-title" className="features-title">Todo lo que necesitas</h2>
            <p className="features-sub">Diseñado para ser simple, potente y seguro.</p>
          </div>
          <div className="features-grid">
            {features.map(f => (
              <article key={f.name} className="feature-card" aria-labelledby={`feat-${f.name}`}>
                <div className="feature-icon" aria-hidden="true">
                  <f.icon size={20} color="#1d1d1f" strokeWidth={2} />
                </div>
                <h3 id={`feat-${f.name}`} className="feature-name">{f.name}</h3>
                <p className="feature-desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" aria-labelledby="cta-title">
        <div className="cta-box">
          <h2 id="cta-title" className="cta-title">Empieza hoy, gratis.</h2>
          <p className="cta-sub">Sin tarjeta de crédito. Sin complicaciones.</p>
          <Link href="/auth/register" className="btn-white">
            Crear mi cuenta <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" role="contentinfo">
        <div className="footer-inner">
          <span className="footer-logo">NoteVault</span>
          <p className="footer-copy">© {new Date().getFullYear()} NoteVault</p>
        </div>
      </footer>
    </main>
  )
}

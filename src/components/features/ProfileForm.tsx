'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { updateProfile, uploadAvatar, changePassword } from '@/actions/profile'

interface ProfileFormProps {
  userName: string
  userEmail: string
  avatarUrl: string | null
}

export default function ProfileForm({ userName, userEmail, avatarUrl }: ProfileFormProps) {
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl)
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err', text: string } | null>(null)
  const [passMsg, setPassMsg] = useState<{ type: 'ok' | 'err', text: string } | null>(null)
  const [isPendingProfile, startProfile] = useTransition()
  const [isPendingPass, startPass] = useTransition()
  const [isPendingAvatar, startAvatar] = useTransition()

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileMsg(null)
    const formData = new FormData(e.currentTarget)
    startProfile(async () => {
      const result = await updateProfile(formData)
      setProfileMsg(result.error ? { type: 'err', text: result.error } : { type: 'ok', text: 'Perfil actualizado correctamente' })
    })
  }

  function handlePassSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPassMsg(null)
    const formData = new FormData(e.currentTarget)
    startPass(async () => {
      const result = await changePassword(formData)
      setPassMsg(result.error ? { type: 'err', text: result.error } : { type: 'ok', text: 'Contraseña cambiada correctamente' })
      if (result.success) (e.target as HTMLFormElement).reset()
    })
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.set('avatar', file)
    startAvatar(async () => {
      const result = await uploadAvatar(formData)
      if (result.avatar_url) setCurrentAvatar(result.avatar_url)
    })
  }

  const initials = userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="profile-wrap">
      {/* Avatar */}
      <section className="profile-section" aria-labelledby="avatar-title">
        <h2 id="avatar-title" className="section-title">Foto de perfil</h2>
        <div className="avatar-row">
          <div className="avatar-wrap">
            {currentAvatar ? (
              <Image src={currentAvatar} alt={`Avatar de ${userName}`} width={72} height={72} className="avatar-img" />
            ) : (
              <div className="avatar-initials" aria-hidden="true">{initials}</div>
            )}
            {isPendingAvatar && <div className="avatar-loading" aria-label="Subiendo imagen..." />}
          </div>
          <div>
            <label className="btn-upload" aria-label="Cambiar foto de perfil">
              {isPendingAvatar ? 'Subiendo...' : 'Cambiar foto'}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="file-input" aria-label="Seleccionar imagen" disabled={isPendingAvatar} />
            </label>
            <p className="upload-hint">JPG, PNG o WebP. Máx. 5MB</p>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="profile-section" aria-labelledby="info-title">
        <h2 id="info-title" className="section-title">Información personal</h2>
        {profileMsg && (
          <div className={profileMsg.type === 'ok' ? 'msg-ok' : 'msg-err'} role="alert" aria-live="polite">
            {profileMsg.text}
          </div>
        )}
        <form onSubmit={handleProfileSubmit} className="profile-form" noValidate>
          <div className="field">
            <label htmlFor="full_name" className="field-label">Nombre completo</label>
            <input id="full_name" name="full_name" type="text" defaultValue={userName} required className="field-input" disabled={isPendingProfile} />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input type="email" value={userEmail} disabled className="field-input field-disabled" aria-label="Email no editable" />
          </div>
          <button type="submit" className="btn-save" disabled={isPendingProfile} aria-busy={isPendingProfile}>
            {isPendingProfile ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="profile-section" aria-labelledby="pass-title">
        <h2 id="pass-title" className="section-title">Cambiar contraseña</h2>
        {passMsg && (
          <div className={passMsg.type === 'ok' ? 'msg-ok' : 'msg-err'} role="alert" aria-live="polite">
            {passMsg.text}
          </div>
        )}
        <form onSubmit={handlePassSubmit} className="profile-form" noValidate>
          <div className="field">
            <label htmlFor="password" className="field-label">Nueva contraseña</label>
            <input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" required className="field-input" autoComplete="new-password" disabled={isPendingPass} />
          </div>
          <div className="field">
            <label htmlFor="confirm" className="field-label">Confirmar contraseña</label>
            <input id="confirm" name="confirm" type="password" placeholder="Repite la contraseña" required className="field-input" autoComplete="new-password" disabled={isPendingPass} />
          </div>
          <button type="submit" className="btn-save" disabled={isPendingPass} aria-busy={isPendingPass}>
            {isPendingPass ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </section>

      <style>{`
        .profile-wrap { display: flex; flex-direction: column; gap: 24px; max-width: 560px; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; }
        .profile-section { background: #fff; border: 1px solid rgba(0,0,0,0.07); border-radius: 20px; padding: 24px; }
        .section-title { font-size: 16px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.2px; margin-bottom: 18px; }
        .avatar-row { display: flex; align-items: center; gap: 20px; }
        .avatar-wrap { position: relative; width: 72px; height: 72px; flex-shrink: 0; }
        .avatar-img { border-radius: 50%; object-fit: cover; border: 2px solid rgba(0,0,0,0.07); }
        .avatar-initials { width: 72px; height: 72px; border-radius: 50%; background: #1d1d1f; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; }
        .avatar-loading { position: absolute; inset: 0; border-radius: 50%; background: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; }
        .btn-upload { display: inline-block; background: #f5f5f7; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; padding: 8px 16px; font-size: 13px; font-weight: 500; color: #1d1d1f; cursor: pointer; transition: background 0.15s; margin-bottom: 6px; }
        .btn-upload:hover { background: #ebebeb; }
        .file-input { display: none; }
        .upload-hint { font-size: 12px; color: #aeaeb2; }
        .msg-ok { background: #f0faf4; border: 1px solid #a7f3c0; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #166534; margin-bottom: 14px; }
        .msg-err { background: #fff2f2; border: 1px solid #ffcdd2; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #c62828; margin-bottom: 14px; }
        .profile-form { display: flex; flex-direction: column; gap: 14px; }
        .field { display: flex; flex-direction: column; gap: 5px; }
        .field-label { font-size: 12px; font-weight: 500; color: #1d1d1f; }
        .field-input { padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; font-size: 14px; font-family: inherit; color: #1d1d1f; background: #fafafa; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .field-input:focus { border-color: #0071e3; box-shadow: 0 0 0 3px rgba(0,113,227,0.1); background: #fff; }
        .field-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .field-disabled { background: #f5f5f7 !important; color: #aeaeb2 !important; }
        .btn-save { background: #1d1d1f; color: #fff; border: none; border-radius: 10px; padding: 11px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background 0.2s, transform 0.15s; align-self: flex-start; padding-left: 22px; padding-right: 22px; }
        .btn-save:hover:not(:disabled) { background: #3a3a3c; }
        .btn-save:active { transform: scale(0.97); }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}

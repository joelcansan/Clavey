'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto/aes'

const passwordSchema = z.object({
  service_name: z.string().min(1, 'El nombre del servicio es obligatorio').max(100),
  service_icon: z.string().url().optional().or(z.literal('')),
  username: z.string().min(1, 'El usuario/email es obligatorio').max(200),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export type PasswordActionResult = {
  error?: string
  success?: boolean
  decrypted?: string
}

export async function createPassword(formData: FormData): Promise<PasswordActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = passwordSchema.safeParse({
    service_name: formData.get('service_name'),
    service_icon: formData.get('service_icon') || '',
    username: formData.get('username'),
    password: formData.get('password'),
  })

  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const encrypted_pass = encrypt(parsed.data.password, user.id)

  const { error } = await supabase.from('password_entries').insert({
    user_id: user.id,
    service_name: parsed.data.service_name,
    service_icon: parsed.data.service_icon || null,
    username: parsed.data.username,
    encrypted_pass,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/passwords')
  return { success: true }
}

export async function revealPassword(id: string): Promise<PasswordActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data, error } = await supabase
    .from('password_entries')
    .select('encrypted_pass')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return { error: 'Contraseña no encontrada' }

  try {
    const decrypted = decrypt(data.encrypted_pass, user.id)
    return { success: true, decrypted }
  } catch {
    return { error: 'Error al descifrar la contraseña' }
  }
}

export async function deletePassword(id: string): Promise<PasswordActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('password_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/passwords')
  return { success: true }
}

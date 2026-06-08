'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const supabase = createClient()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Escribe algo...' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        'aria-label': 'Contenido de la nota',
        'aria-multiline': 'true',
        role: 'textbox',
      },
    },
  })

  useEffect(() => {
    return () => { editor?.destroy() }
  }, [editor])

  async function handleImageUpload() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file || !editor) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error } = await supabase.storage.from('note-images').upload(path, file)
      if (error) { alert('Error al subir la imagen'); return }

      const { data: { publicUrl } } = supabase.storage.from('note-images').getPublicUrl(path)
      editor.chain().focus().setImage({ src: publicUrl }).run()
    }
    input.click()
  }

  if (!editor) return null

  return (
    <div className="tiptap-wrap">
      {/* Toolbar */}
      <div className="toolbar" role="toolbar" aria-label="Herramientas del editor">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`tool-btn ${editor.isActive('bold') ? 'active' : ''}`}
          aria-label="Negrita" aria-pressed={editor.isActive('bold')} title="Negrita"
        ><strong>B</strong></button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`tool-btn ${editor.isActive('italic') ? 'active' : ''}`}
          aria-label="Cursiva" aria-pressed={editor.isActive('italic')} title="Cursiva"
        ><em>I</em></button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`tool-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          aria-label="Título H2" title="Título"
        >H2</button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`tool-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          aria-label="Lista con viñetas" title="Lista"
        >• —</button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`tool-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          aria-label="Lista numerada" title="Lista numerada"
        >1.</button>

        <div className="tool-separator" aria-hidden="true" />

        <label className="tool-btn" title="Color de texto" aria-label="Color de texto">
          A
          <input
            type="color"
            className="color-input"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
            aria-label="Seleccionar color de texto"
          />
        </label>

        <button
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
          className={`tool-btn ${editor.isActive('highlight') ? 'active' : ''}`}
          aria-label="Resaltar texto" title="Resaltar"
        >✱</button>

        <div className="tool-separator" aria-hidden="true" />

        <button
          onClick={handleImageUpload}
          className="tool-btn"
          aria-label="Insertar imagen" title="Imagen"
        >🖼</button>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />

      <style>{`
        .tiptap-wrap { display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; }
        .toolbar { display: flex; align-items: center; gap: 2px; padding: 8px 16px; border-bottom: 1px solid rgba(0,0,0,0.06); flex-wrap: wrap; }
        .tool-btn { background: none; border: none; border-radius: 7px; padding: 5px 9px; font-size: 13px; font-weight: 500; font-family: inherit; color: #6e6e73; cursor: pointer; transition: background 0.15s, color 0.15s; display: flex; align-items: center; position: relative; }
        .tool-btn:hover { background: rgba(0,0,0,0.06); color: #1d1d1f; }
        .tool-btn.active { background: rgba(0,113,227,0.1); color: #0071e3; }
        .tool-separator { width: 1px; height: 18px; background: rgba(0,0,0,0.1); margin: 0 4px; }
        .color-input { position: absolute; opacity: 0; width: 100%; height: 100%; top: 0; left: 0; cursor: pointer; }
        .tiptap-editor { padding: 16px 20px; min-height: 180px; outline: none; font-size: 15px; line-height: 1.6; color: #1d1d1f; }
        .tiptap-editor p { margin-bottom: 8px; }
        .tiptap-editor h2 { font-size: 18px; font-weight: 700; margin-bottom: 10px; letter-spacing: -0.3px; }
        .tiptap-editor ul, .tiptap-editor ol { padding-left: 20px; margin-bottom: 8px; }
        .tiptap-editor img { max-width: 100%; border-radius: 10px; margin: 8px 0; }
        .tiptap-editor .is-editor-empty:first-child::before { content: attr(data-placeholder); color: #aeaeb2; pointer-events: none; float: left; height: 0; }
      `}</style>
    </div>
  )
}

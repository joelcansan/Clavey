'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image as TiptapImage } from '@tiptap/extension-image'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { Bold, Italic, Heading2, List, ListOrdered, Highlighter, Image as ImageIcon } from 'lucide-react'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const supabase = createClient()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      TiptapImage.configure({ inline: false, allowBase64: false }),
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
      // Botón de eliminar imagen al hacer clic en la X
      handleClick(view, pos, event) {
        const target = event.target as HTMLElement
        if (target.closest('[data-delete-img]')) {
          const btn = target.closest('[data-delete-img]') as HTMLElement
          const imgPos = Number(btn.dataset.deleteImg)
          if (!isNaN(imgPos)) {
            const node = view.state.doc.nodeAt(imgPos)
            if (node && node.type.name === 'image') {
              view.dispatch(view.state.tr.delete(imgPos, imgPos + node.nodeSize))
              return true
            }
          }
        }
        return false
      },
    },
  })

  // Inyecta botones de eliminar sobre cada imagen del editor
  useEffect(() => {
    if (!editor) return

    function injectDeleteButtons() {
      const wrap = editor?.view.dom as HTMLElement
      if (!wrap) return

      // Quita botones previos
      wrap.querySelectorAll('.img-delete-btn').forEach(b => b.remove())

      wrap.querySelectorAll('img').forEach(img => {
        const parent = img.parentElement
        if (!parent) return
        if (parent.style.position !== 'relative') parent.style.position = 'relative'

        const btn = document.createElement('button')
        btn.className = 'img-delete-btn'
        btn.setAttribute('aria-label', 'Eliminar imagen')
        btn.setAttribute('title', 'Eliminar imagen')
        btn.type = 'button'
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`

        btn.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()
          // Encuentra la posición del nodo en el doc
          const view = editor?.view
          if (!view) return
          let found = false
          view.state.doc.descendants((node, pos) => {
            if (found) return false
            if (node.type.name === 'image' && node.attrs.src === img.src) {
              view.dispatch(view.state.tr.delete(pos, pos + node.nodeSize))
              found = true
              return false
            }
          })
        })

        parent.appendChild(btn)
      })
    }

    // Inyecta al inicio y cada vez que cambie el contenido
    const unsubscribe = editor.on('update', injectDeleteButtons)
    // También al montar
    setTimeout(injectDeleteButtons, 100)

    return () => {
      unsubscribe.removeAllListeners()
    }
  }, [editor])

  useEffect(() => { return () => { editor?.destroy() } }, [editor])

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

  const tools = [
    { icon: <Bold size={14} />, label: 'Negrita', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: <Italic size={14} />, label: 'Cursiva', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: <Heading2 size={14} />, label: 'Título', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    null,
    { icon: <List size={14} />, label: 'Lista con viñetas', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: <ListOrdered size={14} />, label: 'Lista numerada', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    null,
    { icon: <Highlighter size={14} />, label: 'Resaltar', action: () => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run(), active: editor.isActive('highlight') },
    { icon: <ImageIcon size={14} />, label: 'Imagen', action: handleImageUpload, active: false },
  ]

  return (
    <div className="tiptap-wrap">
      <div className="tiptap-toolbar" role="toolbar" aria-label="Herramientas del editor">
        <label className="tool-btn" title="Color de texto" aria-label="Color de texto">
          <span style={{ fontWeight: 700, fontSize: 13, borderBottom: '2px solid currentColor', paddingBottom: 1 }}>A</span>
          <input type="color" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' }}
            onChange={e => editor.chain().focus().setColor(e.target.value).run()} aria-label="Color de texto" />
        </label>
        <div className="tool-sep" aria-hidden="true" />
        {tools.map((tool, i) =>
          tool === null
            ? <div key={`sep-${i}`} className="tool-sep" aria-hidden="true" />
            : <button key={tool.label} onClick={tool.action} className={`tool-btn ${tool.active ? 'active' : ''}`}
                aria-label={tool.label} aria-pressed={tool.active} title={tool.label} type="button">
                {tool.icon}
              </button>
        )}
      </div>

      <EditorContent editor={editor} />

      <style>{`
        .tiptap-wrap { display: flex; flex-direction: column; }

        .tiptap-toolbar {
          display: flex; align-items: center; gap: 1px;
          padding: 8px 14px; border-bottom: 1px solid var(--border);
          flex-wrap: wrap; background: var(--surface);
        }
        .tool-btn {
          background: none; border: none; border-radius: 7px; padding: 6px 8px;
          color: var(--text-secondary); cursor: pointer; display: flex; align-items: center;
          justify-content: center; position: relative; transition: background .15s, color .15s; min-width: 30px;
        }
        .tool-btn:hover { background: var(--surface-2); color: var(--text-primary); }
        .tool-btn.active { background: rgba(0,113,227,0.12); color: var(--accent); }
        .tool-sep { width: 1px; height: 16px; background: var(--border); margin: 0 3px; flex-shrink: 0; }

        /* ── Editor ── */
        .tiptap-editor {
          padding: 16px 20px; min-height: 180px; outline: none;
          font-size: 15px; line-height: 1.65;
          color: var(--text-primary) !important;
          background: var(--surface);
        }
        .tiptap-editor * { color: inherit; }
        .tiptap-editor p { margin-bottom: 8px; color: var(--text-primary); }
        .tiptap-editor p:last-child { margin-bottom: 0; }
        .tiptap-editor h2 { font-size: 18px; font-weight: 700; margin-bottom: 10px; margin-top: 4px; letter-spacing: -0.3px; color: var(--text-primary); }
        .tiptap-editor strong { color: var(--text-primary); }
        .tiptap-editor em { color: var(--text-primary); }

        /* Listas */
        .tiptap-editor ul { list-style-type: disc !important; padding-left: 22px !important; margin-bottom: 8px; }
        .tiptap-editor ul li { display: list-item !important; list-style-type: disc !important; margin-bottom: 3px; color: var(--text-primary); }
        .tiptap-editor ol { list-style-type: decimal !important; padding-left: 22px !important; margin-bottom: 8px; }
        .tiptap-editor ol li { display: list-item !important; list-style-type: decimal !important; margin-bottom: 3px; color: var(--text-primary); }

        /* Imágenes con botón de eliminar */
        .tiptap-editor p:has(img) {
          position: relative;
          display: inline-block;
          width: 100%;
        }
        .tiptap-editor img {
          max-width: 100%; max-height: 320px; object-fit: cover;
          border-radius: 10px; margin: 8px 0; display: block;
        }

        /* Botón eliminar imagen */
        .img-delete-btn {
          position: absolute;
          top: 14px;
          right: 6px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(0,0,0,0.65);
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity .2s, transform .15s;
          z-index: 10;
          backdrop-filter: blur(4px);
        }
        .tiptap-editor p:has(img):hover .img-delete-btn,
        .tiptap-editor p:hover .img-delete-btn {
          opacity: 1;
        }
        .img-delete-btn:hover {
          opacity: 1 !important;
          transform: scale(1.1);
          background: rgba(220,38,38,0.85);
        }

        /* Placeholder */
        .tiptap-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
    </div>
  )
}

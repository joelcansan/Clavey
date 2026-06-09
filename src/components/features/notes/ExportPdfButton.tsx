'use client'

import { useState } from 'react'
import { FileDown } from 'lucide-react'

interface ExportPdfButtonProps {
  note: {
    title: string
    content: string | null
    bg_color: string
    tags: string[]
    created_at: string
  }
  style?: React.CSSProperties
}

export default function ExportPdfButton({ note, style }: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport(e: React.MouseEvent) {
    e.stopPropagation()
    if (isExporting) return
    setIsExporting(true)

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

      // Contenedor temporal fuera de pantalla
      const container = document.createElement('div')
      container.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 794px;
        padding: 60px 64px;
        background: ${note.bg_color || '#ffffff'};
        font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
        font-size: 15px;
        line-height: 1.65;
        color: #1d1d1f;
        box-sizing: border-box;
      `

      container.innerHTML = `
        <style>
          * { font-family: "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif !important; box-sizing: border-box; }
          .pdf-header { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid rgba(0,0,0,0.1); }
          .pdf-date { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #aeaeb2; margin-bottom: 10px; }
          .pdf-title { font-size: 30px; font-weight: 700; letter-spacing: -0.6px; color: #1d1d1f; margin-bottom: 14px; line-height: 1.15; }
          .pdf-tags { display: flex; gap: 6px; flex-wrap: wrap; }
          .pdf-tag { background: rgba(0,0,0,0.07); color: #6e6e73; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 980px; }
          .pdf-content { color: #1d1d1f; }
          .pdf-content p { margin-bottom: 10px; color: #1d1d1f; }
          .pdf-content h1 { font-size: 24px; font-weight: 700; margin: 6px 0 10px; letter-spacing: -0.4px; }
          .pdf-content h2 { font-size: 20px; font-weight: 700; margin: 6px 0 10px; letter-spacing: -0.3px; }
          .pdf-content h3 { font-size: 17px; font-weight: 700; margin: 6px 0 8px; }
          .pdf-content strong, .pdf-content b { font-weight: 700 !important; }
          .pdf-content em, .pdf-content i { font-style: italic !important; }
          .pdf-content u { text-decoration: underline !important; }
          .pdf-content s { text-decoration: line-through !important; }
          .pdf-content ul { list-style-type: disc !important; padding-left: 24px !important; margin-bottom: 10px; }
          .pdf-content ol { list-style-type: decimal !important; padding-left: 24px !important; margin-bottom: 10px; }
          .pdf-content li { display: list-item !important; margin-bottom: 4px; color: #1d1d1f; }
          .pdf-content img { max-width: 100%; max-height: 400px; border-radius: 10px; margin: 12px 0; display: block; object-fit: contain; }
          .pdf-content mark { background: #fef08a; padding: 1px 3px; border-radius: 2px; }
          .pdf-content code { font-family: "Courier New", monospace !important; background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-size: 13px; }
          .pdf-content blockquote { border-left: 3px solid #1d1d1f; padding-left: 16px; margin: 10px 0; color: #6e6e73; }
          .pdf-footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.08); display: flex; justify-content: space-between; align-items: center; }
          .pdf-footer span { font-size: 11px; color: #aeaeb2; font-weight: 500; }
        </style>

        <div class="pdf-header">
          <div class="pdf-date">
            ${new Date(note.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div class="pdf-title">${note.title}</div>
          ${note.tags.length > 0 ? `
            <div class="pdf-tags">
              ${note.tags.map(tag => `<span class="pdf-tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>

        <div class="pdf-content">
          ${note.content || '<p style="color:#aeaeb2">Sin contenido</p>'}
        </div>

        <div class="pdf-footer">
          <span>Clavey</span>
          <span>Exportado el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      `

      document.body.appendChild(container)

      // Espera a que carguen todas las imágenes
      const imgs = Array.from(container.querySelectorAll('img'))
      await Promise.all(imgs.map(img =>
        new Promise<void>(resolve => {
          if (img.complete) { resolve(); return }
          img.onload = () => resolve()
          img.onerror = () => resolve()
          setTimeout(resolve, 8000)
        })
      ))

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: note.bg_color || '#ffffff',
        logging: false,
        imageTimeout: 15000,
        width: 794,
      })

      document.body.removeChild(container)

      // Genera PDF paginado
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const canvasW = canvas.width
      const canvasH = canvas.height
      const ratio = pdfW / (canvasW / 2)
      const totalH = (canvasH / 2) * ratio
      const pageCanvasH = Math.floor((pdfH / ratio) * 2)

      let offsetY = 0
      let pageNum = 0

      while (offsetY < canvasH) {
        if (pageNum > 0) pdf.addPage()

        const sliceH = Math.min(pageCanvasH, canvasH - offsetY)
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvasW
        pageCanvas.height = sliceH
        const ctx = pageCanvas.getContext('2d')!
        ctx.drawImage(canvas, 0, offsetY, canvasW, sliceH, 0, 0, canvasW, sliceH)

        const imgData = pageCanvas.toDataURL('image/jpeg', 0.92)
        const renderedH = (sliceH / 2) * ratio
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, renderedH)

        offsetY += sliceH
        pageNum++
      }

      const filename = `${note.title
        .replace(/[^a-z0-9áéíóúüñàèìòùâêîôûäëïöü\s]/gi, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase()
        .slice(0, 60)}.pdf`

      pdf.save(filename)

    } catch (err) {
      console.error('Error exportando PDF:', err)
      alert('Error al exportar el PDF. Inténtalo de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      aria-label={`Exportar nota "${note.title}" a PDF`}
      title="Exportar a PDF"
      style={{
        background: 'none',
        border: 'none',
        cursor: isExporting ? 'not-allowed' : 'pointer',
        padding: '8px',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isExporting ? 0.4 : 0.5,
        transition: 'opacity .15s',
        color: 'inherit',
        ...style,
      }}
      onMouseEnter={e => { if (!isExporting) e.currentTarget.style.opacity = '1' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = isExporting ? '0.4' : '0.5' }}
    >
      {isExporting
        ? <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em' }}>PDF</span>
        : <FileDown size={13} aria-hidden="true" />
      }
    </button>
  )
}

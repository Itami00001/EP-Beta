'use client'

// PDF Export Button
// React: Обработка событий (jsrtPmFcHd) - скачивание PDF

import { Download } from 'lucide-react'

interface Column {
  header: string
  key: string
  width?: number
}

interface PDFExportButtonProps {
  data: Record<string, any>[]
  columns: Column[]
  filename: string
  title: string
}

export default function PDFExportButton({ data, columns, filename, title }: PDFExportButtonProps) {
  const handleExport = async () => {
    try {
      // Dynamic import pdf-lib
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')

      const pdfDoc = await PDFDocument.create()
      // Use Helvetica which supports basic Latin, but for Russian we need to use a different approach
      // For now, we'll use Helvetica and replace Russian characters with Latin equivalents
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      const pageWidth = 842  // A4 landscape
      const pageHeight = 595
      const margin = 40
      const rowHeight = 22
      const headerHeight = 36
      const titleHeight = 50

      let page = pdfDoc.addPage([pageWidth, pageHeight])
      let y = pageHeight - margin

      const colWidth = (pageWidth - margin * 2) / columns.length

      // Helper function to transliterate Russian to Latin
      const transliterate = (text: string): string => {
        const ru = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя'
        const en = 'ABVGDEEZhZIIKLMNOPRSTUFKhTsChShShchY YuYaabvgdeejzijklmnoprstufkhtschshshch y yuya'
        return text.split('').map(char => {
          const idx = ru.indexOf(char)
          return idx !== -1 ? en[idx] : char
        }).join('')
      }

      // Draw title
      page.drawText(transliterate(title), {
        x: margin,
        y: y - 20,
        size: 16,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.5),
      })
      y -= titleHeight

      // Draw header row
      page.drawRectangle({
        x: margin,
        y: y - headerHeight,
        width: pageWidth - margin * 2,
        height: headerHeight,
        color: rgb(0.2, 0.2, 0.6),
      })

      columns.forEach((col, i) => {
        const text = transliterate(col.header.substring(0, 15))
        page.drawText(text, {
          x: margin + i * colWidth + 6,
          y: y - headerHeight + 10,
          size: 10,
          font: boldFont,
          color: rgb(1, 1, 1),
        })
      })
      y -= headerHeight

      // Draw data rows
      data.forEach((row, rowIdx) => {
        // New page if needed
        if (y - rowHeight < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight])
          y = pageHeight - margin
        }

        // Alternating row color
        if (rowIdx % 2 === 0) {
          page.drawRectangle({
            x: margin,
            y: y - rowHeight,
            width: pageWidth - margin * 2,
            height: rowHeight,
            color: rgb(0.95, 0.95, 0.95),
          })
        }

        // Row border
        page.drawRectangle({
          x: margin,
          y: y - rowHeight,
          width: pageWidth - margin * 2,
          height: rowHeight,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 0.5,
        })

        columns.forEach((col, i) => {
          const value = row[col.key]
          const text = transliterate(String(value ?? '-')).substring(0, 18)
          page.drawText(text, {
            x: margin + i * colWidth + 6,
            y: y - rowHeight + 7,
            size: 9,
            font,
            color: rgb(0.1, 0.1, 0.1),
          })
        })

        y -= rowHeight
      })

      // Footer
      const pages = pdfDoc.getPages()
      pages.forEach((p, i) => {
        p.drawText(transliterate(`Страница ${i + 1} из ${pages.length} | JournalistHub`), {
          x: margin,
          y: 20,
          size: 8,
          font,
          color: rgb(0.5, 0.5, 0.5),
        })
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Ошибка при создании PDF')
    }
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
    >
      <Download size={18} />
      <span>Скачать PDF</span>
    </button>
  )
}

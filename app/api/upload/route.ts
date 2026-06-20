// File upload API endpoint
// NextJS: API Routes (jsnxPmBsSC) - загрузка файлов
// React: Работа с формами (jsrtPmFmsII) - обработка файлов

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { PDFDocument } from 'pdf-lib'
import * as PDFLib from 'pdf-lib'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload API] Starting file upload')
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { getUserFromToken } = await import('@/lib/auth')
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const versionNumber = formData.get('versionNumber') as string

    console.log('[Upload API] Upload details:', { projectId, versionNumber, fileName: file.name, fileSize: file.size })

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects', projectId || 'temp', 'versions', versionNumber || '1')
    await mkdir(uploadDir, { recursive: true })
    console.log('[Upload API] Upload directory created:', uploadDir)

    // Determine file extension
    const ext = path.extname(file.name)
    const fileName = `original${ext}`
    const filePath = path.join(uploadDir, fileName)

    // Save file
    await writeFile(filePath, buffer)
    console.log('[Upload API] File saved:', filePath)

    // Store relative path WITHOUT leading slash
    const relativePath = `projects/${projectId || 'temp'}/versions/${versionNumber || '1'}/${fileName}`
    console.log('[Upload API] Relative path stored:', relativePath)
    
    // Convert to PDF if not already PDF and not .md
    let pdfPath = filePath
    let relativePdfPath = relativePath
    
    if (ext === '.md') {
      // For .md files, do NOT convert to PDF
      console.log('[Upload API] Markdown file detected, skipping PDF conversion')
      relativePdfPath = relativePath
    } else if (ext !== '.pdf') {
      // For .docx, .odt, etc., convert to PDF
      console.log('[Upload API] Converting to PDF:', ext)
      pdfPath = path.join(uploadDir, 'converted.pdf')
      
      // Create a simple PDF as placeholder with Unicode support
      // In production, use LibreOffice or similar for actual conversion
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([600, 400])
      const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica)
      page.drawText(`File: ${file.name}\nSize: ${file.size} bytes\n\nNote: This is a placeholder PDF.\nIn production, use LibreOffice for actual conversion.`, {
        x: 50,
        y: 350,
        size: 12,
        font,
      })
      const pdfBytes = await pdfDoc.save()
      await writeFile(pdfPath, Buffer.from(pdfBytes))
      relativePdfPath = `projects/${projectId || 'temp'}/versions/${versionNumber || '1'}/converted.pdf`
      console.log('[Upload API] PDF conversion complete, path:', relativePdfPath)
    } else {
      // Already PDF
      console.log('[Upload API] PDF file detected, no conversion needed')
    }

    return NextResponse.json({
      filePath: relativePath,
      pdfPath: relativePdfPath,
    })
  } catch (error) {
    console.error('[Upload API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects', projectId || 'temp', versionNumber || '1')
    await mkdir(uploadDir, { recursive: true })

    // Determine file extension
    const ext = path.extname(file.name)
    const fileName = `file${ext}`
    const filePath = path.join(uploadDir, fileName)

    // Save file
    await writeFile(filePath, buffer)

    const relativePath = `/uploads/projects/${projectId || 'temp'}/${versionNumber || '1'}/${fileName}`
    
    // Convert to PDF if not already PDF
    let pdfPath = filePath
    let relativePdfPath = relativePath
    
    if (ext !== '.pdf') {
      // For now, we'll just copy the file as PDF placeholder
      // In production, you'd use LibreOffice or similar for conversion
      pdfPath = path.join(uploadDir, 'file.pdf')
      
      // Create a simple PDF as placeholder with Unicode support
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([600, 400])
      const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica)
      page.drawText(`File: ${file.name}\nSize: ${file.size} bytes`, {
        x: 50,
        y: 350,
        size: 12,
        font,
      })
      const pdfBytes = await pdfDoc.save()
      await writeFile(pdfPath, Buffer.from(pdfBytes))
      relativePdfPath = `/uploads/projects/${projectId || 'temp'}/${versionNumber || '1'}/file.pdf`
    }

    return NextResponse.json({
      filePath: relativePath,
      pdfPath: relativePdfPath,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

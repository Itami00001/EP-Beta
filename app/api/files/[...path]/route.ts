// File serving API endpoint
// NextJS: API Routes (jsnxPmBsSC) - обслуживание файлов
// NextJS: Dynamic Routes (jsnxPmRtDy) - [...path] параметр

import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath)
    
    console.log('[File API] Requested path:', filePath)
    console.log('[File API] Full path:', fullPath)
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase()
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.md': 'text/markdown',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.odt': 'application/vnd.oasis.opendocument.text',
    }
    
    const contentType = contentTypes[ext] || 'application/octet-stream'
    
    console.log('[File API] Content type:', contentType)
    
    // For .md files, return text content
    if (ext === '.md') {
      const file = await readFile(fullPath, 'utf-8')
      console.log('[File API] Returning markdown text, length:', file.length)
      return new NextResponse(file, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=31536000',
        },
      })
    }
    
    const file = await readFile(fullPath)
    console.log('[File API] File read successfully, size:', file.length)
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('[File API] Error:', error)
    return NextResponse.json(
      { error: 'File not found', details: String(error) },
      { status: 404 }
    )
  }
}

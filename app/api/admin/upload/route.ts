import { requireAdmin } from '@/lib/adminAuth'
import { NextResponse, type NextRequest } from 'next/server'
import { uploadToYandex } from '@/lib/upload-to-yandex'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  try {
    const result = await uploadToYandex('products', file)
    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

import { requireAdmin } from '@/lib/adminAuth'
import { NextRequest, NextResponse } from 'next/server'
import { yandexS3 } from '@/lib/yandex-storage'
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'

const BUCKET = process.env.YANDEX_STORAGE_BUCKET || 'threep-media'
const BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || 'https://storage.yandexcloud.net/threep-media'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const files: Array<{ bucket: string; name: string; url: string; size: number; created_at: string; mime: string }> = []

  try {
    const { Contents } = await yandexS3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 500 })
    )
    for (const obj of Contents ?? []) {
      if (!obj.Key) continue
      const ext = path.extname(obj.Key).toLowerCase()
      const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
        '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4', '.webm': 'video/webm',
      }
      files.push({
        bucket: 'yandex',
        name: obj.Key,
        url: `${BASE_URL}/${obj.Key}`,
        size: obj.Size ?? 0,
        created_at: obj.LastModified?.toISOString() ?? '',
        mime: mimeMap[ext] ?? 'application/octet-stream',
      })
    }
  } catch (err) {
    console.error('Yandex listing error:', err)
  }

  // Static files from public/images
  const publicImagesDir = path.join(process.cwd(), 'public', 'images')
  if (fs.existsSync(publicImagesDir)) {
    const staticFiles = fs.readdirSync(publicImagesDir, { withFileTypes: true })
    for (const entry of staticFiles) {
      if (!entry.isFile()) continue
      const filePath = path.join(publicImagesDir, entry.name)
      const stat = fs.statSync(filePath)
      const ext = path.extname(entry.name).toLowerCase()
      const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
        '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
        '.pdf': 'application/pdf',
      }
      files.push({
        bucket: 'static',
        name: entry.name,
        url: `/images/${encodeURIComponent(entry.name)}`,
        size: stat.size,
        created_at: stat.mtime.toISOString(),
        mime: mimeMap[ext] ?? 'application/octet-stream',
      })
    }
  }

  return NextResponse.json({ files, buckets: ['yandex', 'static'] })
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { bucket, name } = await req.json()
  if (!bucket || !name) return NextResponse.json({ error: 'Invalid params' }, { status: 400 })

  if (bucket === 'static') {
    const safeName = path.basename(name)
    const filePath = path.join(process.cwd(), 'public', 'images', safeName)
    if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'File not found' }, { status: 404 })
    try {
      fs.unlinkSync(filePath)
      return NextResponse.json({ ok: true })
    } catch (err) {
      console.error('Static delete error:', err)
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
  }

  try {
    await yandexS3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: name }))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}

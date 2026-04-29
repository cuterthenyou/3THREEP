import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/isAdmin'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = await createAdminClient()
  const files: Array<{ bucket: string; name: string; url: string; size: number; created_at: string; mime: string }> = []

  const { data: buckets } = await admin.storage.listBuckets()
  const bucketNames = (buckets ?? []).map((b: { name: string }) => b.name)

  for (const bucket of bucketNames) {
    const { data } = await admin.storage.from(bucket).list('', {
      limit: 500,
      sortBy: { column: 'created_at', order: 'desc' },
    })
    if (data) {
      for (const file of data) {
        if (!file.name || file.name === '.emptyFolderPlaceholder') continue
        const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(file.name)
        files.push({
          bucket,
          name: file.name,
          url: publicUrl,
          size: file.metadata?.size ?? 0,
          created_at: file.created_at ?? '',
          mime: file.metadata?.mimetype ?? '',
        })
      }
    }
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

  return NextResponse.json({ files, buckets: [...bucketNames, 'static'] })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { bucket, name } = await req.json()
  if (!bucket || !name) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { error } = await admin.storage.from(bucket).remove([name])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

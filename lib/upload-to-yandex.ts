import { PutObjectCommand } from '@aws-sdk/client-s3'
import { yandexS3 } from './yandex-storage'
import sharp from 'sharp'

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

async function optimizeBuffer(buf: Buffer, mimeType: string): Promise<Buffer> {
  if (!IMAGE_MIME_TYPES.has(mimeType)) return buf;
  if (mimeType === 'image/png') {
    return sharp(buf)
      .resize({ width: 2000, withoutEnlargement: true })
      .png({ compressionLevel: 8 })
      .toBuffer();
  }
  return sharp(buf)
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();
}

export async function uploadToYandex(
  folder: 'products' | 'assets' | 'avatars',
  file: File,
  customFileName?: string
) {
  const bytes = await file.arrayBuffer()
  const raw = Buffer.from(bytes)
  const buffer = await optimizeBuffer(raw, file.type)

  let contentType: string
  let ext: string
  if (!IMAGE_MIME_TYPES.has(file.type)) {
    contentType = file.type
    ext = file.name.split('.').pop() ?? 'bin'
  } else if (file.type === 'image/png') {
    contentType = 'image/png'
    ext = 'png'
  } else {
    contentType = 'image/jpeg'
    ext = 'jpg'
  }
  const fileName = customFileName || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const key = `${folder}/${fileName}`

  await yandexS3.send(
    new PutObjectCommand({
      Bucket: process.env.YANDEX_STORAGE_BUCKET || 'threep-media',
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )

  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || 'https://storage.yandexcloud.net/threep-media'
  
  return {
    fileName,
    key,
    url: `${baseUrl}/${key}`,
  }
}

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { yandexS3 } from './yandex-storage'
import sharp from 'sharp'

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

const FOLDER_MAX_WIDTHS: Record<string, number> = {
  avatars: 400,
  assets: 1920,
  products: 1920,
}

// Hero/product imagery wants crisper output; avatars stay leaner.
const FOLDER_QUALITY: Record<string, number> = {
  avatars: 80,
  assets: 85,
  products: 85,
}

async function optimizeBuffer(buf: Buffer, mimeType: string, folder: string): Promise<Buffer> {
  if (!IMAGE_MIME_TYPES.has(mimeType)) return buf;
  const width = FOLDER_MAX_WIDTHS[folder] ?? 1920;
  const quality = FOLDER_QUALITY[folder] ?? 82;
  // Аватары всегда приводим к квадрату (cover, центр) — иначе прямоугольное
  // фото растягивает/искажает круглый аватар в ЛК. Остальное — по ширине.
  if (folder === 'avatars') {
    return sharp(buf)
      .resize(width, width, { fit: 'cover', position: 'centre' })
      .webp({ quality })
      .toBuffer();
  }
  return sharp(buf)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
}

export async function uploadToYandex(
  folder: 'products' | 'assets' | 'avatars',
  file: File,
  customFileName?: string
) {
  const bytes = await file.arrayBuffer()
  const raw = Buffer.from(bytes)
  const buffer = await optimizeBuffer(raw, file.type, folder)

  let contentType: string
  let ext: string
  if (!IMAGE_MIME_TYPES.has(file.type)) {
    contentType = file.type
    ext = file.name.split('.').pop() ?? 'bin'
  } else {
    contentType = 'image/webp'
    ext = 'webp'
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

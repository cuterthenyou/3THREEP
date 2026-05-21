import { PutObjectCommand } from '@aws-sdk/client-s3'
import { yandexS3 } from './yandex-storage'

export async function uploadToYandex(
  folder: 'products' | 'assets' | 'avatars',
  file: File,
  customFileName?: string
) {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const fileName = customFileName || `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop() ?? 'jpg'}`
  const key = `${folder}/${fileName}`

  await yandexS3.send(
    new PutObjectCommand({
      Bucket: process.env.YANDEX_STORAGE_BUCKET || 'threep-media',
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  )

  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || 'https://storage.yandexcloud.net/threep-media'
  
  return {
    fileName,
    key,
    url: `${baseUrl}/${key}`,
  }
}

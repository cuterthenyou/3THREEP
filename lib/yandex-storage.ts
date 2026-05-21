import { S3Client } from '@aws-sdk/client-s3'

export const yandexS3 = new S3Client({
  region: process.env.YANDEX_STORAGE_REGION || 'ru-central1',
  endpoint: process.env.YANDEX_STORAGE_ENDPOINT || 'https://storage.yandexcloud.net',
  credentials: {
    accessKeyId: process.env.YANDEX_STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.YANDEX_STORAGE_SECRET_KEY!,
  },
})

export function getPublicFileUrl(folder: 'products' | 'assets' | 'avatars', fileName: string) {
  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || 'https://storage.yandexcloud.net/threep-media'
  return `${baseUrl}/${folder}/${fileName}`
}

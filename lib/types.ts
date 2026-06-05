// Supabase types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  sizes: string[]
  colors: string[]
  stock: number
  active: boolean
  category: string
  product_type: string | null
  bg_url: string | null
  created_at: string
}

export interface Category {
  slug: string
  name: string
  active: boolean
  texture_url: string | null
  texture_url_2: string | null
  texture_url_3: string | null
  logo_top_url: string | null
  logo_bottom_url: string | null
  modal_bg_url: string | null
}

export type OrderStatus = 'new' | 'paid' | 'in_progress' | 'shipped' | 'delivered' | 'cancelled'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  paid: 'Оплачен',
  in_progress: 'В работе',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image: string | null
  size: string | null
  color: string | null
  quantity: number
  price: number
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  delivery_address: string | null
  tracking_number: string | null
  comment: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface Profile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
}

export interface Message {
  id: string
  order_id: string
  sender_id: string
  is_admin: boolean
  text: string
  created_at: string
}

export interface CartItem {
  product: Product
  size: string
  color: string
  quantity: number
}

export interface ProductCategory {
  slug: string
  name: string
}

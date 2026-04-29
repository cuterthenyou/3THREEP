-- Профили пользователей (расширяет auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  created_at timestamptz default now()
);

-- Триггер: автоматически создаёт профиль при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Товары
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text default '',
  price integer not null,
  images text[] default '{}',
  sizes text[] default '{}',
  colors text[] default '{}',
  stock integer default 0,
  active boolean default true,
  category text default 'general',
  created_at timestamptz default now()
);

-- Заказы
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  status text default 'new' check (status in ('new','paid','in_progress','shipped','delivered','cancelled')),
  total integer not null,
  delivery_address text,
  tracking_number text,
  comment text,
  created_at timestamptz default now()
);

-- Позиции заказа
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  product_image text,
  size text,
  color text,
  quantity integer not null default 1,
  price integer not null
);

-- Сообщения (чат в заказе)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  sender_id uuid references auth.users(id),
  is_admin boolean default false,
  text text not null,
  created_at timestamptz default now()
);

-- RLS (безопасность на уровне строк)
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.messages enable row level security;

-- profiles: пользователь видит только свой профиль
create policy "Own profile" on public.profiles
  for all using (auth.uid() = id);

-- products: все видят активные товары
create policy "Public products" on public.products
  for select using (active = true);

-- orders: пользователь видит только свои заказы
create policy "Own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Create own order" on public.orders
  for insert with check (auth.uid() = user_id);

-- order_items: видит тот, чей заказ
create policy "Own order items" on public.order_items
  for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );

create policy "Create order items" on public.order_items
  for insert with check (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );

-- messages: участники заказа
create policy "Order messages" on public.messages
  for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );

create policy "Send message" on public.messages
  for insert with check (auth.uid() = sender_id);

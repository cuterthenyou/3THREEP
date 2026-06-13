'use client';

import { signOut } from 'next-auth/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import type { Order, Profile, OrderStatus, Product, Category } from '@/lib/types';
import { ORDER_STATUS_LABELS, STATUS_COLORS } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { toggleTheme } from '@/lib/theme';

import EmojiPicker from '@/components/EmojiPicker';
import ProductModal from '@/components/ProductModal';
import NotificationBell from '@/components/NotificationBell';
import MarqueeTicker from '@/components/MarqueeTicker';
import { BrutalSun, BrutalMoon, LvlFire, LvlBolt, LvlStar, LvlCircle, OvalTribalFrame, Medal } from './parts/icons';
import s from './account.module.css';

interface Gamification {
  sparks: number;
  level: number;
  discount: number;
  progressPct: number;
  toNext: number;
  tierKey: string;
  tierLabel: string;
}

interface AchievementView {
  key: string;
  title: string;
  description: string | null;
  medal_key: string | null;
  unlocked: boolean;
  showcased: boolean;
}

interface Props {
  user: { id: string; email: string };
  profile: Profile | null;
  orders: Order[];
  profileBg?: string | null;
  profileBgDark?: string | null;
  newsletterSubscribed?: boolean;
  tickerTexts?: string[];
  accountTickerTexts?: string[];
  gamification: Gamification;
  catalogProducts?: Product[];
  catalogCategories?: Category[];
  achievements?: AchievementView[];
  levelTip?: string;
  discountTip?: string;
}

const DEFAULT_LEVEL_TIP = 'Уровень растёт от искорок за полученные заказы. Чем выше уровень — тем больше скидка.';
const DEFAULT_DISCOUNT_TIP = 'Скидка применяется к ценам в каталоге автоматически. Цена округляется вниз до кратной 3.';

// Вещь «в инвентаре» = заказ оплачен и не отменён. Появляется после оплаты,
// исчезает при отмене. (Искры/скидка — отдельно, только при 'delivered'.)
const OWNED_STATUSES: OrderStatus[] = ['paid', 'in_progress', 'shipped', 'delivered'];

function getUsername(email: string, name: string | null) {
  if (name) return name.toUpperCase();
  return email.split('@')[0].toUpperCase();
}

export default function AccountClient({ user, profile, orders, profileBg, profileBgDark, newsletterSubscribed, tickerTexts, accountTickerTexts, gamification, catalogProducts = [], catalogCategories = [], achievements = [], levelTip, discountTip }: Props) {
  const levelTipText = levelTip?.trim() || DEFAULT_LEVEL_TIP;
  const discountTipText = discountTip?.trim() || DEFAULT_DISCOUNT_TIP;
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [showNicknameModal, setShowNicknameModal] = useState(!profile?.name);
  const [nicknameInput, setNicknameInput] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.name ?? null);
  const [subscribed, setSubscribed] = useState(newsletterSubscribed ?? false);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [batScores, setBatScores] = useState<{ normal: number | null; death: number | null }>({ normal: null, death: null });

  useEffect(() => {
    setIsDark(document.documentElement.dataset.theme === 'dark');
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.dataset.theme === 'dark')
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    try {
      const parse = (k: string) => {
        const v = localStorage.getItem(k);
        const n = v !== null ? parseInt(v, 10) : NaN;
        return Number.isFinite(n) ? n : null;
      };
      // раздельные рекорды; общий ключ — фолбэк для старых записей (в NORMAL)
      const normal = parse('threep-bat-hs-normal') ?? parse('threep-bat-hs');
      const death = parse('threep-bat-hs-death');
      setBatScores({ normal, death });
    } catch {}
  }, []);

  // Только оплаченные (не отменённые) заказы попадают в инвентарь
  const ownedOrders = orders.filter((o) => OWNED_STATUSES.includes(o.status));
  const allItems = ownedOrders.flatMap((o) => o.order_items ?? []);
  const uniqueItems = [...new Map(allItems.map((i) => [i.product_id, i])).values()];
  const { sparks, level, discount, progressPct, toNext, tierLabel } = gamification;
  const username = getUsername(user.email, displayName);

  // ── Коллекции из БД ───────────────────────────────────────────────────
  const ownedIds = useMemo(
    () => new Set(allItems.map((i) => i.product_id).filter(Boolean) as string[]),
    [allItems]
  );

  // Категории, у которых есть товары (= коллекции бренда)
  const collectionsList = useMemo(() => {
    const withProducts = new Set(catalogProducts.map((p) => p.category));
    return catalogCategories.filter((c) => withProducts.has(c.slug));
  }, [catalogCategories, catalogProducts]);

  const [invCategory, setInvCategory] = useState<string>('');
  const [invType, setInvType] = useState<string>('all');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Дефолтная выбранная коллекция — первая доступная
  useEffect(() => {
    if (!invCategory && collectionsList.length) setInvCategory(collectionsList[0].slug);
  }, [collectionsList, invCategory]);

  const activeCategory = invCategory || collectionsList[0]?.slug || '';
  const categoryProducts = useMemo(
    () => catalogProducts.filter((p) => p.category === activeCategory),
    [catalogProducts, activeCategory]
  );
  const invTypes = useMemo(
    () => [...new Set(categoryProducts.map((p) => p.product_type).filter(Boolean))] as string[],
    [categoryProducts]
  );
  const invItems = useMemo(
    () => (invType === 'all' ? categoryProducts : categoryProducts.filter((p) => p.product_type === invType)),
    [categoryProducts, invType]
  );

  const activeCat = catalogCategories.find((c) => c.slug === activeCategory);
  const modalBg = (isDark ? activeCat?.modal_bg_url_dark : activeCat?.modal_bg_url) ?? null;

  function openProductModal(p: Product) {
    setModalProduct(p);
    setModalVisible(true);
  }
  function closeProductModal() {
    setModalVisible(false);
    setTimeout(() => setModalProduct(null), 250);
  }

  // Ачивки-медали теперь информационные (без «витрины») — счётчик открытых.
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  async function handleSaveNickname() {
    const trimmed = nicknameInput.trim();
    if (!trimmed) { setNicknameError('Введи никнейм'); return; }
    if (trimmed.length < 2) { setNicknameError('Минимум 2 символа'); return; }
    if (trimmed.length > 20) { setNicknameError('Максимум 20 символов'); return; }
    setSavingNickname(true);
    setNicknameError('');
    const res = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    });
    if (!res.ok) { setNicknameError('Ошибка сохранения'); setSavingNickname(false); return; }
    setDisplayName(trimmed);
    setShowNicknameModal(false);
    setSavingNickname(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/account/avatar', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setAvatarUrl(data.url + '?t=' + Date.now());
    setUploadingAvatar(false);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await signOut({ callbackUrl: '/' });
  }

  async function handleUnsubscribe() {
    setUnsubscribing(true);
    await fetch('/api/newsletter/unsubscribe', { method: 'POST' }).catch(() => {});
    setSubscribed(false);
    setUnsubscribing(false);
  }

  function insertEmojiInNickname(emoji: string) {
    const input = nicknameRef.current;
    if (!input) { setNicknameInput(v => v + emoji); return; }
    const start = input.selectionStart ?? nicknameInput.length;
    const end = input.selectionEnd ?? nicknameInput.length;
    const next = nicknameInput.slice(0, start) + emoji + nicknameInput.slice(end);
    setNicknameInput(next);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  return (
    <div className={s.page} style={(() => { const bg = isDark ? (profileBgDark ?? profileBg) : (profileBg ?? profileBgDark); return bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : undefined })()} >
      {/* Nickname modal */}
      {showNicknameModal && (
        <div className={s.modalOverlay}>
          <div className={s.modalCard}>
            <div>
              <h2 className={s.modalTitle}>ТВОЙ ПОЗЫВНОЙ</h2>
              <p className={s.modalSubtitle}>Как тебя звать в THREEP?</p>
            </div>
            <div className="flex flex-col gap-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  ref={nicknameRef}
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => { setNicknameInput(e.target.value); setNicknameError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                  placeholder="nickname"
                  maxLength={20}
                  autoFocus
                  className={s.modalInput}
                  style={{ flex: 1 }}
                />
                <EmojiPicker onSelect={insertEmojiInNickname} />
              </div>
              {nicknameError && <p className={s.modalError}>{nicknameError}</p>}
            </div>
            <button
              onClick={handleSaveNickname}
              disabled={savingNickname}
              className={s.modalBtn}
            >
              {savingNickname ? 'Сохраняем...' : 'Подтвердить'}
            </button>
          </div>
        </div>
      )}

      <div className={s.content}>
        <div className={s.inner}>
          {/* Top nav — на мобиле текст сворачивается в иконки (не влезал) */}
          <div className={s.topNav}>
            <Link href="/" className={s.topNavLink} aria-label="На главную" title="На главную">
              <svg className={s.navIcon} width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M7 1 L13 6 H11 V13 H8.5 V9 H5.5 V13 H3 V6 H1 Z"/></svg>
              <span className={s.navLabel}>← На главную</span>
            </Link>
            <div className={s.topNavActions}>
              <NotificationBell />
              <button onClick={handleLogout} disabled={loggingOut} className={s.topNavBtn} aria-label="Выйти" title="Выйти">
                {loggingOut ? '...' : (
                  <>
                    <svg className={s.navIcon} width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" aria-hidden="true"><path d="M6 2 H3 V14 H6"/><path d="M10 5 L13 8 L10 11"/><path d="M13 8 H6"/></svg>
                    <span className={s.navLabel}>Выйти</span>
                  </>
                )}
              </button>
              <button onClick={() => { toggleTheme(); setIsDark(d => !d); }} className={s.topNavBtn} title={isDark ? 'Светлая тема' : 'Тёмная тема'} aria-label="Сменить тему">
                {isDark ? <BrutalSun /> : <BrutalMoon />}
              </button>
            </div>
          </div>

          {/* Ticker — under nav, full viewport width */}
          {(accountTickerTexts ?? tickerTexts ?? []).length > 0 && (
            <div className={s.tickerWrap}>
              <MarqueeTicker texts={accountTickerTexts ?? tickerTexts ?? []} />
            </div>
          )}

          {/* Profile card */}
          <div className={`${s.profileCard} hud-corners`}>
            <div className={s.profileInfo}>
              <div className={s.badgeRow}>
                <span className={s.badgeWrap}>
                  <span className={`${s.levelBadge} ${s.tier}`} data-tier={gamification.tierKey}>
                    LVL {level}
                  </span>
                  <span className={s.badgeTip} role="tooltip">
                    <span className={s.medalTipTitle}>Уровень {level} · {tierLabel}</span>
                    <span className={s.medalTipDesc}>{levelTipText}</span>
                  </span>
                </span>
                {discount > 0 && (
                  <span className={s.badgeWrap}>
                    <span className={s.discountBadge}>−{discount}%</span>
                    <span className={s.badgeTip} role="tooltip">
                      <span className={s.medalTipTitle}>Скидка −{discount}%</span>
                      <span className={s.medalTipDesc}>{discountTipText}</span>
                    </span>
                  </span>
                )}
              </div>
              <h2 className={s.username}>{username}</h2>

              {/* Ачивки-медали — информационные, с hover-тултипом (за что получена) */}
              {achievements.length > 0 && (
                <div className={s.medalsRow}>
                  {achievements.map((a) => (
                    <span key={a.key} className={s.medalWrap}>
                      <span
                        className={`${s.medal} ${a.unlocked ? s.medalUnlocked : s.medalLocked}`}
                        aria-label={a.title}
                      >
                        <Medal kind={a.medal_key ?? ''} size={24} />
                      </span>
                      <span className={s.medalTip} role="tooltip">
                        <span className={s.medalTipTitle}>{a.unlocked ? a.title : `🔒 ${a.title}`}</span>
                        {a.description && <span className={s.medalTipDesc}>{a.description}</span>}
                        {!a.unlocked && <span className={s.medalTipHint}>ещё не открыта</span>}
                      </span>
                    </span>
                  ))}
                  <span className={s.medalsCount}>{unlockedCount}/{achievements.length}</span>
                </div>
              )}

              <div className="flex gap-2">
                {uniqueItems.slice(0, 4).map((item, i) => (
                  <div key={i} className={s.avatarThumb}>
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-xs"
                        style={{ background: 'var(--bg-subtle)', color: 'var(--accent)' }}
                      >
                        {item.product_name[0]}
                      </div>
                    )}
                  </div>
                ))}
                {uniqueItems.length === 0 &&
                  [0, 1, 2, 3].map((i) => <div key={i} className={s.avatarThumbEmpty} />)}
              </div>

              <div className="flex flex-col gap-1">
                {[
                  { label: 'Искорки', value: sparks },
                  { label: 'Шмот', value: uniqueItems.length },
                  { label: 'Заказы', value: orders.length },
                ].map(({ label, value }) => (
                  <p key={label} className={s.stat}>
                    <span className={s.statLabel}>{label}: </span>
                    <span>{value}</span>
                  </p>
                ))}
              </div>

              {/* Sparks progress bar — прокачка уровня + всплывающая подсказка */}
              <div className={s.sparksWrap}>
                <div className={s.sparksBar} data-tier={gamification.tierKey}>
                  <div className={s.sparksFill} style={{ width: `${Math.round(progressPct * 100)}%` }} />
                  <span className={s.sparksHint}>
                    LVL {level} · {Math.round(progressPct * 100)}%
                  </span>
                </div>
                <div className={s.sparksTip} role="tooltip">
                  {toNext > 0
                    ? `Искорки: ${sparks} · до LVL ${level + 1} ещё ${toNext}`
                    : 'Максимальный уровень достигнут'}
                </div>
              </div>
            </div>

            {/* Avatar — right column, full card height, обрамлён нео-трайбл овалом */}
            <div className={s.avatarCol}>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                className={s.avatarBtn}
                title="Сменить аватарку"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="avatar" fill className="object-cover" sizes="160px" />
                ) : (
                  <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {level >= 4 ? <LvlFire /> : level >= 3 ? <LvlBolt /> : level >= 2 ? <LvlStar /> : <LvlCircle />}
                  </span>
                )}
                <div className={s.avatarOverlay}>
                  {uploadingAvatar ? '...' : 'Сменить'}
                </div>
              </button>
              {/* Декоративная трайбл-рама вокруг аватара (тянется влево в пустоту карточки) */}
              <div className={s.avatarFrame} aria-hidden="true"><OvalTribalFrame /></div>
            </div>
          </div>

          {/* Bat hunt high score — раздельно по сложности (NORMAL / DEATH) */}
          {(batScores.normal !== null || batScores.death !== null) && (
            <div className={s.batScoreCard}>
              <span className={s.batScoreLabel}>РЕК. ОХОТЫ</span>
              <div className={s.batScoreList}>
                <span className={s.batScoreItem}>
                  <span className={s.batScoreDiff}>NORMAL</span>
                  <span className={s.batScoreNum}>×{batScores.normal ?? 0}</span>
                </span>
                <span className={s.batScoreItem}>
                  <span className={`${s.batScoreDiff} ${s.batScoreDiffDeath}`}>DEATH</span>
                  <span className={s.batScoreNum}>×{batScores.death ?? 0}</span>
                </span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className={s.tabs}>
            {(['inventory', 'orders'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? s.tabActive : s.tab}
              >
                {tab === 'inventory' ? 'Инвентарь' : 'Заказы'}
              </button>
            ))}
          </div>

          {/* Inventory tab */}
          {activeTab === 'inventory' && (
            <div className={s.inventoryCard}>
              <div className={s.inventoryHeader}>
                <div>
                  <p className={s.collectionsLabel}>Инвентарь</p>
                  <p className={s.inventoryTitle}>ШМОТ</p>
                </div>
              </div>

              {/* Выбор коллекции */}
              {collectionsList.length > 1 && (
                <div className={s.chipRow}>
                  {collectionsList.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => { setInvCategory(c.slug); setInvType('all'); }}
                      className={c.slug === activeCategory ? s.chipActive : s.chip}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Выбор типа вещи */}
              {invTypes.length > 0 && (
                <div className={s.chipRow}>
                  <button onClick={() => setInvType('all')} className={invType === 'all' ? s.chipActive : s.chip}>Все</button>
                  {invTypes.map((t) => (
                    <button key={t} onClick={() => setInvType(t)} className={invType === t ? s.chipActive : s.chip}>{t}</button>
                  ))}
                </div>
              )}

              <div className={s.inventoryGrid}>
                {invItems.length === 0 ? (
                  <div className={s.inventorySlotEmpty}>?</div>
                ) : (
                  invItems.map((p) => {
                    const owned = ownedIds.has(p.id);
                    if (p.coming_soon && !owned) {
                      return <div key={p.id} className={s.inventorySlotEmpty} title="Скоро">?</div>;
                    }
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => openProductModal(p)}
                        className={owned ? s.invItemOwned : s.invItemLocked}
                        title={owned ? p.name : `${p.name} — ещё не в инвентаре`}
                      >
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="80px" />
                        ) : (
                          <span className={s.invItemName}>{p.name}</span>
                        )}
                        {owned && <span className={s.invOwnedTag} aria-label="В инвентаре">✓</span>}
                      </button>
                    );
                  })
                )}
              </div>

              <Link href={`/?category=${activeCategory}#catalog`} className={`${s.ctaBtn} blade-glint blade-glint-ambient`}>
                {categoryProducts.some((p) => ownedIds.has(p.id)) ? 'Добить коллекцию' : 'Собери коллекцию'}
              </Link>
            </div>
          )}

          {/* Orders tab */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-3">
              {orders.length === 0 ? (
                <div className={s.emptyOrders}>Заказов пока нет</div>
              ) : (
                orders.map((order) => (
                  <Link key={order.id} href={`/account/orders/${order.id}`} className={s.orderCard}>
                    <div className={s.orderMeta}>
                      <span className={s.orderId}>#{order.id.slice(0, 8)}</span>
                      <span
                        className="text-xs px-2 py-0.5 uppercase tracking-widest"
                        style={{
                          borderRadius: '2px',
                          background: STATUS_COLORS[order.status] + '22',
                          color: STATUS_COLORS[order.status],
                          fontFamily: "var(--font-onder)",
                          fontSize: '0.6rem',
                          border: `1px solid ${STATUS_COLORS[order.status]}55`,
                        }}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-0.5">
                        {order.order_items?.map((item) => (
                          <p key={item.id} className={s.orderItemName}>
                            {item.product_name}
                            {item.size && <span className={s.orderItemSize}> / {item.size}</span>}
                          </p>
                        ))}
                      </div>
                      <p className={s.orderTotal}>{formatPrice(order.total)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {subscribed && (
            <button
              onClick={handleUnsubscribe}
              disabled={unsubscribing}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-involve)', fontSize: '0.7rem',
                color: 'var(--accent)', opacity: 0.55, letterSpacing: '0.05em',
                textDecoration: 'underline', padding: '0.25rem 0',
                transition: 'opacity 0.15s', width: '100%', textAlign: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.55')}
            >
              {unsubscribing ? '...' : 'Отписаться от новостей'}
            </button>
          )}
        </div>
      </div>

      {/* Product modal — покупка прямо из ЛК (переиспользуем каталожную модалку) */}
      <ProductModal
        product={modalProduct}
        visible={modalVisible}
        onClose={closeProductModal}
        modalBg={modalBg}
        collectionLogo={activeCat?.logo_top_url ?? null}
        discount={discount}
      />
    </div>
  );
}

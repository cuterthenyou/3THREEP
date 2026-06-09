---
name: threep-design
description: THREEP visual identity + the project's concrete design tokens, CSS-variable system, button/card patterns and "no-hardcode" rules. Use when building or restyling ANY UI on the 3THREEP site (catalog, account, modals, admin) so it matches the brand and the existing token system instead of inventing values.
---

# THREEP — Design system & tokens

THREEP is experimental, cinematic, dark, analog+digital streetwear. UI должен передавать **атмосферу первой, информацию второй**. Mood → feeling → visual impact → interaction → information. См. также [[threep-animations]] и [[threep-backend]].

## Железное правило: НИКАКОГО ХАРДКОДА
Все цвета, шрифты, радиусы — только через CSS-переменные. Никаких `#hex`/`rgb()` в JSX или модулях (кроме определения самих токенов в `globals.css` и динамических в `ThemeStyles.tsx`). Если нужен новый визуальный параметр — добавь токен, не литерал.

## Токены (определены в `app/globals.css`, переопределяются динамически в `components/ThemeStyles.tsx` из таблицы `site_settings`)

Цвета (меняются по теме через `[data-theme="dark"]`):
- `--bg`, `--bg-2` — фон / вторичный фон
- `--accent`, `--accent-2` — акцент (терракота в light, тёплый розовый `#FCB0B2` в dark)
- `--text`, `--text-muted`
- `--border`, `--border-soft`, `--border-mid`
- `--bg-subtle` — тонкая подложка (accent при ~8% alpha)
- `--bg-card` / `--text-on-card` — карточка = accent-фон + тёмный текст
- `--accent-glow` — мягкое свечение по теме
- `--status-new|paid|in-progress|shipped|delivered|cancelled|error` (+ `*-soft`)
- `--overlay-bg`, `--overlay-heavy/medium/avatar`, `--shadow-on-card-*`

Шрифты — ВСЕГДА через ролевые токены, не через сырые алиасы:
- `--font-heading` (= ONDER) — заголовки, кнопки, агрессивная типографика
- `--font-body` (= Involve) — текст
- `--font-price` (= DeutschGothic) — цены (и только цены)
- (сырые алиасы `--font-onder/involve/deutsch` существуют, но предпочитай ролевые)

Эффекты: `--grain-opacity`, `--grain-size`, `--radius-base` (по умолчанию 0px — острые углы!), `--animation-speed`, `--btn-fz-mobile` (0.7rem — единый размер шрифта основных кнопок на <640px).

## Паттерны компонентов (переиспользуй, не изобретай)

**Neo-brutal кнопка** (основной стиль сайта): острые углы, `border: 1px solid var(--accent)`, `box-shadow: 2px 2px 0 var(--accent)`; hover → `box-shadow: 3px 3px 0` + `transform: translate(-1px,-1px)`; active → `1px 1px 0` + `translate(1px,1px)`. Готовый класс `.neo-btn` в `globals.css`; заполненный вариант — см. `.modalBtn`/`.ctaBtn` в `app/account/account.module.css`. **Не делай** «гладких» rounded-кнопок с brightness-hover.

**HUD-уголки**: класс `.hud-corners` рисует 4 L-скобки по углам блока.

**Grain**: глобальный слой `.grain-fixed` (`position: fixed; inset: 0; z-index: 2`) в `app/layout.tsx` покрывает весь вьюпорт. НЕ добавляй локальные grain-блоки поверх — они удваивают зерно и дают видимый шов.

**Тема**: переключение через `lib/theme.ts` (`data-theme` на `<html>`). Клиентские компоненты, реагирующие на тему, наблюдают `data-theme` через `MutationObserver` (пример — `AccountClient.tsx`).

## Деньги (бренд 333 — «нас трое»)
Все цены кратны 3. Скидки по уровню применяются и округляются **вниз** до кратного 3 (`Math.floor(x/3)*3`). Цена форматируется через `lib/utils.ts` `formatPrice`.

## Адаптив
Мобильный брейкпоинт — `640px` (`max-width: 639px` / Tailwind `sm`). Правильные отступы, без хардкода, проверка iOS Safari (шрифты, `:active` на тач, `font-size: 16px` на инпутах чтобы не зумило).

## Чего избегать
Generic startup/SaaS UI, яркие градиенты, корпоративный минимализм, дефолтный Tailwind-вид, «tech-bro» эстетика, мотивационный копирайтинг. Делай атмосферу, текстуру, напряжение, кинематографичность.

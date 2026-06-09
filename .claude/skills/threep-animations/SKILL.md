---
name: threep-animations
description: THREEP motion language — the project's existing keyframes, VHS/glitch/grain/marquee patterns and motion principles. Use when adding or tuning any animation, transition, loader, hover effect or canvas visual on the 3THREEP site so it feels cinematic and reuses existing keyframes instead of new ad-hoc motion.
---

# THREEP — Motion & animation

Движение премиальное, атмосферное, кинематографичное: VHS-фликер, аналоговый шум, тонкая дисторсия, glitch-переходы, медленное движение, слоистый hover. **Избегай** агрессивной переанимации, детских/флешевых эффектов, дешёвых киберпанк-клише. См. [[threep-design]].

`prefers-reduced-motion: reduce` — уважать (примеры: `.reveal-up`).
`--animation-speed` — глобальный множитель скорости (из `site_settings`).

## Готовые keyframes в `app/globals.css` (переиспользуй)
- `fadeInUp` / `fadeIn` — появления; утилита `.reveal-up` (fade-up, стаггер через inline `animation-delay`)
- `glitchFlash` — короткий glitch-вспых (hue-rotate + clip-path)
- `vhs-glitch` — полноценный VHS-сдвиг каналов
- `pixelDecayIn` / `pixelDecayOut` — пиксельный распад; утилиты `.pixel-decay-hover`, `[data-pixel-decay]`
- `pulseGlow`, `ambientFloat`, `shimmer` — амбиентное свечение/парение/мерцание

## Ключевые анимационные компоненты
- `components/MarqueeTicker.tsx` — бегущая строка. Луп бесшовный ТОЛЬКО когда обе половины равны: `unit = texts.join(' · ') + ' · '`, `doubled = unit + unit`, анимация `translateX(0 → -50%)`. Если добавить сепаратор между копиями неравномерно — будет рывок.
- `components/HeroTransition.tsx` — canvas-фрактальный шум, переход видео→каталог; перерисовывается на смену темы.
- `components/TornEdge.tsx` — SVG-«зубья» (torn edge) с `feTurbulence`+`feDisplacementMap` и accent-хайрлайном. Grain берётся из глобального слоя, НЕ из локального.
- `components/GlitterCanvas.tsx` — амбиентный глиттер (вкл/интенсивность из settings).
- `components/LoadingScreen.tsx` — кинематографичный лоадер.
- `components/BatAnimation.tsx` — мини-игра «охота» (combo, power-ups, волны, screen-shake).
- `components/CustomCursor.tsx` — кастомный курсор.

## Принципы
- Hover/`:active` трансформы оборачивай в `@media (hover: hover) and (pointer: fine)` — на тач-устройствах `:active` срабатывает в момент касания и дёргает элемент при свайпе/скролле (особенно iOS).
- Переходы плавные и «тяжёлые», но короткие (0.06–0.2s для интеракций, медленнее для амбиента).
- Темо-зависимые canvas-эффекты подписывай на `data-theme` через `MutationObserver`.

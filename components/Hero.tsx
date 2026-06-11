'use client';

import { useEffect, useRef, useCallback } from 'react';
import { preload } from 'react-dom';
import s from './Hero.module.css';

const FALLBACK_VIDEO = 'https://storage.yandexcloud.net/threep-media/assets/hero.webm'

interface HeroProps {
  videoUrl?: string | null   // WebM (desktop/Android)
  mp4Url?: string | null     // H.264 MP4 (iOS Safari)
  posterUrl?: string | null  // shown while loading / when no codec plays
}

export default function Hero({ videoUrl, mp4Url, posterUrl }: HeroProps) {
  const webmSrc = videoUrl || FALLBACK_VIDEO
  const videoRef = useRef<HTMLVideoElement>(null);

  // Preload the poster so the hero shows instantly before the video decodes
  if (posterUrl) preload(posterUrl, { as: 'image' })

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      document.addEventListener('touchstart', () => video.play(), { once: true });
    });
  }, []);

  // Playback speed — user override (localStorage, set from the header pill) falls
  // back to the admin default exposed on the --hero-speed CSS var.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const apply = (v: number) => { if (!isNaN(v) && v > 0) video.playbackRate = v; };
    const resolve = (): number => {
      const stored = parseFloat(localStorage.getItem('hero-speed') ?? '');
      if (!isNaN(stored)) return stored;
      const def = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hero-speed'));
      return isNaN(def) ? 1 : def;
    };
    apply(resolve());
    // keep rate after loops/source swaps
    const onLoaded = () => apply(resolve());
    video.addEventListener('loadeddata', onLoaded);
    const onSpeed = (e: Event) => apply((e as CustomEvent<number>).detail);
    window.addEventListener('threep-hero-speed', onSpeed as EventListener);
    return () => {
      video.removeEventListener('loadeddata', onLoaded);
      window.removeEventListener('threep-hero-speed', onSpeed as EventListener);
    };
  }, []);

  // Desktop only: pause on press-hold. Touch devices just watch the loop
  // (touch-to-pause fights iOS autoplay and can leave the video stopped).
  const handlePause = useCallback(() => videoRef.current?.pause(), []);
  const handleResume = useCallback(() => videoRef.current?.play().catch(() => {}), []);

  return (
    <section className={`${s.hero} w-full relative`}>
      {/* Theme overlay — tints video in dark mode */}
      <div className={s.themeOverlay} aria-hidden="true" />
      {/* Transparent shield — blocks long-press context menu on mobile */}
      <div className={s.videoShield} aria-hidden="true" />
      <video
        ref={videoRef}
        className={s.video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={posterUrl ?? undefined}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={e => e.preventDefault()}
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onMouseLeave={handleResume}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {/* MP4 first so iOS Safari (no WebM support) picks it up */}
        {mp4Url && <source src={mp4Url} type="video/mp4" />}
        <source src={webmSrc} type="video/webm" />
      </video>
    </section>
  );
}

'use client';

import { useEffect, useRef, useCallback } from 'react';
import s from './Hero.module.css';

const FALLBACK_VIDEO = 'https://storage.yandexcloud.net/threep-media/assets/hero.webm'

export default function Hero({ videoUrl }: { videoUrl?: string | null }) {
  const src = videoUrl || FALLBACK_VIDEO
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      document.addEventListener('touchstart', () => video.play(), { once: true });
    });
  }, []);

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
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={e => e.preventDefault()}
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <source src={src} type="video/webm" />
      </video>
    </section>
  );
}

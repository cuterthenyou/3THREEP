'use client';

import { useEffect, useRef, useCallback } from 'react';
import s from './Hero.module.css';

export default function Hero() {
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
      <video
        ref={videoRef}
        className={s.video}
        autoPlay
        muted
        loop
        playsInline
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <source
          src="https://storage.yandexcloud.net/threep-media/assets/hero.av1.webm"
          type='video/webm; codecs="av01"'
        />
        <source
          src="https://storage.yandexcloud.net/threep-media/assets/hero.webm"
          type="video/webm"
        />
      </video>
    </section>
  );
}

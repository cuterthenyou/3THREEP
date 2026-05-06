'use client'

import { useEffect, useRef, useState } from 'react'
import s from './Hero.module.css'

const BUTTON_TEXTS = [
  'Посмотреть',
  'чекнуть',
  'чё, по чём?',
  'скок стоит?',
  'сколько денег?',
  'чё по цене?',
]

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [btnText, setBtnText] = useState('Посмотреть')
  const [btnFade, setBtnFade] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.play().catch(() => {
      document.addEventListener('touchstart', () => video.play(), { once: true })
    })
  }, [])

  useEffect(() => {
    let current = 'Посмотреть'
    const id = setInterval(() => {
      setBtnFade(true)
      setTimeout(() => {
        let next: string
        do {
          next = BUTTON_TEXTS[Math.floor(Math.random() * BUTTON_TEXTS.length)]
        } while (next === current)
        current = next
        setBtnText(next)
        setBtnFade(false)
      }, 200)
    }, 2500)
    return () => clearInterval(id)
  }, [])

  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className={`${s.hero} w-full relative`}>
    <video
      ref={videoRef}
      className={s.video}
      autoPlay
      muted
      loop
      playsInline
    >
      <source
        src="https://wfgzofrtiinageegztux.supabase.co/storage/v1/object/public/assets/hero.av1.webm"
        type='video/webm; codecs="av01"'
      />
      <source
        src="https://wfgzofrtiinageegztux.supabase.co/storage/v1/object/public/assets/hero.webm"
        type="video/webm"
      />
    </video>

      {/* TODO: вернуть кнопку прокрутки к каталогу
      <div
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        style={{ zIndex: 10 }}
      >
        <button
          onClick={scrollToCatalog}
          className="px-8 py-4 uppercase tracking-widest transition-all duration-200"
          style={{
            background: '#F29774',
            color: '#A9342A',
            fontFamily: "'ONDER', sans-serif",
            fontSize: '0.75rem',
            borderRadius: '5px',
            opacity: btnFade ? 0.3 : 1,
            transform: btnFade ? 'scale(0.95)' : 'scale(1)',
            transition: 'opacity 0.2s, transform 0.2s',
            minWidth: '160px',
          }}
        >
          {btnText}
        </button>
      </div>
      */}
    </section>
  )
}

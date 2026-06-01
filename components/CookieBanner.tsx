'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import s from './CookieBanner.module.css';

const STORAGE_KEY = 'threep-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={s.banner} role="alertdialog" aria-label="Согласие на использование cookie">
      <p className={s.text}>
        Мы используем cookie для работы личного кабинета и авторизации. Продолжая, ты соглашаешься
        с нашей{' '}
        <Link href="/privacy" className={s.link} target="_blank" rel="noopener">
          Политикой конфиденциальности
        </Link>
        .
      </p>
      <div className={s.actions}>
        <button onClick={accept} className={s.acceptBtn}>
          Понятно
        </button>
        <Link href="/privacy" className={s.detailsLink} target="_blank" rel="noopener">
          Подробнее
        </Link>
      </div>
    </div>
  );
}

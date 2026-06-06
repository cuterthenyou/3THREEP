import type { JSX } from 'react'

export interface SvgEmoji {
  name: string
  svg: JSX.Element
}

export const SVG_EMOJIS: SvgEmoji[] = [
  {
    name: 'smile',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8.5"/>
        <circle cx="7" cy="8.5" r="1" fill="currentColor" stroke="none"/>
        <circle cx="13" cy="8.5" r="1" fill="currentColor" stroke="none"/>
        <path d="M7,12.5 Q10,15.5 13,12.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'grin',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8.5"/>
        <circle cx="7" cy="8" r="1" fill="currentColor" stroke="none"/>
        <circle cx="13" cy="8" r="1" fill="currentColor" stroke="none"/>
        <path d="M6.5,12 L13.5,12" strokeLinecap="round"/>
        <path d="M6.5,12 Q10,17 13.5,12" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'sad',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8.5"/>
        <circle cx="7" cy="8.5" r="1" fill="currentColor" stroke="none"/>
        <circle cx="13" cy="8.5" r="1" fill="currentColor" stroke="none"/>
        <path d="M7,14.5 Q10,11.5 13,14.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'rage',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8.5"/>
        <circle cx="7" cy="9.5" r="1" fill="currentColor" stroke="none"/>
        <circle cx="13" cy="9.5" r="1" fill="currentColor" stroke="none"/>
        <path d="M5,6.5 L9,8" strokeLinecap="round"/>
        <path d="M15,6.5 L11,8" strokeLinecap="round"/>
        <path d="M7,14 L13,14" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'cool',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8.5"/>
        <rect x="4" y="7" width="5" height="3.5" rx="0.5" fill="currentColor" stroke="none"/>
        <rect x="11" y="7" width="5" height="3.5" rx="0.5" fill="currentColor" stroke="none"/>
        <line x1="9" y1="8.75" x2="11" y2="8.75"/>
        <path d="M7,13.5 Q10,16 13,13.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'surprised',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8.5"/>
        <circle cx="7" cy="8" r="1" fill="currentColor" stroke="none"/>
        <circle cx="13" cy="8" r="1" fill="currentColor" stroke="none"/>
        <ellipse cx="10" cy="13.5" rx="2.5" ry="2"/>
      </svg>
    ),
  },
  {
    name: 'skull',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10,1.5 C5.5,1.5 2.5,5 2.5,9 C2.5,12.5 4.5,15 7,15.5 L7,18.5 L13,18.5 L13,15.5 C15.5,15 17.5,12.5 17.5,9 C17.5,5 14.5,1.5 10,1.5 Z"/>
        <circle cx="7.5" cy="8.5" r="2"/>
        <circle cx="12.5" cy="8.5" r="2"/>
        <line x1="9" y1="15.5" x2="9" y2="18.5"/>
        <line x1="11" y1="15.5" x2="11" y2="18.5"/>
      </svg>
    ),
  },
  {
    name: 'ghost',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4,11 C4,6 6.5,2 10,2 C13.5,2 16,6 16,11 L16,18 L13.5,16 L11,18 L10,16 L9,18 L6.5,16 L4,18 Z"/>
        <circle cx="8" cy="9" r="1" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="9" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    name: 'alien',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="10" cy="9.5" rx="7" ry="8.5"/>
        <ellipse cx="7" cy="8.5" rx="2.5" ry="2" fill="currentColor" stroke="none"/>
        <ellipse cx="13" cy="8.5" rx="2.5" ry="2" fill="currentColor" stroke="none"/>
        <path d="M7.5,13.5 Q10,15.5 12.5,13.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'eye',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1,10 Q5,4 10,4 Q15,4 19,10 Q15,16 10,16 Q5,16 1,10 Z"/>
        <circle cx="10" cy="10" r="3" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    name: 'fire',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M10,0 L14,8 L12.5,5.5 L14.5,11 L12.5,10 L13,15 L10,19 L7,15 L7.5,10 L5.5,11 L7.5,5.5 L6,8 Z"/>
      </svg>
    ),
  },
  {
    name: 'star',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M10,1.5 L12.06,7.17 L18.09,7.37 L13.33,11.08 L15,16.88 L10,13.5 L5,16.88 L6.67,11.08 L1.91,7.37 L7.94,7.17 Z"/>
      </svg>
    ),
  },
  {
    name: 'heart',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M10,17 C10,17 2,11 2,6.5 C2,4 4,2 6.5,2 C8,2 9.3,2.8 10,4 C10.7,2.8 12,2 13.5,2 C16,2 18,4 18,6.5 C18,11 10,17 10,17 Z"/>
      </svg>
    ),
  },
  {
    name: 'broken',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10,16.5 C10,16.5 2,10.5 2,6 C2,3.5 4,1.5 6.5,1.5 C8,1.5 9.3,2.3 10,3.5 C10.7,2.3 12,1.5 13.5,1.5 C16,1.5 18,3.5 18,6 C18,10.5 10,16.5 10,16.5 Z"/>
        <path d="M9.5,4.5 L11,8 L9,8 L10.5,12" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'lightning',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M12,0 L4,11 L9.5,11 L8,20 L16,9 L10.5,9 Z"/>
      </svg>
    ),
  },
  {
    name: 'crown',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M1,17 L1,9 L5.5,13.5 L10,4 L14.5,13.5 L19,9 L19,17 Z"/>
      </svg>
    ),
  },
  {
    name: 'peace',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8.5"/>
        <line x1="10" y1="1.5" x2="10" y2="18.5"/>
        <line x1="10" y1="10" x2="3" y2="16.5"/>
        <line x1="10" y1="10" x2="17" y2="16.5"/>
      </svg>
    ),
  },
  {
    name: 'diamond',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M10,1 L19,10 L10,19 L1,10 Z"/>
      </svg>
    ),
  },
  {
    name: 'explosion',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M10,0 L12,7 L18,5 L13,10 L19,13 L12.5,13 L11,19 L10,13 L3.5,17 L8,11 L1,11 L7,8 L3,3 L9,7 Z"/>
      </svg>
    ),
  },
  {
    name: 'thumbs',
    svg: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <rect x="2" y="11" width="4" height="8.5" rx="1"/>
        <path d="M6,12 C6,10 9,9 10,6 C10.5,3.5 12,2.5 12.5,4 L12.5,8 L16,8 C17.5,8 18,9 18,10.5 L18,14.5 C18,16 17,17 15.5,17 L9,17 C7.5,17 6,16 6,14.5 Z"/>
      </svg>
    ),
  },
  {
    name: 'no',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8.5"/>
        <line x1="4" y1="4" x2="16" y2="16" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'money',
    svg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8.5"/>
        <path d="M12.5,7.5 C12.5,6.5 11,5.5 10,5.5 C8.5,5.5 7.5,6.5 7.5,7.5 C7.5,9 9,9.5 10,10 C11.5,10.5 12.5,11.5 12.5,13 C12.5,14 11,14.5 10,14.5 C8.5,14.5 7.5,13.5 7.5,12.5" strokeLinecap="round"/>
        <line x1="10" y1="4.5" x2="10" y2="6"/>
        <line x1="10" y1="14" x2="10" y2="15.5"/>
      </svg>
    ),
  },
]

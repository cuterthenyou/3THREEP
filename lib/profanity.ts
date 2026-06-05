// Russian profanity roots — matched case-insensitively, whole-word and partial
const MAT_PATTERNS = [
  /х[уy][йяеёию]/gi,
  /п[иi]зд/gi,
  /[её]б[аеёуиоыьъ]/gi,
  /е[б6]а[нт]/gi,
  /[её]б[нт]/gi,
  /бля[дт]/gi,
  /блял+/gi,
  /мудак/gi,
  /мудил/gi,
  /[сc][уy]к[аиоу]/gi,
  /залуп/gi,
  /шлюх/gi,
  /ёбан/gi,
  /ебан/gi,
  /пиздец/gi,
  /пиздеж/gi,
  /нахуй/gi,
  /нахуе/gi,
  /ахуе/gi,
  /охуе/gi,
  /ахует/gi,
  /охует/gi,
  /похуй/gi,
  /ёбт[ьъ]/gi,
  /еботн/gi,
  /уёбк/gi,
  /уебк/gi,
  /пиздош/gi,
  /въёб/gi,
  /выёб/gi,
  /выеб/gi,
  /заёб/gi,
  /заеб/gi,
  /отъёб/gi,
  /отъеб/gi,
  /разъёб/gi,
  /разъеб/gi,
]

function maskWord(match: string): string {
  if (match.length <= 2) return '*'.repeat(match.length)
  return match[0] + '*'.repeat(match.length - 1)
}

export function filterProfanity(text: string): string {
  let result = text
  for (const pattern of MAT_PATTERNS) {
    result = result.replace(pattern, (m) => maskWord(m))
  }
  return result
}

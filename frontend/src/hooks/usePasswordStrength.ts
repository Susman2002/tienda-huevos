export type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong'

export interface StrengthResult {
  strength: PasswordStrength
  label: string
  color: string
  barColor: string
  score: number // 0-4
}

export function usePasswordStrength(password: string): StrengthResult {
  if (!password) {
    return { strength: 'empty', label: '', color: '', barColor: '', score: 0 }
  }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) {
    return {
      strength: 'weak',
      label: 'Débil',
      color: 'text-red-600',
      barColor: 'bg-red-500',
      score: 1,
    }
  }

  if (score <= 3) {
    return {
      strength: 'medium',
      label: 'Intermedia',
      color: 'text-yellow-600',
      barColor: 'bg-yellow-400',
      score: 2,
    }
  }

  return {
    strength: 'strong',
    label: 'Fuerte',
    color: 'text-green-600',
    barColor: 'bg-green-500',
    score: 3,
  }
}
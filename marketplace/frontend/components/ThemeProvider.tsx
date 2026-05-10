'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'
type ThemeSetting = Theme | 'system'

interface ThemeContextValue {
  theme: Theme
  themeSetting: ThemeSetting
  setThemeSetting: (value: ThemeSetting) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'theme-setting'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeSetting, setThemeSettingState] = useState<ThemeSetting>('system')
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeSetting | null
    const initialSetting: ThemeSetting = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
    const resolvedTheme = initialSetting === 'system' ? getSystemTheme() : initialSetting

    setThemeSettingState(initialSetting)
    setTheme(resolvedTheme)
    applyTheme(resolvedTheme)

    window.requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-ready')
    })
  }, [])

  useEffect(() => {
    if (themeSetting !== 'system') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const nextTheme = media.matches ? 'dark' : 'light'
      setTheme(nextTheme)
      applyTheme(nextTheme)
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [themeSetting])

  const setThemeSetting = useCallback((value: ThemeSetting) => {
    setThemeSettingState(value)
    window.localStorage.setItem(STORAGE_KEY, value)

    const resolvedTheme = value === 'system' ? getSystemTheme() : value
    setTheme(resolvedTheme)
    applyTheme(resolvedTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setThemeSetting(nextTheme)
  }, [setThemeSetting, theme])

  const value = useMemo(
    () => ({ theme, themeSetting, setThemeSetting, toggleTheme }),
    [theme, themeSetting, setThemeSetting, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}

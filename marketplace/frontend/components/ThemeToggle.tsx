'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export default function ThemeToggle() {
  const { themeSetting, setThemeSetting } = useTheme()

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
      <button
        type="button"
        onClick={() => setThemeSetting('light')}
        className={`rounded-lg p-2 transition ${themeSetting === 'light' ? 'bg-primary text-primary-foreground' : 'text-text-muted hover:bg-surface-muted hover:text-text'}`}
        aria-label="Use light theme"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setThemeSetting('dark')}
        className={`rounded-lg p-2 transition ${themeSetting === 'dark' ? 'bg-primary text-primary-foreground' : 'text-text-muted hover:bg-surface-muted hover:text-text'}`}
        aria-label="Use dark theme"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setThemeSetting('system')}
        className={`rounded-lg p-2 transition ${themeSetting === 'system' ? 'bg-primary text-primary-foreground' : 'text-text-muted hover:bg-surface-muted hover:text-text'}`}
        aria-label="Use system theme"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  )
}

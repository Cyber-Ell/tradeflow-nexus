'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [showIntro, setShowIntro] = useState(true)
  const routeLabel = getRouteLabel(pathname)

  useEffect(() => {
    setShowIntro(true)
    const timer = window.setTimeout(() => setShowIntro(false), 1200)
    return () => window.clearTimeout(timer)
  }, [pathname])

  return (
    <>
      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div
            key={`intro-${pathname}`}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
          >
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.22),transparent_28%)]"
              initial={{ scale: 1.08, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <motion.div
              className="relative flex flex-col items-center gap-6 text-white"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur-xl"
                initial={{ rotate: -10, scale: 0.88 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <Building2 className="h-9 w-9" />
              </motion.div>
              <div className="text-center">
                <motion.p
                  className="mb-3 text-xs font-semibold uppercase tracking-[0.45em] text-sky-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.45 }}
                >
                  {routeLabel}
                </motion.p>
                <motion.h1
                  className="text-5xl font-semibold tracking-tight md:text-7xl"
                  initial={{ letterSpacing: '0.18em', opacity: 0 }}
                  animate={{ letterSpacing: '-0.04em', opacity: 1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  MarketHub
                </motion.h1>
              </div>
              <motion.div
                className="h-[2px] w-40 overflow-hidden rounded-full bg-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 via-white to-emerald-400"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.05, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.1 }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 14 : 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </>
  )
}

function getRouteLabel(pathname: string | null): string {
  if (!pathname || pathname === '/') {
    return 'Wholesale commerce'
  }

  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]

  const labels: Record<string, string> = {
    login: 'Sign in',
    signup: 'Create account',
    admin: 'Admin',
    vendor: 'Vendor',
    wholesaler: 'Wholesaler',
    verification: 'Verification',
    products: 'Products',
    orders: 'Orders',
  }

  return labels[lastSegment] || toTitleCase(lastSegment)
}

function toTitleCase(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

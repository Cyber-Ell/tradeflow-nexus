'use client'

import Link from 'next/link'
import { useAuthStore, initializeAuth } from '@/lib/store'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    initializeAuth()
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!mounted) return null

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="font-bold text-lg text-primary-900">MarketHub</span>
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <span className="text-sm text-neutral-600">
                  {user.name}
                  <span className="ml-2 badge-primary">{user.role}</span>
                </span>
                <div className="flex items-center space-x-4 border-l border-neutral-200 pl-4">
                  <Link href={`/dashboard/${user.role}`} className="text-sm text-primary-600 hover:text-primary-700">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary btn-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
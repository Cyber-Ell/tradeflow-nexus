'use client'

import Link from 'next/link'
import { useAuthStore, initializeAuth } from '@/lib/store'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, LayoutDashboard, LogIn, LogOut, ShoppingBag, UserPlus } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  title: string
  message: string
  readAt?: string
  createdAt: string
}

export default function Navbar() {
  const { user, logout, hasHydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()

  useEffect(() => {
    initializeAuth()
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !hasHydrated || !user) {
      setNotifications([])
      return
    }

    loadNotifications()
  }, [mounted, hasHydrated, user])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications')
      setNotifications(Array.isArray(response.data?.data) ? response.data.data : [])
    } catch (error: any) {
      setNotifications([])
    }
  }

  const handleNotificationClick = async (notificationId: string, alreadyRead?: string) => {
    if (!alreadyRead) {
      try {
        await api.post(`/notifications/${notificationId}/read`)
        setNotifications((current) =>
          current.map((item) =>
            item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item
          )
        )
      } catch (error: any) {
        toast.error('Failed to update notification')
      }
    }
  }

  const unreadCount = notifications.filter((item) => !item.readAt).length

  if (!mounted || !hasHydrated) return null

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface-strong shadow-sm">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-text-primary">MarketHub</span>
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <span className="text-sm text-text-secondary">
                  {user.name}
                  <span className="ml-2 badge-primary">{user.role}</span>
                </span>
                <div className="flex items-center space-x-4 border-l border-border pl-4">
                  <div className="relative">
                    <button
                      type="button"
                      className="relative inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary"
                      onClick={() => setShowNotifications((current) => !current)}
                    >
                      <Bell className="w-4 h-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-3 min-w-[1.25rem] rounded-full bg-primary-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 top-10 z-50 w-96 rounded-2xl border border-border bg-surface-strong p-4 shadow-xl">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-semibold text-text-primary">Notifications</p>
                          <button
                            type="button"
                            className="text-xs text-primary transition hover:opacity-80"
                            onClick={loadNotifications}
                          >
                            Refresh
                          </button>
                        </div>

                        {notifications.length > 0 ? (
                          <div className="max-h-80 space-y-2 overflow-y-auto">
                            {notifications.map((notification) => (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() => handleNotificationClick(notification.id, notification.readAt)}
                                className={`w-full rounded-xl border p-3 text-left transition ${
                                  notification.readAt
                                    ? 'border-border bg-surface-muted'
                                    : 'border-primary/30 bg-primary/10'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                                    <p className="mt-1 text-xs leading-5 text-text-secondary">{notification.message}</p>
                                  </div>
                                  {notification.readAt && <CheckCheck className="mt-0.5 h-4 w-4 text-emerald-600" />}
                                </div>
                                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-text-muted">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
                            No notifications yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Link href={`/dashboard/${user.role}`} className="inline-flex items-center gap-2 text-sm text-primary transition hover:opacity-80">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary">
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link href="/signup" className="btn-primary btn-sm inline-flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
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

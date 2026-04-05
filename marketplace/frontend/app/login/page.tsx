'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, LockKeyhole, ShieldCheck } from 'lucide-react'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { initializeAuth, useAuthStore } from '@/lib/store'

interface LoginFormData {
  email: string
  password: string
}

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user, hasHydrated, setUser, setToken } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [])

  useEffect(() => {
    if (hasHydrated && user) {
      router.push(`/dashboard/${user.role}`)
    }
  }, [hasHydrated, router, user])

  if (hasHydrated && user) {
    return null
  }

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      })

      const { token, user } = response.data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      setToken(token)
      toast.success('Logged in successfully!')
      router.push(`/dashboard/${user.role}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-12">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <motion.section
              className="panel overflow-hidden p-8 md:p-10"
              initial="initial"
              animate="animate"
              variants={fadeUp}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <span className="eyebrow mb-5">
                <BadgeCheck className="h-4 w-4" />
                Secure platform access
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Continue into your MarketHub workspace.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Sign in to manage onboarding, approve suppliers, configure catalog pricing, and move wholesale orders through protected workflows.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Role-aware dashboards for vendors, wholesalers, and admins',
                  'Verification-led access to trusted marketplace activity',
                  'Pricing, payments, and fulfillment in one operating flow',
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 * index + 0.15, duration: 0.4, ease: 'easeOut' }}
                  >
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section
              className="card p-8 md:p-10"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <div className="mb-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-semibold text-slate-950">Sign In</h2>
                <p className="mt-2 text-base text-slate-600">Access your dashboard and continue marketplace operations.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="you@company.com"
                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Enter password"
                    {...register('password', { required: 'Password is required' })}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full gap-2">
                  {loading ? 'Signing in...' : 'Continue to Dashboard'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-neutral-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
                  Create one
                </Link>
              </p>
            </motion.section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

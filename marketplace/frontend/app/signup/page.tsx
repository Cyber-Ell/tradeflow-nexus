'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Building2, Sparkles } from 'lucide-react'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { initializeAuth, useAuthStore } from '@/lib/store'

interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'vendor' | 'wholesaler'
  company?: string
}

export default function SignUpPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
    defaultValues: { role: 'vendor' },
  })
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

  const onSubmit = async (data: SignUpFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        company: data.company,
      })

      const { token, user } = response.data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      setToken(token)
      toast.success('Account created successfully!')
      router.push(`/dashboard/${user.role}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-12">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.section
              className="panel overflow-hidden p-8 md:p-10"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <span className="eyebrow mb-5">
                <Sparkles className="h-4 w-4" />
                Guided onboarding
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Create your MarketHub account with the right operating role.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Start as a vendor or wholesaler, complete verification, and move into a marketplace built for wholesale trade, structured pricing, and trusted transactions.
              </p>

              <div className="mt-8 grid gap-4">
                {[
                  { title: 'Vendor onboarding', copy: 'Create listings, set MOQ, configure tiered pricing, and submit verification.' },
                  { title: 'Wholesaler onboarding', copy: 'Access trusted suppliers, compare wholesale terms, and move into orders quickly.' },
                  { title: 'Approval-led trust', copy: 'Use verification and review workflows to establish credibility before trade volume grows.' },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 * index + 0.12, duration: 0.4, ease: 'easeOut' }}
                  >
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.copy}</p>
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
                  <Building2 className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-semibold text-slate-950">Create Account</h2>
                <p className="mt-2 text-base text-slate-600">Set up your MarketHub workspace and begin onboarding.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="John Doe"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Company</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Your Company"
                    {...register('company')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Account Type</label>
                  <select
                    className="input-field"
                    {...register('role', { required: 'Role is required' })}
                  >
                    <option value="vendor">Vendor</option>
                    <option value="wholesaler">Wholesaler</option>
                  </select>
                  {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Minimum 6 characters"
                      {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Repeat password"
                      {...register('confirmPassword', { required: 'Please confirm password' })}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full gap-2">
                  {loading ? 'Creating account...' : 'Create Workspace'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-neutral-600">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                  Sign in
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

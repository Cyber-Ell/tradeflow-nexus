'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/lib/store'

interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'vendor' | 'wholesaler'
  company?: string
}

export default function SignUpPage() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignUpFormData>({
    defaultValues: { role: 'vendor' },
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const password = watch('password')

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

      const { token, user } = response.data
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
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-neutral-50">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h1 className="text-2xl font-bold text-center text-neutral-900 mb-2">Create Account</h1>
            <p className="text-center text-neutral-600 mb-8">Join MarketHub and start selling</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  placeholder="john@example.com"
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Company (Optional)</label>
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

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  {...register('confirmPassword', { required: 'Please confirm password' })}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-neutral-600 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
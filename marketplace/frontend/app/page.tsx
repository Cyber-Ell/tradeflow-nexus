'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuthStore, initializeAuth } from '@/lib/store'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    initializeAuth()
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (user) {
    router.push(`/dashboard/${user.role}`)
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary-50 to-accent-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center animate-fadeIn">
              <h1 className="text-5xl md:text-6xl font-bold text-primary-900 mb-6">
                Welcome to <span className="text-accent-600">MarketHub</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8">
                The most reliable B2B marketplace connecting vendors, wholesalers, and buyers in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="btn-primary">
                  Get Started Free
                </Link>
                <Link href="/login" className="btn-secondary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container-custom">
            <div className="text-center mb-12 animate-slideUp">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Everything you need to scale your business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Secure Payments',
                  description: 'Escrow-protected transactions with Paystack integration',
                  icon: '🔒',
                },
                {
                  title: 'Order Tracking',
                  description: 'Real-time logistics integration with GIG Logistics',
                  icon: '📦',
                },
                {
                  title: 'Vendor Approval',
                  description: 'Admin-reviewed vendor verification system',
                  icon: '✓',
                },
                {
                  title: 'Analytics Dashboard',
                  description: 'Monitor sales, revenue, and key metrics',
                  icon: '📊',
                },
                {
                  title: 'Multi-Role Support',
                  description: 'Vendor, Wholesaler, and Admin capabilities',
                  icon: '👥',
                },
                {
                  title: '24/7 Support',
                  description: 'Dedicated support team ready to help',
                  icon: '💬',
                },
              ].map((feature, idx) => (
                <div key={idx} className="card p-8">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary-600">
          <div className="container-custom text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="text-lg mb-8 text-primary-100">Join thousands of vendors and wholesalers already using MarketHub</p>
            <Link href="/signup" className="inline-block px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition">
              Start Free Trial
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
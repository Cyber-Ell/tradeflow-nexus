'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuthStore, initializeAuth } from '@/lib/store'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  ShieldCheck,
  Truck,
  UserCog,
} from 'lucide-react'

const onboardingSteps = [
  {
    icon: UserCog,
    title: 'Create account roles',
    copy: 'Separate onboarding for vendors, wholesalers, and admins from the first session.',
  },
  {
    icon: ShieldCheck,
    title: 'Submit verification',
    copy: 'Collect CAC, TIN, and operating details before marketplace activity begins.',
  },
  {
    icon: Boxes,
    title: 'Set MOQ and pricing tiers',
    copy: 'Configure base price, wholesale breaks, and quantity rules in one catalog flow.',
  },
  {
    icon: Banknote,
    title: 'Prepare protected payments',
    copy: 'Enable payment initialization and escrow-oriented transaction handling.',
  },
  {
    icon: Truck,
    title: 'Connect delivery operations',
    copy: 'Move from order placement to shipment visibility with tracked milestones.',
  },
]

const valueCards = [
  {
    icon: ShieldCheck,
    title: 'Trust-first onboarding',
    copy: 'Approve suppliers, verify business identity, and expose credible listings to buyers.',
  },
  {
    icon: PackageCheck,
    title: 'Trade-ready catalog setup',
    copy: 'Support wholesale operations with MOQ, stock visibility, and structured tier pricing.',
  },
  {
    icon: Truck,
    title: 'Operational transparency',
    copy: 'Keep payment, fulfillment, and delivery milestones visible across the transaction lifecycle.',
  },
]

const rolloutPoints = [
  'Create an account and choose your business role',
  'Submit verification before trading at scale',
  'Configure products with MOQ and bulk price tiers',
  'Approve vendors and review verification requests',
  'Move orders into payment and delivery workflows',
  'Return later through the same guided entry point',
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
}

export default function HomePage() {
  const { user, hasHydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    initializeAuth()
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && hasHydrated && user) {
      router.push(`/dashboard/${user.role}`)
    }
  }, [mounted, hasHydrated, router, user])

  if (!mounted || !hasHydrated) return null

  return (
    <>
      <Navbar />
      <motion.main
        className="overflow-hidden"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <section className="px-4 pt-10 pb-20">
          <div className="container-custom">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <motion.div className="max-w-3xl" variants={staggerContainer}>
                <motion.span className="eyebrow mb-6" variants={fadeUp} transition={{ duration: 0.5, ease: 'easeOut' }}>
                  <BadgeCheck className="h-4 w-4" />
                  B2B Wholesale Operating Layer
                </motion.span>
                <motion.h1
                  className="text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 md:text-7xl"
                  variants={fadeUp}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                >
                  Onboard suppliers and buyers into one trusted commerce workflow.
                </motion.h1>
                <motion.p
                  className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl"
                  variants={fadeUp}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                >
                  MarketHub helps Nigerian vendors and wholesalers start faster, trade with confidence, and move every order through pricing, verification, payment, and delivery in one place.
                </motion.p>
                <motion.div
                  className="mt-8 flex flex-col gap-4 sm:flex-row"
                  variants={fadeUp}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                >
                  <Link href="/signup" className="btn-primary gap-2">
                    Start Onboarding
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/login" className="btn-secondary gap-2">
                    Continue Setup
                    <ClipboardCheck className="h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.div className="mt-10 grid gap-4 sm:grid-cols-3" variants={staggerContainer}>
                  {[
                    { label: 'Verified vendors', value: 'KYC-ready' },
                    { label: 'Bulk pricing', value: 'MOQ + tiers' },
                    { label: 'Order control', value: 'Escrow-ready' },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur"
                      variants={fadeUp}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                    >
                      <p className="text-sm font-medium text-slate-500">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                className="panel relative overflow-hidden p-6 md:p-8"
                variants={fadeUp}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
              >
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary-600 via-sky-500 to-accent-500 opacity-90" />
                <motion.div
                  className="relative mt-12 rounded-3xl bg-slate-950 p-6 text-white"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 }}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div>
                      <p className="text-sm uppercase tracking-[0.22em] text-sky-200">Onboarding status</p>
                      <h2 className="mt-2 text-2xl font-semibold">MarketHub Workspace</h2>
                    </div>
                    <div className="rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-300">
                      4 of 5 complete
                    </div>
                  </div>

                  <motion.div className="mt-6 space-y-4" variants={staggerContainer} initial="initial" animate="animate">
                    {onboardingSteps.map((step, index) => (
                      <motion.div
                        key={step.title}
                        className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                        variants={fadeUp}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      >
                        <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${index < 4 ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">{step.title}</p>
                            {index < 4 && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{step.copy}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div
                    className="mt-6 rounded-2xl bg-white p-5 text-slate-900"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut', delay: 0.45 }}
                  >
                    <p className="text-sm font-medium text-slate-500">Recommended next action</p>
                    <p className="mt-2 text-lg font-semibold">Launch vendor verification and pricing configuration before inviting buyers.</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 pb-8">
          <div className="container-custom">
            <motion.div className="grid gap-6 lg:grid-cols-3" variants={staggerContainer}>
              {valueCards.map((item) => (
                <motion.div
                  key={item.title}
                  className="card p-8"
                  variants={fadeUp}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  whileHover={{ y: -6 }}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{item.copy}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="about" className="px-4 py-20">
          <div className="container-custom">
            <motion.div
              className="panel grid gap-10 overflow-hidden p-8 md:p-12 lg:grid-cols-[0.9fr_1.1fr]"
              variants={fadeUp}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.45, ease: 'easeOut' }}>
                <span className="eyebrow mb-5">
                  <ClipboardCheck className="h-4 w-4" />
                  Guided rollout
                </span>
                <h2 className="section-title">A professional start for every participant in the marketplace.</h2>
                <p className="section-copy mt-5">
                  MarketHub now opens with a cleaner onboarding entry point designed to guide suppliers, buyers, and admins into the right workflow without exposing internal complexity too early.
                </p>
              </motion.div>
              <motion.div className="grid gap-4 sm:grid-cols-2" variants={staggerContainer}>
                {rolloutPoints.map((line) => (
                  <motion.div
                    key={line}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700"
                    variants={fadeUp}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    {line}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="pricing" className="px-4 pb-24">
          <div className="container-custom">
            <motion.div
              className="rounded-[2rem] bg-slate-950 px-8 py-12 text-center text-white md:px-12"
              variants={fadeUp}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">Ready to begin</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Launch your MarketHub onboarding flow.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Set up your account, verify your business, and move into wholesale operations with a cleaner front door for the platform.
              </p>
              <div className="mx-auto mt-8 grid max-w-3xl gap-4 text-left md:grid-cols-3">
                <div id="security" className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-sky-200">Security</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">JWT auth, verification review, and escrow-oriented payment states are already wired into the platform.</p>
                </div>
                <div id="privacy" className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-sky-200">Privacy</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Account access is role-aware, protected routes are enforced, and business verification stays tied to platform trust controls.</p>
                </div>
                <div id="terms" className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-sky-200">Terms & compliance</p>
                  <p id="compliance" className="mt-2 text-sm leading-6 text-slate-300">MOQ, tier pricing, delivery milestones, and dispute workflows align trading behavior with marketplace policy controls.</p>
                </div>
              </div>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/signup" className="btn-primary gap-2">
                  Create Workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="btn-secondary gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </motion.main>
      <Footer />
    </>
  )
}

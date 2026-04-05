import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/AppShell'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'MarketHub - B2B Marketplace',
  description: 'Connect vendors, wholesalers, and buyers in a secure, scalable platform',
  viewport: 'width=device-width, initial-scale=1',
  keywords: ['B2B', 'marketplace', 'vendor', 'wholesale'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900">
        <AppShell>{children}</AppShell>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  )
}

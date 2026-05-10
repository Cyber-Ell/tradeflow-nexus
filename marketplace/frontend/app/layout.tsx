import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/AppShell'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='theme-setting';var s=localStorage.getItem(k);var m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var t=(s==='light'||s==='dark')?s:m;var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-background text-text">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  )
}

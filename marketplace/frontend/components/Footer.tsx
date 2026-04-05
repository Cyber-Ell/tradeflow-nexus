import Link from 'next/link'
import { Building2, Github, Linkedin, ShieldCheck, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-white">MarketHub</span>
            </div>
            <p className="text-sm text-neutral-400">Connecting vendors, wholesalers, and buyers globally.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="hover:text-white transition">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link href="/#security" className="hover:text-white transition inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#about" className="hover:text-white transition">About</Link></li>
              <li><Link href="/signup" className="hover:text-white transition">Start Onboarding</Link></li>
              <li><a href="mailto:support@markethub.com" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#privacy" className="hover:text-white transition">Privacy</Link></li>
              <li><Link href="/#terms" className="hover:text-white transition">Terms</Link></li>
              <li><Link href="/#compliance" className="hover:text-white transition">Compliance</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8 flex justify-between items-center">
          <p className="text-sm text-neutral-400">&copy; 2026 MarketHub. All rights reserved.</p>
          <div className="flex space-x-6 text-sm">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition inline-flex items-center gap-2"><Twitter className="w-4 h-4" />Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition inline-flex items-center gap-2"><Linkedin className="w-4 h-4" />LinkedIn</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition inline-flex items-center gap-2"><Github className="w-4 h-4" />GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

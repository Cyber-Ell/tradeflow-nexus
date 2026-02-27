export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="font-bold text-white">MarketHub</span>
            </div>
            <p className="text-sm text-neutral-400">Connecting vendors, wholesalers, and buyers globally.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8 flex justify-between items-center">
          <p className="text-sm text-neutral-400">&copy; 2026 MarketHub. All rights reserved.</p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-neutral-400 hover:text-white transition">Twitter</a>
            <a href="#" className="text-neutral-400 hover:text-white transition">LinkedIn</a>
            <a href="#" className="text-neutral-400 hover:text-white transition">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
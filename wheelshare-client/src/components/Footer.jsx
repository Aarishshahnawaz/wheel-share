import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-orange-500">Wheel</span>
                <span className="text-blue-400">Share</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              India's peer-to-peer vehicle rental platform. Rent or earn — your choice.
            </p>
            <div className="flex gap-3 mt-4">
              {['📱 App Store', '🤖 Play Store'].map(s => (
                <span key={s} className="text-xs bg-gray-800 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              {['About Us', 'Careers', 'Press', 'Blog'].map(l => (
                <li key={l}><a href="#" className="hover:text-orange-400 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              {['Help Center', 'Safety', 'Insurance', 'Contact Us'].map(l => (
                <li key={l}><a href="#" className="hover:text-orange-400 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Cookie Policy'].map(l => (
                <li key={l}><a href="#" className="hover:text-orange-400 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <span>© 2026 WheelShare Technologies Pvt. Ltd. · Made with ❤️ in India 🇮🇳</span>
          <span>CIN: U74999MH2026PTC000000 · GST: 27XXXXX0000X1ZX</span>
        </div>
      </div>
    </footer>
  );
}

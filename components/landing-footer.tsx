import Link from "next/link"
import { CheckSquare, TrendingUp, Mail, Phone, MapPin } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex items-center space-x-1">
                <CheckSquare className="h-6 w-6 text-teal-400" />
                <TrendingUp className="h-6 w-6 text-teal-400" />
              </div>
              <span className="text-xl font-bold">Task & Finance</span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Aplikasi manajemen tugas dan keuangan yang membantu Anda mengatur prioritas dengan sistem scoring otomatis
              dan melacak keuangan dengan mudah.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                Facebook
              </Link>
              <Link href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                Twitter
              </Link>
              <Link href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                Instagram
              </Link>
              <Link href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                LinkedIn
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Fitur
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Harga
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Masuk
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Daftar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-teal-400" />
                <span className="text-gray-300">support@taskfinance.id</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-teal-400" />
                <span className="text-gray-300">+62 21 1234 5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-teal-400" />
                <span className="text-gray-300">Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 Task & Finance. Semua hak dilindungi.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
              Syarat & Ketentuan
            </Link>
            <Link href="#" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
              Bantuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

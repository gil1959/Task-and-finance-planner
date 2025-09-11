"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckSquare, TrendingUp, Menu, X } from "lucide-react"
import { useState } from "react"

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <CheckSquare className="h-6 w-6 text-teal-600" />
              <TrendingUp className="h-6 w-6 text-teal-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">Task & Finance</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#home" className="text-gray-600 hover:text-teal-600 transition-colors">
              Home
            </Link>
            <Link href="#fitur" className="text-gray-600 hover:text-teal-600 transition-colors">
              Fitur
            </Link>
            <Link href="#gabung" className="text-gray-600 hover:text-teal-600 transition-colors">
              Bergabung
            </Link>

          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/register">Daftar Gratis</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-gray-600 hover:text-teal-600 transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Fitur
              </Link>
              <Link
                href="#pricing"
                className="text-gray-600 hover:text-teal-600 transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Harga
              </Link>
              <Link
                href="#about"
                className="text-gray-600 hover:text-teal-600 transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Tentang
              </Link>
              <Link
                href="#contact"
                className="text-gray-600 hover:text-teal-600 transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Kontak
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Button variant="ghost" asChild>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    Masuk
                  </Link>
                </Button>
                <Button asChild className="bg-teal-600 hover:bg-teal-700">
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    Daftar Gratis
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

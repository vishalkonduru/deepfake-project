import { useState, useEffect } from 'react'
import { EyeIcon, MenuIcon, XIcon } from '../components/Icons'

const navLinks = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'Model Info', href: '#model-info' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#09090B]/95 backdrop-blur-md border-b border-[#27272A]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="text-accent">
              <EyeIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-none">TruthLens</span>
              <p className="text-xs text-accent/70 font-medium leading-none mt-0.5">AI Verification Platform</p>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#A1A1AA] hover:text-white transition-colors duration-150 font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <a
              href="#analyzer"
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-[8px] transition-colors duration-150"
            >
              Analyze Video →
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-[#A1A1AA] hover:text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#27272A] py-4 space-y-3 bg-[#09090B]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-2 py-2 text-sm text-[#A1A1AA] hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#analyzer"
              className="block px-4 py-2 bg-accent text-white text-sm font-semibold rounded-[8px] text-center"
              onClick={() => setMenuOpen(false)}
            >
              Analyze Video →
            </a>
          </div>
        )}
      </div>
    </header>
  )
}

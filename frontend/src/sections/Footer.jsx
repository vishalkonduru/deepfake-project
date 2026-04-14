import { EyeIcon, GitHubIcon, TwitterIcon } from '../components/Icons'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Use cases', href: '#use-cases' },
      { label: 'Model info', href: '#model-info' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'API docs', href: '#' },
      { label: 'Model card', href: '#model-info' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Responsible AI', href: '#faq' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-[#27272A] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <a href="#" className="flex items-center gap-2.5">
              <div className="text-accent">
                <EyeIcon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-white font-bold text-lg leading-none">TruthLens</span>
                <p className="text-xs text-accent/70 font-medium leading-none mt-0.5">AI Verification Platform</p>
              </div>
            </a>
            <p className="text-[#52525B] text-sm leading-relaxed">
              Explainable AI deepfake detection. Built for professionals who need answers, not just scores.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com" className="text-[#52525B] hover:text-white transition-colors" aria-label="GitHub">
                <GitHubIcon />
              </a>
              <a href="https://x.com" className="text-[#52525B] hover:text-white transition-colors" aria-label="Twitter">
                <TwitterIcon />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-white font-semibold text-sm mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[#71717A] hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#52525B] text-xs">
            Built for Hackathon 2025 · TruthLens · Not for production use without human review
          </p>
          <p className="text-[#3f3f46] text-xs">
            © 2025 TruthLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

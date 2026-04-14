import { ExclamationIcon } from '../components/Icons'

export default function Disclaimer() {
  return (
    <section className="py-12 border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-verdict-uncertain/5 border border-verdict-uncertain/30 rounded-panel p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-card bg-verdict-uncertain/10 border border-verdict-uncertain/30 flex items-center justify-center text-verdict-uncertain flex-shrink-0">
              <ExclamationIcon className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h3 className="text-verdict-uncertain font-bold text-lg">Responsible use of AI</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed max-w-4xl">
                TruthLens uses probabilistic AI analysis. Results reflect statistical patterns and{' '}
                <strong className="text-white">should not be used as sole evidence</strong> in legal, journalistic,
                employment, or law enforcement decisions. Human expert review is always required. This tool has known
                limitations with certain compression formats and may exhibit higher error rates on underrepresented
                demographic groups. We are committed to ongoing bias auditing and model improvement.
              </p>
              <a
                href="#faq"
                className="inline-flex items-center gap-1 text-verdict-uncertain text-sm font-medium hover:text-white transition-colors"
              >
                Read our AI ethics policy →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

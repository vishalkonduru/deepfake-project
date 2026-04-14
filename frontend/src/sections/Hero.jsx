import { useEffect, useState } from 'react'

const stats = [
  { label: '93% AUC on FaceForensics++', icon: '◆' },
  { label: '< 30 second analysis', icon: '◆' },
  { label: 'Frame-level evidence', icon: '◆' },
]

function HeroMockup() {
  const [step, setStep] = useState(0)
  const [verdictVisible, setVerdictVisible] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 2800),
      setTimeout(() => setVerdictVisible(true), 3600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const pipelineSteps = ['Sampling frames', 'Detecting faces', 'Running inference']

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="bg-surface border border-[#27272A] rounded-panel p-6 space-y-4">
        {/* Video thumb */}
        <div className="bg-[#09090B] rounded-card border border-[#27272A] h-36 flex items-center justify-center overflow-hidden relative">
          <div className="scanlines absolute inset-0" />
          <div className="text-[#27272A] text-xs font-mono text-center">
            <div className="text-4xl mb-2 opacity-30">▶</div>
            <div>interview_clip.mp4</div>
          </div>
        </div>

        {/* Pipeline steps */}
        <div className="space-y-2">
          {pipelineSteps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border flex-shrink-0 transition-all duration-500 ${
                  step > i
                    ? 'bg-verdict-real border-verdict-real'
                    : step === i
                    ? 'border-accent animate-pulse-slow'
                    : 'border-[#27272A]'
                }`}
              >
                {step > i && (
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                    <path d="M3.5 8l3 3 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className={`text-xs font-medium transition-colors duration-300 ${
                step > i ? 'text-verdict-real' : step === i ? 'text-accent' : 'text-[#52525B]'
              }`}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Verdict card */}
        <div
          className={`border rounded-card p-4 transition-all duration-600 ${
            verdictVisible
              ? 'border-verdict-deepfake/40 bg-verdict-deepfake/5 opacity-100 scale-100'
              : 'border-[#27272A] opacity-0 scale-95 blur-sm'
          }`}
          style={{ transition: 'all 0.6s ease-out' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-verdict-deepfake font-bold text-sm tracking-wide">LIKELY DEEPFAKE</span>
            <span className="text-verdict-deepfake font-bold text-lg">87%</span>
          </div>
          <div className="mt-2 h-1.5 bg-[#27272A] rounded-full overflow-hidden">
            <div
              className="h-full bg-verdict-deepfake rounded-full transition-all duration-700"
              style={{ width: verdictVisible ? '87%' : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Decorative dots */}
      <div className="absolute -top-4 -right-4 w-24 h-24 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #6366F1 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}
      />
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Scanlines background */}
      <div className="scanlines absolute inset-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-surface border border-[#27272A] rounded-full px-3 py-1 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-verdict-real animate-pulse" />
                <span className="text-xs text-[#A1A1AA] font-medium">Powered by EfficientNet-B4</span>
              </div>

              <h1 className="text-5xl lg:text-[64px] font-bold leading-[1.05] tracking-tight text-white">
                Don't trust a face at face value.
              </h1>
            </div>

            <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-xl">
              TruthLens uses AI trained on 100,000+ deepfake samples to detect face-swap manipulation —
              with explainable frame-level evidence, not just a score.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#analyzer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-[8px] transition-colors duration-150"
              >
                Analyze a Video →
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#52525B] font-semibold rounded-[8px] transition-colors duration-150"
              >
                <span className="text-accent">▶</span> Watch how it works
              </a>
            </div>

            {/* Trust stats */}
            <div className="flex flex-wrap gap-6 pt-2">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="text-accent text-[10px]">{stat.icon}</span>
                  <span className="text-sm text-[#A1A1AA] font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup */}
          <div className="hidden lg:flex justify-center">
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  )
}

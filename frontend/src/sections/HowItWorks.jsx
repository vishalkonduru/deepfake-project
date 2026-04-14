import { UploadIcon, CpuChipIcon, DocumentTextIcon } from '../components/Icons'

const steps = [
  {
    number: '01',
    icon: UploadIcon,
    title: 'Upload your video',
    description: 'Drag and drop or browse to select your video. Supports MP4, MOV, and AVI formats up to 50MB.',
  },
  {
    number: '02',
    icon: CpuChipIcon,
    title: 'AI analyzes every face',
    description: 'Frame sampling, MediaPipe face detection, EfficientNet-B4 inference, and score aggregation across all detected faces.',
  },
  {
    number: '03',
    icon: DocumentTextIcon,
    title: 'Get verdict + evidence',
    description: 'Confidence score, suspicious frame gallery with anomaly labels, artifact classification, and an exportable result.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Three steps to verification
          </h2>
          <p className="text-[#71717A] text-lg max-w-xl mx-auto">
            Our end-to-end pipeline processes your video and returns structured, explainable evidence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="bg-surface border border-[#27272A] rounded-panel p-8 relative group hover:border-[#3f3f46] transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-card bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-bold text-[#27272A] font-mono leading-none">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-[#71717A] leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

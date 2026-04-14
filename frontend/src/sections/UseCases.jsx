import { NewspaperIcon, IdentificationIcon, ShieldIcon, UsersIcon, MegaphoneIcon, ScaleIcon } from '../components/Icons'

const cases = [
  {
    icon: NewspaperIcon,
    title: 'Investigative journalism',
    description: 'Verify video evidence before publication and protect editorial integrity.',
  },
  {
    icon: IdentificationIcon,
    title: 'KYC & identity verification',
    description: 'Detect face-swap fraud in onboarding flows before it becomes a compliance issue.',
  },
  {
    icon: ShieldIcon,
    title: 'Law enforcement',
    description: 'First-pass filter for video evidence review — flag suspicious content for expert analysis.',
  },
  {
    icon: UsersIcon,
    title: 'HR & remote hiring',
    description: 'Flag suspicious video interview recordings before final candidate decisions.',
  },
  {
    icon: MegaphoneIcon,
    title: 'Social media moderation',
    description: 'Scale deepfake detection across UGC platforms with an API-first approach.',
  },
  {
    icon: ScaleIcon,
    title: 'Legal & compliance',
    description: 'Generate an audit trail for video authenticity in litigation and regulatory review.',
  },
]

export default function UseCases() {
  return (
    <section id="use-cases" className="py-24 border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Built for professionals who can't afford to be wrong
          </h2>
          <p className="text-[#71717A] text-lg max-w-2xl mx-auto">
            TruthLens is designed for high-stakes environments where video authenticity directly impacts decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cases.map((useCase) => {
            const Icon = useCase.icon
            return (
              <div
                key={useCase.title}
                className="bg-surface border border-[#27272A] rounded-panel p-6 group hover:border-[#3f3f46] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-card bg-[#27272A] flex items-center justify-center text-[#A1A1AA] group-hover:bg-accent/10 group-hover:text-accent transition-colors duration-200 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-bold mb-2">{useCase.title}</h3>
                <p className="text-[#71717A] text-sm leading-relaxed mb-4">{useCase.description}</p>
                <a href="#analyzer" className="text-accent text-sm font-medium hover:text-white transition-colors">
                  Learn more →
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

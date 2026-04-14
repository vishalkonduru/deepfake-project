import { useState } from 'react'
import { ChevronDownIcon } from '../components/Icons'

const faqs = [
  {
    q: 'How accurate is TruthLens?',
    a: 'TruthLens achieves an AUC of 0.931 on the FaceForensics++ benchmark and 0.874 on the DFDC dataset. In practice, accuracy depends heavily on video quality, compression level, and manipulation type. For high-quality face-swap videos, real-world precision can exceed 90%. For compressed or low-resolution footage, error rates are higher. We recommend treating results as a probabilistic signal, not a definitive verdict.',
  },
  {
    q: 'Can it detect all types of deepfakes?',
    a: 'No. TruthLens is specifically trained to detect face-swap manipulation — where one person\'s face is replaced with another using generative AI or computer vision techniques. It does not detect voice cloning, lip-sync manipulation (talking head synthesis), scene fabrication, or metadata manipulation. The model also cannot detect manually edited video (cuts, color grading, compositing).',
  },
  {
    q: 'Is my video stored after analysis?',
    a: 'Videos are stored temporarily in server memory for the duration of analysis only. Uploaded files and extracted frame crops are automatically deleted 10 minutes after your analysis completes. We do not retain video data, train on user uploads, or share data with third parties. For sensitive material, we strongly recommend reviewing our privacy policy and considering on-premise deployment options.',
  },
  {
    q: 'How long does analysis take?',
    a: 'Analysis typically completes in 15–25 seconds for a 60-second video running on CPU inference. The pipeline samples frames at 2fps (up to 60 frames), detects faces using MediaPipe BlazeFace, runs EfficientNet-B4 batch inference via ONNX Runtime, and aggregates scores. Shorter clips and clips with fewer faces complete faster. GPU-accelerated backends can reduce this to under 5 seconds.',
  },
  {
    q: 'Can it be fooled or bypassed?',
    a: 'Yes — adversarial attacks can be crafted to evade detection. Research has demonstrated that adding imperceptible pixel-level perturbations can reduce deepfake detector confidence significantly. Additionally, high compression (e.g., social media re-encoding) degrades the artifacts that detectors rely on. This is an active area of research, and no detector should be considered foolproof. Defense-in-depth approaches combining multiple detection methods are recommended for high-security applications.',
  },
  {
    q: 'What video formats are supported?',
    a: 'TruthLens supports MP4 (H.264/H.265), MOV (QuickTime), and AVI files up to 50MB in size. For best results, use the highest quality version of the video available before any social media compression. Most modern camera recordings and screen captures in these formats are supported. Files with unusual codec configurations may fail to parse — in these cases, re-encoding to MP4 H.264 is recommended.',
  },
]

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border border-[#27272A] rounded-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#1c1c1f] transition-colors"
        onClick={onToggle}
      >
        <span className="text-white font-medium pr-8">{q}</span>
        <ChevronDownIcon className={`w-5 h-5 text-[#71717A] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`accordion-content ${isOpen ? 'open' : 'closed'}`}>
        <div className="px-6 pb-5 pt-1 text-[#A1A1AA] text-sm leading-relaxed border-t border-[#27272A]">
          <div className="pt-4">{a}</div>
        </div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section id="faq" className="py-24 border-t border-[#27272A]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <FaqItem
              key={i}
              q={item.q}
              a={item.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

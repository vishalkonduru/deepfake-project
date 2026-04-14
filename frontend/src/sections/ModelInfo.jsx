const MODEL_CARD = [
  ['Model', 'EfficientNet-B4'],
  ['Task', 'Binary face-swap detection'],
  ['Training data', 'FaceForensics++, DFDC, Celeb-DF v2'],
  ['Total samples', '~100,000 videos'],
  ['AUC (FF++)', '0.931'],
  ['AUC (DFDC)', '0.874'],
  ['Inference runtime', 'ONNX (CPU)'],
  ['Latency (60s video)', '~18s avg'],
  ['Face detector', 'MediaPipe BlazeFace'],
  ['Explainability', 'Gradient-weighted CAM'],
]

export default function ModelInfo() {
  return (
    <section id="model-info" className="py-24 border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">About the model</h2>
          <p className="text-[#71717A] text-lg max-w-xl mx-auto">
            Transparent model documentation so you understand exactly what's under the hood.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Model card */}
          <div className="bg-[#09090B] border border-[#27272A] rounded-panel p-6">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#27272A]">
              <div className="w-2 h-2 rounded-full bg-verdict-real" />
              <span className="text-xs text-[#71717A] font-mono">model_card.json</span>
            </div>
            <div className="space-y-2 font-mono text-sm">
              {MODEL_CARD.map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="text-accent min-w-[160px] flex-shrink-0">{key}:</span>
                  <span className="text-[#E4E4E7]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prose */}
          <div className="space-y-6 text-[#A1A1AA] text-sm leading-relaxed">
            <div>
              <h3 className="text-white font-bold text-base mb-2">Why EfficientNet-B4?</h3>
              <p>
                EfficientNet-B4 offers the best balance of computational efficiency and classification accuracy for
                face-crop-level deepfake detection. Compound scaling of width, depth, and resolution lets the model
                capture both fine texture artifacts and broader structural inconsistencies without requiring GPU
                infrastructure for inference.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-base mb-2">Training datasets</h3>
              <p>
                The model was trained on FaceForensics++ (FF++), the DFDC (Deepfake Detection Challenge) dataset,
                and Celeb-DF v2 — collectively covering face2face, faceswap, neural textures, and GAN-based generation
                methods. Each dataset contributes diversity in manipulation type, source video quality, and compression level.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-base mb-2">Known limitations</h3>
              <ul className="space-y-2 list-none">
                {[
                  'Highly compressed or low-resolution video reduces detection accuracy significantly.',
                  'Non-face-swap deepfake types (voice cloning, scene synthesis) are not detected.',
                  'The model may show higher error rates on demographic groups underrepresented in training data.',
                  'Adversarially crafted deepfakes may intentionally evade detection.',
                  'Results should always be corroborated with human expert review for high-stakes decisions.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-verdict-uncertain mt-0.5 flex-shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

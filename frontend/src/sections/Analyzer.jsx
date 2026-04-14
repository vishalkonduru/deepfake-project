import { useState, useRef, useCallback, useEffect } from 'react'
import { useUpload } from '../hooks/useUpload'
import { useJobPoller } from '../hooks/useJobPoller'
import client from '../api/client'
import {
  UploadIcon, SpinnerIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon, FaceIcon, VideoIcon
} from '../components/Icons'

// ── Artifact chip config ──────────────────────────────────────────────────────
const ARTIFACT_META = {
  face_boundary_mismatch: { label: 'Face boundary mismatch', color: 'text-verdict-deepfake bg-verdict-deepfake/10 border-verdict-deepfake/30' },
  blending_inconsistency: { label: 'Blending inconsistency', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
  texture_anomaly: { label: 'Texture anomaly', color: 'text-verdict-uncertain bg-verdict-uncertain/10 border-verdict-uncertain/30' },
  temporal_instability: { label: 'Temporal instability', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  unnatural_transition: { label: 'Unnatural transition', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ArtifactChip({ artifactKey }) {
  const meta = ARTIFACT_META[artifactKey] || { label: artifactKey, color: 'text-[#A1A1AA] bg-[#27272A] border-[#3f3f46]' }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-chip text-xs font-medium border ${meta.color}`}>
      {meta.label}
    </span>
  )
}

// ── Upload Zone ───────────────────────────────────────────────────────────────
function UploadZone({ onFileSelect, file, fileError }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFileSelect(dropped)
  }, [onFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-panel border-2 border-dashed p-12 text-center transition-all duration-200 ${
        dragOver
          ? 'border-accent bg-accent/5'
          : file
          ? 'border-verdict-real/50 bg-verdict-real/5'
          : 'border-[#27272A] hover:border-[#3f3f46] bg-surface hover:bg-[#1c1c1f]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
        className="hidden"
        onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
      />

      {file ? (
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-card bg-verdict-real/10 border border-verdict-real/30 flex items-center justify-center text-verdict-real mx-auto">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white font-semibold">{file.name}</p>
            <p className="text-[#71717A] text-sm mt-1">{formatFileSize(file.size)}</p>
          </div>
          <p className="text-xs text-[#52525B]">Click to change file</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-card bg-[#27272A] border border-[#3f3f46] flex items-center justify-center text-[#71717A] mx-auto">
            <UploadIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white font-medium">Drag your video here or click to browse</p>
            <p className="text-[#71717A] text-sm mt-1">MP4, MOV, AVI — up to 50MB</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Processing Panel ──────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  'Uploading video',
  'Sampling frames',
  'Detecting faces',
  'Running inference',
  'Generating report',
]

function ProcessingPanel({ jobStatus, onCancel }) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentIndex = jobStatus?.step_index ?? 0
  const progress = jobStatus?.progress ?? 0
  const estimatedTotal = 18
  const remaining = Math.max(0, estimatedTotal - elapsed)

  return (
    <div className="bg-surface border border-[#27272A] rounded-panel p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">Analyzing video...</h3>
        <span className="text-[#71717A] text-sm">~{remaining}s remaining</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-1.5 bg-[#27272A] rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#52525B]">
          <span>{Math.round(progress * 100)}%</span>
          <span>{elapsed}s elapsed</span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {PIPELINE_STEPS.map((step, i) => {
          const isDone = i < currentIndex
          const isCurrent = i === currentIndex
          const isPending = i > currentIndex

          return (
            <div key={step} className="flex items-center gap-4">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-300 ${
                isDone ? 'bg-verdict-real border-verdict-real' :
                isCurrent ? 'border-accent' :
                'border-[#27272A]'
              }`}>
                {isDone ? (
                  <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4">
                    <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                ) : null}
              </div>

              <div className="flex-1 flex items-center justify-between">
                <span className={`text-sm font-medium transition-colors ${
                  isDone ? 'text-verdict-real' : isCurrent ? 'text-white' : 'text-[#52525B]'
                }`}>
                  {step}
                </span>
                {isDone && <span className="text-xs text-verdict-real">Done</span>}
                {isCurrent && <span className="text-xs text-accent">In progress...</span>}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={onCancel}
        className="w-full py-2.5 border border-[#27272A] text-[#71717A] hover:text-white hover:border-[#52525B] text-sm font-medium rounded-[8px] transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}

// ── Confidence Meter ──────────────────────────────────────────────────────────
function ConfidenceMeter({ value, verdict }) {
  const [width, setWidth] = useState(0)
  const color = verdict === 'DEEPFAKE' ? '#EF4444' : verdict === 'REAL' ? '#22C55E' : '#F59E0B'

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value * 100), 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-[#71717A] font-medium">
        <span>Confidence</span>
        <span style={{ color }}>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-3 bg-[#27272A] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full confidence-fill"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ── Suspicious Frame Card ─────────────────────────────────────────────────────
function FrameCard({ frame, index }) {
  const apiBase = import.meta.env.VITE_API_URL || ''
  const imgSrc = frame.image_url ? `${apiBase}${frame.image_url}` : null

  return (
    <div
      className="frame-card bg-[#09090B] border border-[#27272A] rounded-card overflow-hidden hover:border-accent/50 transition-all duration-200 group"
      style={{ animation: `fadeIn 0.4s ease-out ${index * 150}ms both` }}
    >
      {/* Image */}
      <div className="aspect-square bg-[#18181B] flex items-center justify-center relative overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} alt={`Frame at ${formatDuration(frame.timestamp)}`} className="w-full h-full object-cover" />
        ) : (
          <div className="text-[#3f3f46]">
            <FaceIcon className="w-10 h-10" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2">
          <span className="bg-black/70 text-white text-xs font-mono px-2 py-0.5 rounded">
            {formatDuration(frame.timestamp)}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-verdict-deepfake/80 text-white text-xs font-bold px-2 py-0.5 rounded">
            {Math.round(frame.score * 100)}%
          </span>
        </div>
      </div>

      {/* Artifacts */}
      {frame.artifacts?.length > 0 && (
        <div className="p-3 flex flex-wrap gap-1.5">
          {frame.artifacts.slice(0, 2).map((a) => (
            <ArtifactChip key={a} artifactKey={a} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Explainability Accordion ──────────────────────────────────────────────────
function ExplainAccordion() {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-[#27272A] rounded-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1c1c1f] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium text-[#A1A1AA]">What does this mean?</span>
        <ChevronDownIcon className={`w-4 h-4 text-[#71717A] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`accordion-content ${open ? 'open' : 'closed'}`}>
        <div className="px-5 pb-5 space-y-4 text-sm text-[#71717A] leading-relaxed border-t border-[#27272A]">
          <div className="pt-4">
            <h4 className="text-white font-semibold mb-2 text-sm">Gradient-weighted Class Activation Maps (Grad-CAM)</h4>
            <p>The model uses gradient-based feature attribution to highlight which regions of each face patch contributed most to the deepfake classification. Areas with high activation correlate with detected manipulation artifacts.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2 text-sm">Face boundaries & blending</h4>
            <p>Face-swap models often introduce inconsistencies at the boundary where the synthetic face meets the original neck, hair, and background. The model is specifically trained to detect these seam artifacts at sub-pixel precision.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2 text-sm">Temporal instability</h4>
            <p>Deepfake videos often show flickering or inconsistency across consecutive frames that isn't present in authentic footage. Frame-to-frame variance in anomaly scores can indicate generated content.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Results Panel ─────────────────────────────────────────────────────────────
function ResultsPanel({ result, onReset }) {
  const { verdict, confidence, frames_analyzed, faces_detected, processing_time_ms,
          suspicious_frames, artifacts, filename } = result

  const verdictLabel = verdict === 'DEEPFAKE' ? 'LIKELY DEEPFAKE'
    : verdict === 'REAL' ? 'LIKELY REAL' : 'UNCERTAIN'

  const verdictColor = verdict === 'DEEPFAKE' ? 'text-verdict-deepfake'
    : verdict === 'REAL' ? 'text-verdict-real' : 'text-verdict-uncertain'

  const verdictBg = verdict === 'DEEPFAKE' ? 'bg-verdict-deepfake/10 border-verdict-deepfake/30'
    : verdict === 'REAL' ? 'bg-verdict-real/10 border-verdict-real/30' : 'bg-verdict-uncertain/10 border-verdict-uncertain/30'

  const confidenceBand = confidence >= 0.80 ? 'High confidence'
    : confidence >= 0.60 ? 'Moderate confidence' : 'Low confidence'

  return (
    <div className="animate-scale-in grid lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-5">
        {/* Verdict card */}
        <div className={`border rounded-panel p-6 space-y-5 ${verdictBg}`}>
          <p className="text-[#71717A] text-xs font-medium truncate">{filename}</p>

          <div>
            <div className={`text-3xl font-bold tracking-wide ${verdictColor}`}>{verdictLabel}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-bold text-white">{Math.round(confidence * 100)}%</span>
              <span className="text-[#71717A] text-sm">{confidenceBand}</span>
            </div>
          </div>

          <ConfidenceMeter value={confidence} verdict={verdict} />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-current/10">
            {[
              { label: 'Frames', value: frames_analyzed },
              { label: 'Faces', value: faces_detected },
              { label: 'Time', value: `${(processing_time_ms / 1000).toFixed(1)}s` },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-[#71717A]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Artifact chips */}
        {artifacts?.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-[#71717A] uppercase tracking-wider">Detected artifacts</p>
            <div className="flex flex-wrap gap-2">
              {artifacts.map((a) => <ArtifactChip key={a} artifactKey={a} />)}
            </div>
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full py-3 border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#52525B] text-sm font-medium rounded-[8px] transition-colors"
        >
          Analyze another video
        </button>
      </div>

      {/* Right column */}
      <div className="space-y-5">
        <h3 className="text-white font-bold text-lg">Suspicious frames</h3>

        {suspicious_frames?.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {suspicious_frames.map((frame, i) => (
              <FrameCard key={frame.frame_index} frame={frame} index={i} />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-[#27272A] rounded-card p-8 text-center text-[#52525B]">
            <FaceIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No suspicious frames detected</p>
          </div>
        )}

        <ExplainAccordion />
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-48 shimmer rounded-panel" />
        <div className="h-8 shimmer rounded" />
        <div className="h-12 shimmer rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-6 w-36 shimmer rounded" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square shimmer rounded-card" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Analyzer ─────────────────────────────────────────────────────────────
export default function Analyzer() {
  const { file, fileError, uploading, uploadError, selectFile, clearFile, upload } = useUpload()
  const { jobStatus, result, error: pollError, startPolling, reset: resetPoller } = useJobPoller()
  const [phase, setPhase] = useState('idle') // idle | uploading | processing | result | error

  const handleSubmit = async () => {
    setPhase('uploading')
    const jobId = await upload()
    if (!jobId) {
      setPhase('error')
      return
    }
    setPhase('processing')
    startPolling(jobId)
  }

  useEffect(() => {
    if (result) setPhase('result')
  }, [result])

  useEffect(() => {
    if (pollError) setPhase('error')
  }, [pollError])

  const handleReset = () => {
    clearFile()
    resetPoller()
    setPhase('idle')
  }

  const handleSample = async (type) => {
    try {
      const { data } = await client.get('/api/samples')
      const sample = data.find((s) => s.id === type)
      if (!sample) return
      // Fetch the video as a blob and create a File object
      const res = await fetch(sample.url)
      const blob = await res.blob()
      const f = new File([blob], `${type}_sample.mp4`, { type: 'video/mp4' })
      selectFile(f)
    } catch (e) {
      // fallback: just set a dummy file for demo
      const f = new File([new Uint8Array(100)], `${type}_sample.mp4`, { type: 'video/mp4' })
      selectFile(f)
    }
  }

  return (
    <section id="analyzer" className="py-24 border-t border-[#27272A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Analyze a video
          </h2>
          <p className="text-[#71717A] text-lg">
            Upload any video and get a deepfake verdict with frame-level evidence in seconds.
          </p>
        </div>

        {/* Error state */}
        {phase === 'error' && (
          <div className="mb-6 bg-verdict-deepfake/10 border border-verdict-deepfake/30 rounded-card p-4 flex items-start gap-3">
            <XCircleIcon className="w-5 h-5 text-verdict-deepfake flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-verdict-deepfake font-medium text-sm">{pollError || uploadError || 'Analysis failed'}</p>
              <button onClick={handleReset} className="text-xs text-[#71717A] hover:text-white mt-1 underline">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Upload / idle state */}
        {(phase === 'idle' || phase === 'uploading' || (phase === 'error' && !pollError)) && (
          <div className="space-y-5">
            <UploadZone onFileSelect={selectFile} file={file} fileError={fileError} />

            {fileError && (
              <div className="flex items-center gap-2 text-verdict-deepfake text-sm">
                <XCircleIcon className="w-4 h-4" />
                {fileError}
              </div>
            )}

            {/* Sample buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[#71717A] text-sm">Or try a sample:</span>
              <button
                onClick={() => handleSample('real')}
                className="px-4 py-1.5 border border-[#27272A] text-sm text-[#A1A1AA] hover:border-verdict-real/50 hover:text-verdict-real rounded-full transition-colors"
              >
                Real video sample
              </button>
              <button
                onClick={() => handleSample('deepfake')}
                className="px-4 py-1.5 border border-[#27272A] text-sm text-[#A1A1AA] hover:border-verdict-deepfake/50 hover:text-verdict-deepfake rounded-full transition-colors"
              >
                Deepfake sample
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-[8px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <SpinnerIcon className="w-4 h-4" />
                  Uploading...
                </>
              ) : (
                'Analyze Video'
              )}
            </button>
          </div>
        )}

        {/* Processing state */}
        {phase === 'processing' && jobStatus && (
          <ProcessingPanel jobStatus={jobStatus} onCancel={handleReset} />
        )}

        {/* Result */}
        {phase === 'result' && result && (
          <ResultsPanel result={result} onReset={handleReset} />
        )}

        {/* Loading skeleton while fetching result */}
        {phase === 'processing' && !jobStatus && <Skeleton />}
      </div>
    </section>
  )
}

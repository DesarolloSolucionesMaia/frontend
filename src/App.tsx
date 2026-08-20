import { useState } from 'react'

type Stage = 'idle' | 'loaded' | 'analyzed'

interface AnalysisResult {
  images: number
  paragraphs: number
  unidentified: number
  pages: number
}

const MOCK_RESULT: AnalysisResult = {
  images: 5,
  paragraphs: 30,
  unidentified: 4,
  pages: 5,
}

const THEME = {
  rose: {
    track: 'bg-rose-100',
    fill: 'bg-gradient-to-r from-rose-400 to-rose-500',
    text: 'text-rose-900',
    button: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200',
  },
  indigo: {
    track: 'bg-indigo-100',
    fill: 'bg-gradient-to-r from-indigo-400 to-indigo-500',
    text: 'text-indigo-900',
    button: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200',
  },
} as const

function ProgressBar({ percent, color }: { percent: number; color: keyof typeof THEME }) {
  const t = THEME[color]
  return (
    <div className={`relative h-11 w-full overflow-hidden rounded-full ${t.track}`}>
      <div
        className={`h-full ${t.fill} transition-all duration-500 ease-out`}
        style={{ width: `${percent}%` }}
      />
      <span className={`absolute inset-0 flex items-center pl-4 text-sm font-semibold ${t.text}`}>
        {percent}%
      </span>
    </div>
  )
}

function ActionButton({
  label,
  color,
  disabled,
  onClick,
}: {
  label: string
  color: keyof typeof THEME
  disabled: boolean
  onClick: () => void
}) {
  const t = THEME[color]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-40 rounded-full py-2 text-sm font-semibold text-white shadow-lg transition-all
        ${disabled ? 'cursor-not-allowed bg-neutral-300 shadow-none' : `${t.button} hover:-translate-y-0.5 hover:shadow-xl`}`}
    >
      {label}
    </button>
  )
}

function App() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>('idle')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileName(file ? file.name : null)
    setStage('idle')
  }

  const handleLoad = () => {
    if (!fileName) return
    setStage('loaded')
  }

  const handleAnalyze = () => {
    if (stage === 'idle') return
    setStage('analyzed')
  }

  const loadPercent = stage === 'idle' ? 0 : 40
  const analyzePercent = stage === 'analyzed' ? 40 : 0

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-rose-50 p-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl shadow-indigo-100 ring-1 ring-black/5">
        <h1 className="mb-6 text-center text-lg font-bold text-neutral-800">
          Clasificador de documentos PDF
        </h1>

        <label
          htmlFor="pdf-upload"
          className="mb-6 flex h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 px-4 text-center text-sm text-indigo-700 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
        >
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          <span className="font-medium">
            {fileName ?? 'agregue los documentos pdf a analizar'}
          </span>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <div className="mb-2 flex justify-center">
          <ActionButton label="Load" color="rose" disabled={!fileName} onClick={handleLoad} />
        </div>
        <div className="mb-6">
          <ProgressBar percent={loadPercent} color="rose" />
        </div>

        <div className="mb-2 flex justify-center">
          <ActionButton label="Analizar" color="indigo" disabled={stage === 'idle'} onClick={handleAnalyze} />
        </div>
        <div className="mb-6">
          <ProgressBar percent={analyzePercent} color="indigo" />
        </div>

        <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm">
          {stage === 'analyzed' ? (
            <div className="space-y-1.5 font-medium text-neutral-700">
              <p>{MOCK_RESULT.images} images</p>
              <p>{MOCK_RESULT.paragraphs} parrafos</p>
              <p>{MOCK_RESULT.unidentified} imagenes o textos sin identificar.</p>
              <p>{MOCK_RESULT.pages} paginas.</p>
            </div>
          ) : (
            <p className="text-neutral-400">Los resultados aparecerán aquí</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

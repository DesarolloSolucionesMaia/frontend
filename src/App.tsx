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

function ProgressBar({ percent, color }: { percent: number; color: 'red' | 'blue' }) {
  const fillClass = color === 'red' ? 'bg-red-200' : 'bg-blue-200'
  return (
    <div className="relative h-11 w-full overflow-hidden rounded-md border border-neutral-800">
      <div
        className={`h-full ${fillClass} transition-all duration-500`}
        style={{ width: `${percent}%` }}
      />
      <span className="absolute inset-0 flex items-center pl-4 text-sm font-medium text-neutral-800">
        {percent}%
      </span>
    </div>
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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-xl rounded-lg border border-neutral-800 bg-white p-6">
        <label
          htmlFor="pdf-upload"
          className="mb-6 flex h-16 w-full cursor-pointer items-center justify-center rounded-md border border-neutral-800 px-4 text-center text-sm text-neutral-800 hover:bg-neutral-50"
        >
          {fileName ?? 'agregue los documentos pdf a analizar'}
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <div className="mb-2 flex justify-center">
          <button
            type="button"
            onClick={handleLoad}
            className="w-40 rounded-md border border-neutral-800 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
          >
            Load
          </button>
        </div>
        <div className="mb-6">
          <ProgressBar percent={loadPercent} color="red" />
        </div>

        <div className="mb-2 flex justify-center">
          <button
            type="button"
            onClick={handleAnalyze}
            className="w-40 rounded-md border border-neutral-800 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
          >
            Analizar
          </button>
        </div>
        <div className="mb-6">
          <ProgressBar percent={analyzePercent} color="blue" />
        </div>

        <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-neutral-800 px-4 py-6 text-center text-sm text-neutral-800">
          {stage === 'analyzed' ? (
            <>
              <p>{MOCK_RESULT.images} images</p>
              <p>{MOCK_RESULT.paragraphs} parrafos</p>
              <p>{MOCK_RESULT.unidentified} imagenes o textos sin identificar.</p>
              <p>{MOCK_RESULT.pages} paginas.</p>
            </>
          ) : (
            <p className="text-neutral-400">Los resultados aparecerán aquí</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

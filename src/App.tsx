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

const STEPS = [
  { title: 'Cargar archivos', description: 'Arrastra o selecciona PDFs' },
  { title: 'Procesar', description: 'Extracción de texto' },
  { title: 'Resultados', description: 'Ver clasificaciones' },
] as const

function StepItem({
  number,
  title,
  description,
  active,
  done,
}: {
  number: number
  title: string
  description: string
  active: boolean
  done: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors
          ${active ? 'bg-[#FFD400] text-black' : done ? 'bg-[#FFD400]/30 text-[#FFD400]' : 'bg-neutral-700 text-neutral-400'}`}
      >
        {number}
      </div>
      <div>
        <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-neutral-400'}`}>{title}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
    </div>
  )
}

function App() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>('idle')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileName(file ? file.name : null)
    setStage(file ? 'loaded' : 'idle')
  }

  const handleAnalyze = () => {
    if (stage === 'idle') return
    setStage('analyzed')
  }

  const currentStep = stage === 'idle' ? 1 : stage === 'loaded' ? 2 : 3

  const stats = [
    { label: 'Archivos cargados', value: fileName ? 1 : 0 },
    { label: 'Procesados', value: stage !== 'idle' ? 1 : 0 },
    { label: 'Clasificados', value: stage === 'analyzed' ? 1 : 0 },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      <header className="flex w-full items-center justify-between bg-[#FFD400] px-6 py-4">
        <img src="/uniandes-logo.png" alt="Universidad de los Andes" className="h-14 w-auto" />
        <p className="text-sm font-medium text-black">Clasificador de documentos</p>
      </header>

      <div className="flex flex-1">
        <aside className="flex w-72 flex-shrink-0 flex-col justify-between border-r border-neutral-800 bg-neutral-900 p-6">
          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <StepItem
                key={step.title}
                number={i + 1}
                title={step.title}
                description={step.description}
                active={currentStep === i + 1}
                done={currentStep > i + 1}
              />
            ))}
          </div>

          <div className="space-y-1.5 border-t border-neutral-800 pt-4 text-sm">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-neutral-400">{s.label}</span>
                <span className="font-bold text-[#FFD400]">{s.value}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-8">
          <h2 className="text-xl font-semibold text-white">Selecciona los documentos</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Formatos aceptados: PDF · Tamaño máx. 20 MB por archivo
          </p>

          <label
            htmlFor="pdf-upload"
            className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900 px-8 py-16 text-center transition-colors hover:border-[#FFD400]/60"
          >
            <svg className="h-10 w-10 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h6M9 9h1M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
            </svg>
            <p className="font-medium text-white">
              {fileName ?? 'Arrastra documentos PDF aquí'}
            </p>
            <p className="text-sm text-neutral-500">
              {fileName ? 'Archivo listo' : 'o haz clic para seleccionar'}
            </p>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {fileName && stage !== 'analyzed' && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleAnalyze}
                className="rounded-full bg-[#FFD400] px-6 py-2 text-sm font-semibold text-black shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Analizar
              </button>
            </div>
          )}

          <div className="mt-8">
            {stage === 'analyzed' ? (
              <div className="mx-auto max-w-md space-y-1.5 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-6 text-center text-sm font-medium text-neutral-300">
                <p>{MOCK_RESULT.images} imágenes</p>
                <p>{MOCK_RESULT.paragraphs} párrafos</p>
                <p>{MOCK_RESULT.unidentified} imágenes o textos sin identificar.</p>
                <p>{MOCK_RESULT.pages} páginas.</p>
              </div>
            ) : (
              <p className="flex flex-col items-center gap-1 text-center text-blue-400">
                <span aria-hidden className="animate-bounce text-xl">↑</span>
                <span className="animate-pulse">Los archivos aparecerán aquí</span>
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App

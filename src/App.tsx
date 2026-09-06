import { useState } from 'react'

type Stage = 'idle' | 'loaded' | 'analyzed'
type Tab = 'ingresar' | 'resultado' | 'historial'

interface HistoryEntry {
  fileName: string
  category: string
  confidence: number
  timestamp: string
}

const CATEGORY_ICONS: Record<string, string> = {
  Alimentación: '🍽️',
  Astronomía: '🔭',
  Economía: '💹',
  Moda: '👗',
  Medicina: '🩺',
  Defensa: '🛡️',
  Motor: '🏎️',
  Entretenimiento: '🎬',
  Política: '🏛️',
  Religión: '🙏',
  Deportes: '⚽',
  Tecnología: '💻',
}

const MOCK_ANALYSIS = {
  category: 'Medicina',
  confidence: 68,
  keywords: ['IA médica', 'MIT', 'cáncer de pulmón', 'diagnóstico', 'aprendizaje profundo'],
  features: [
    { label: 'Vocabulario biomédico', percent: 92 },
    { label: 'Institución investigadora', percent: 78 },
    { label: 'Método experimental', percent: 65 },
    { label: 'Resultado cuantitativo', percent: 54 },
  ],
  reasoning:
    'El texto contiene vocabulario específico del dominio biomédico (cáncer, radiólogos, imágenes médicas) y hace referencia a una institución de investigación (MIT) y una metodología (aprendizaje profundo). Un modelo supervisado identificaría estos patrones mediante embeddings entrenados con corpus científicos, asignando alta probabilidad al espacio vectorial de "Medicina".',
} as const

function ConfidenceGauge({ percent }: { percent: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)

  return (
    <div className="relative h-28 w-28 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#27272a" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{percent}%</span>
        <span className="text-[10px] text-neutral-500">confianza</span>
      </div>
    </div>
  )
}

function App() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [activeTab, setActiveTab] = useState<Tab>('ingresar')
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileName(file ? file.name : null)
    setStage(file ? 'loaded' : 'idle')
  }

  const handleAnalyze = () => {
    if (stage === 'idle' || !fileName) return
    setStage('analyzed')
    setHistory((prev) => [
      {
        fileName,
        category: MOCK_ANALYSIS.category,
        confidence: MOCK_ANALYSIS.confidence,
        timestamp: new Date().toLocaleString('es-CO'),
      },
      ...prev,
    ])
    setActiveTab('resultado')
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'ingresar', label: 'Ingresar' },
    { id: 'resultado', label: 'Resultado' },
    { id: 'historial', label: `Historial (${history.length})` },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      <header className="flex w-full items-center justify-between bg-[#FFD400] px-6 py-4">
        <img src="/uniandes-logo.png" alt="Universidad de los Andes" className="h-14 w-auto" />
        <p className="text-sm font-medium text-black">Clasificador de documentos</p>
      </header>

      <div className="flex gap-6 border-b border-neutral-800 bg-neutral-950 px-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 pb-3 pt-4 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 p-8">
        {activeTab === 'ingresar' && (
          <div className="mx-auto max-w-xl">
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

            {!fileName && (
              <p className="mt-8 flex flex-col items-center gap-1 text-center text-blue-400">
                <span aria-hidden className="animate-bounce text-xl">↑</span>
                <span className="animate-pulse">Los archivos aparecerán aquí</span>
              </p>
            )}
          </div>
        )}

        {activeTab === 'resultado' && (
          <div className="mx-auto max-w-xl space-y-5">
            {stage !== 'analyzed' ? (
              <p className="text-center text-neutral-500">
                Todavía no se ha analizado ningún documento. Ve a la pestaña "Ingresar" para comenzar.
              </p>
            ) : (
              <>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Categoría asignada
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-300">
                      {CATEGORY_ICONS[MOCK_ANALYSIS.category]} {MOCK_ANALYSIS.category}
                    </span>
                    <ConfidenceGauge percent={MOCK_ANALYSIS.confidence} />
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Palabras clave detectadas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_ANALYSIS.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Rasgos con mayor peso predictivo
                  </p>
                  <div className="space-y-3">
                    {MOCK_ANALYSIS.features.map((feature) => (
                      <div key={feature.label}>
                        <div className="mb-1 flex justify-between text-xs text-neutral-400">
                          <span>{feature.label}</span>
                          <span>{feature.percent}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                            style={{ width: `${feature.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-900/50 bg-emerald-500/5 p-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                    Trazabilidad — razonamiento del modelo
                  </p>
                  <p className="text-sm leading-relaxed text-neutral-300">{MOCK_ANALYSIS.reasoning}</p>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'historial' && (
          <div className="mx-auto max-w-xl space-y-3">
            {history.length === 0 ? (
              <p className="text-center text-neutral-500">Aún no hay análisis registrados.</p>
            ) : (
              history.map((entry, index) => (
                <div
                  key={`${entry.fileName}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{entry.fileName}</p>
                    <p className="text-xs text-neutral-500">{entry.timestamp}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">
                    {CATEGORY_ICONS[entry.category]} {entry.category} · {entry.confidence}%
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App

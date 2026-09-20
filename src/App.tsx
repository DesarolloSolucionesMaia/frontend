import { useState } from 'react'

type Stage = 'idle' | 'loaded' | 'analyzing' | 'analyzed'
type Tab = 'ingresar' | 'resultado' | 'historial'

const API_BASE_URL = '/api'

interface RankedPrediction {
  label: number
  category: string
  probability: number
}

interface PredictionResponse {
  prediction_id: string
  created_at: string
  source_type: string
  file_name: string | null
  predicted_label: number
  predicted_category: string
  confidence: number
  top_3: RankedPrediction[]
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
  const [file, setFile] = useState<File | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [activeTab, setActiveTab] = useState<Tab>('ingresar')
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<PredictionResponse[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [clearingHistory, setClearingHistory] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setStage(selected ? 'loaded' : 'idle')
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!file) return

    setStage('analyzing')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/v1/predictions/pdf`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.detail ?? `Error ${response.status} al analizar el documento`)
      }

      const data: PredictionResponse = await response.json()
      setResult(data)
      setStage('analyzed')
      setHistory((prev) => [data, ...prev])
      setActiveTab('resultado')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con la API. Verifica que el servicio esté disponible.',
      )
      setStage('loaded')
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/v1/predictions?limit=20`)
      if (!response.ok) throw new Error('No se pudo cargar el historial')
      const data = await response.json()
      setHistory(data.items ?? [])
    } catch {
      // se conserva el historial local si la API no responde
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (history.length === 0) return
    setClearingHistory(true)
    try {
      await Promise.all(
        history.map((entry) =>
          fetch(`${API_BASE_URL}/v1/predictions/${entry.prediction_id}`, {
            method: 'DELETE',
          }),
        ),
      )
      setHistory([])
    } catch {
      // si alguna eliminación falla, se recarga para reflejar el estado real
      await loadHistory()
    } finally {
      setClearingHistory(false)
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (tab === 'historial') loadHistory()
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
            onClick={() => handleTabChange(tab.id)}
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
              Formatos aceptados: PDF · Tamaño máx. 50 MB por archivo
            </p>

            <label
              htmlFor="pdf-upload"
              className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900 px-8 py-16 text-center transition-colors hover:border-[#FFD400]/60"
            >
              <svg className="h-10 w-10 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h6M9 9h1M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
              </svg>
              <p className="font-medium text-white">
                {file?.name ?? 'Arrastra documentos PDF aquí'}
              </p>
              <p className="text-sm text-neutral-500">
                {file ? 'Archivo listo' : 'o haz clic para seleccionar'}
              </p>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {file && stage !== 'analyzed' && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={stage === 'analyzing'}
                  className="rounded-full bg-[#FFD400] px-6 py-2 text-sm font-semibold text-black shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {stage === 'analyzing' ? 'Analizando…' : 'Analizar'}
                </button>
                {error && <p className="max-w-sm text-center text-sm text-red-400">{error}</p>}
              </div>
            )}

            {!file && (
              <p className="mt-8 flex flex-col items-center gap-1 text-center text-blue-400">
                <span aria-hidden className="animate-bounce text-xl">↑</span>
                <span className="animate-pulse">Los archivos aparecerán aquí</span>
              </p>
            )}
          </div>
        )}

        {activeTab === 'resultado' && (
          <div className="mx-auto max-w-xl space-y-5">
            {!result ? (
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
                      {CATEGORY_ICONS[result.predicted_category] ?? '📄'} {result.predicted_category}
                    </span>
                    <ConfidenceGauge percent={Math.round(result.confidence * 100)} />
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Top 3 categorías más probables
                  </p>
                  <div className="space-y-3">
                    {result.top_3.map((prediction) => (
                      <div key={prediction.label}>
                        <div className="mb-1 flex justify-between text-xs text-neutral-400">
                          <span>
                            {CATEGORY_ICONS[prediction.category] ?? '📄'} {prediction.category}
                          </span>
                          <span>{(prediction.probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                            style={{ width: `${prediction.probability * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-900/50 bg-emerald-500/5 p-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                    Trazabilidad
                  </p>
                  <div className="space-y-1 text-sm text-neutral-300">
                    <p>
                      <span className="text-neutral-500">ID de predicción: </span>
                      <span className="font-mono text-xs">{result.prediction_id}</span>
                    </p>
                    <p>
                      <span className="text-neutral-500">Archivo: </span>
                      {result.file_name ?? '—'}
                    </p>
                    <p>
                      <span className="text-neutral-500">Fecha: </span>
                      {new Date(result.created_at).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'historial' && (
          <div className="mx-auto max-w-xl space-y-3">
            {history.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  disabled={clearingHistory}
                  className="rounded-full border border-red-900/50 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {clearingHistory ? 'Borrando…' : 'Borrar historial'}
                </button>
              </div>
            )}

            {historyLoading ? (
              <p className="text-center text-neutral-500">Cargando historial…</p>
            ) : history.length === 0 ? (
              <p className="text-center text-neutral-500">Aún no hay análisis registrados.</p>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.prediction_id}
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{entry.file_name ?? 'Texto directo'}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(entry.created_at).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">
                    {CATEGORY_ICONS[entry.predicted_category] ?? '📄'} {entry.predicted_category} ·{' '}
                    {(entry.confidence * 100).toFixed(0)}%
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

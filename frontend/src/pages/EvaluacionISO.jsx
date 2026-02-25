import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronDown, ChevronRight, CheckCircle2, XCircle,
  Send, ArrowLeft, BookOpen, AlertTriangle, Save
} from 'lucide-react'
import { diagnosticoAPI } from '../services/api'
import useDiagnosticoStore from '../store/diagnosticoStore'
import { PageLoader, AlertError, ProgressBar } from '../components/UI'

const CAPITULOS_LABELS = {
  4: 'Contexto de la Organización',
  5: 'Liderazgo',
  6: 'Planificación',
  7: 'Apoyo',
  8: 'Operación',
  9: 'Evaluación del Desempeño',
  10: 'Mejora',
}

export default function EvaluacionISO() {
  const { proyectoId } = useParams()
  const navigate = useNavigate()

  const {
    proyectoActivo, capituloActual, respuestas,
    requisitos, cargandoRequisitos, errorRequisitos,
    enviando, enviado, errorEnvio,
    setCapituloActual, setRespuesta, setEvidencia,
    setRequisitos, setCargandoRequisitos, setErrorRequisitos,
    setEnviando, setEnviado, setErrorEnvio,
    getCapitulosDisponibles, getRequisitosPorCapitulo,
    getProgresoPorCapitulo, getPorcentajeCompletado,
    buildPayload,
  } = useDiagnosticoStore()

  // ── Cargar requisitos ─────────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      if (requisitos.length > 0) return  // ya en store (persistido)
      setCargandoRequisitos(true)
      setErrorRequisitos(null)
      try {
        const { data } = await diagnosticoAPI.listarRequisitos()
        setRequisitos(data)
      } catch (err) {
        setErrorRequisitos(err.message)
      } finally {
        setCargandoRequisitos(false)
      }
    }
    cargar()
  }, [])

  // ── Pre-cargar respuestas guardadas ───────────────────────────────────────
  useEffect(() => {
    const cargarRespuestas = async () => {
      if (!proyectoId || Object.keys(respuestas).length > 0) return
      try {
        const { data } = await diagnosticoAPI.obtenerRespuestas(proyectoId)
        data.forEach((r) => {
          setRespuesta(r.requisito_id, r.cumple, r.evidencia || '')
        })
      } catch {
        // silencioso: no hay respuestas previas
      }
    }
    cargarRespuestas()
  }, [proyectoId])

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const payload = buildPayload()
    if (payload.respuestas.length === 0) {
      setErrorEnvio('Debes responder al menos una pregunta antes de enviar.')
      return
    }
    setEnviando(true)
    setErrorEnvio(null)
    try {
      await diagnosticoAPI.guardarRespuestas(payload)
      setEnviado(true)
      navigate(`/resultados/${proyectoId}`)
    } catch (err) {
      setErrorEnvio(err.message)
    } finally {
      setEnviando(false)
    }
  }, [buildPayload, proyectoId, navigate, setEnviando, setEnviado, setErrorEnvio])

  const capitulos = getCapitulosDisponibles()
  const porcentajeGlobal = getPorcentajeCompletado()
  const totalRespondidas = Object.keys(respuestas).length
  const totalPreguntas = requisitos.length

  if (cargandoRequisitos) return <PageLoader text="Cargando cuestionario ISO 9001..." />
  if (errorRequisitos) return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <AlertError message={errorRequisitos} />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="btn-ghost mb-4 text-sm px-3 py-1.5"
        >
          <ArrowLeft size={14} />
          Volver al Dashboard
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-brand-400" />
              <span className="text-xs text-brand-400 font-mono tracking-wider uppercase">
                Diagnóstico ISO 9001:2015
              </span>
            </div>
            <h1 className="font-display text-3xl text-white">
              {proyectoActivo?.nombre_empresa || `Proyecto #${proyectoId}`}
            </h1>
          </div>

          {/* Global progress */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-4 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Progreso global</span>
              <span className="text-xs font-mono text-brand-400">
                {totalRespondidas}/{totalPreguntas}
              </span>
            </div>
            <ProgressBar value={porcentajeGlobal} size="lg" />
          </div>
        </div>
      </div>

      {errorEnvio && (
        <div className="mb-6">
          <AlertError message={errorEnvio} />
        </div>
      )}

      {/* ── Capítulos accordion ──────────────────────────────────────────────── */}
      <div className="space-y-3 mb-8">
        {capitulos.map((cap) => {
          const isOpen = capituloActual === cap
          const { total, respondidas } = getProgresoPorCapitulo(cap)
          const reqsCap = getRequisitosPorCapitulo(cap)
          const pctCap = total > 0 ? Math.round((respondidas / total) * 100) : 0
          const todoRespondido = respondidas === total && total > 0

          return (
            <div
              key={cap}
              className={`rounded-xl border transition-all duration-300 ${
                isOpen
                  ? 'border-brand-600/50 shadow-lg shadow-brand-900/20'
                  : 'border-surface-border hover:border-slate-600'
              } bg-surface-card overflow-hidden`}
            >
              {/* Accordion header */}
              <button
                onClick={() => setCapituloActual(isOpen ? null : cap)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-hover/30 transition"
              >
                {/* Numero capítulo */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm transition ${
                  todoRespondido
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-800/40'
                    : isOpen
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-800/40'
                    : 'bg-surface-hover text-slate-400'
                }`}>
                  {cap}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">
                    Cap. {cap} — {CAPITULOS_LABELS[cap]}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 max-w-[160px]">
                      <ProgressBar value={pctCap} showLabel={false} size="sm" />
                    </div>
                    <span className="text-xs text-slate-500">
                      {respondidas}/{total} respondidas
                    </span>
                  </div>
                </div>

                {todoRespondido && (
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                )}
                {isOpen ? (
                  <ChevronDown size={16} className="text-brand-400 flex-shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-slate-500 flex-shrink-0" />
                )}
              </button>

              {/* Accordion body */}
              {isOpen && (
                <div className="border-t border-surface-border">
                  <div className="p-5 space-y-6">
                    {reqsCap.map((req, idx) => (
                      <PreguntaItem
                        key={req.id}
                        req={req}
                        idx={idx}
                        respuesta={respuestas[req.id]}
                        onRespuesta={(cumple) => setRespuesta(req.id, cumple, respuestas[req.id]?.evidencia || '')}
                        onEvidencia={(ev) => setEvidencia(req.id, ev)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Footer actions ───────────────────────────────────────────────────── */}
      <div className="sticky bottom-6 flex justify-between items-center bg-surface-card border border-surface-border rounded-2xl p-4 shadow-2xl shadow-black/50">
        <div className="text-sm text-slate-400">
          <span className="text-white font-medium">{totalRespondidas}</span> de{' '}
          <span className="text-white font-medium">{totalPreguntas}</span> preguntas respondidas
          {totalRespondidas < totalPreguntas && (
            <span className="ml-2 text-amber-400 flex items-center gap-1 inline-flex">
              <AlertTriangle size={12} />
              Quedan {totalPreguntas - totalRespondidas} sin responder
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={enviando || totalRespondidas === 0}
            className="btn-primary"
          >
            {enviando ? (
              <>
                <Save size={15} className="animate-pulse" />
                Guardando...
              </>
            ) : (
              <>
                <Send size={15} />
                Guardar y Ver Resultados
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Pregunta Item ─────────────────────────────────────────────────────────────
function PreguntaItem({ req, idx, respuesta, onRespuesta, onEvidencia }) {
  const respondida = respuesta !== undefined
  const cumple = respuesta?.cumple

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        respondida
          ? cumple
            ? 'border-emerald-800/50 bg-emerald-950/20'
            : 'border-red-800/50 bg-red-950/20'
          : 'border-surface-border bg-surface-hover/20'
      }`}
    >
      {/* Numeral + pregunta */}
      <div className="flex gap-3 mb-3">
        <span className="font-mono text-xs text-brand-400 bg-brand-950/50 border border-brand-800/40 px-2 py-0.5 rounded-md h-fit flex-shrink-0 mt-0.5">
          {req.numeral}
        </span>
        <p className="text-sm text-slate-200 leading-relaxed">{req.pregunta_texto}</p>
      </div>

      {/* Ayuda */}
      {req.descripcion_ayuda && (
        <p className="text-xs text-slate-500 bg-surface-hover/50 rounded-lg px-3 py-2 mb-3 leading-relaxed">
          💡 {req.descripcion_ayuda}
        </p>
      )}

      {/* Radio buttons */}
      <div className="flex gap-3 mb-3">
        <RadioOption
          selected={respondida && cumple === true}
          onClick={() => onRespuesta(true)}
          icon={<CheckCircle2 size={15} />}
          label="Sí Cumple"
          colorClass="text-emerald-400 border-emerald-700 bg-emerald-950/50"
          activeClass="ring-1 ring-emerald-600"
        />
        <RadioOption
          selected={respondida && cumple === false}
          onClick={() => onRespuesta(false)}
          icon={<XCircle size={15} />}
          label="No Cumple"
          colorClass="text-red-400 border-red-700 bg-red-950/50"
          activeClass="ring-1 ring-red-600"
        />
      </div>

      {/* Evidencia textarea */}
      {respondida && (
        <div className="mt-2 animate-fade-in">
          <textarea
            value={respuesta?.evidencia || ''}
            onChange={(e) => onEvidencia(e.target.value)}
            placeholder="Describe la evidencia o hallazgo (opcional)..."
            rows={2}
            className="input-field text-xs resize-none"
          />
        </div>
      )}
    </div>
  )
}

function RadioOption({ selected, onClick, icon, label, colorClass, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium transition-all duration-150 ${
        selected
          ? `${colorClass} ${activeClass}`
          : 'border-surface-border text-slate-400 hover:border-slate-500 hover:text-slate-300'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

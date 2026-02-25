import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip, Legend
} from 'recharts'
import {
  ArrowLeft, TrendingUp, Award, AlertTriangle,
  CheckCircle2, XCircle, Target, BarChart3, ClipboardList
} from 'lucide-react'
import { diagnosticoAPI } from '../services/api'
import { PageLoader, AlertError, ProgressBar } from '../components/UI'

// ── Color helpers ─────────────────────────────────────────────────────────────
function getColorClass(pct) {
  if (pct >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Conforme', icon: CheckCircle2 }
  if (pct >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500', label: 'En Proceso', icon: AlertTriangle }
  return { text: 'text-red-400', bg: 'bg-red-500', label: 'Brecha Crítica', icon: XCircle }
}

function getNivelMadurez(pct) {
  if (pct >= 90) return { nivel: 'Optimizado', descripcion: 'SGC maduro, en mejora continua', color: 'text-emerald-300' }
  if (pct >= 70) return { nivel: 'Gestionado', descripcion: 'Procesos controlados con métricas', color: 'text-blue-300' }
  if (pct >= 50) return { nivel: 'Definido', descripcion: 'Procesos documentados pero no medidos', color: 'text-amber-300' }
  if (pct >= 30) return { nivel: 'Repetible', descripcion: 'Prácticas ad-hoc, sin estandarizar', color: 'text-orange-300' }
  return { nivel: 'Inicial', descripcion: 'Sin sistema de gestión formal', color: 'text-red-300' }
}

// ── Custom Radar Tooltip ──────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const { text, label } = getColorClass(item.value)
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-3 shadow-xl text-xs">
      <p className="font-medium text-white mb-1">{item.payload.subject}</p>
      <p className={`font-bold text-lg ${text}`}>{item.value.toFixed(1)}%</p>
      <p className={`${text} font-medium`}>{label}</p>
    </div>
  )
}

export default function ResultadosDiagnostico() {
  const { proyectoId } = useParams()
  const navigate = useNavigate()

  const [metricas, setMetricas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await diagnosticoAPI.obtenerMetricas(proyectoId)
      setMetricas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [proyectoId])

  if (loading) return <PageLoader text="Calculando métricas de diagnóstico..." />
  if (error) return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <AlertError message={error} onRetry={cargar} />
    </div>
  )
  if (!metricas) return null

  const radarData = metricas.capitulos.map((c) => ({
    subject: `Cap. ${c.capitulo}`,
    label: c.nombre_capitulo,
    value: c.porcentaje_cumplimiento,
    fullMark: 100,
  }))

  const madurez = getNivelMadurez(metricas.porcentaje_global)
  const conformes = metricas.capitulos.filter((c) => c.porcentaje_cumplimiento >= 80).length
  const brechas = metricas.capitulos.filter((c) => c.porcentaje_cumplimiento < 50).length

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <button onClick={() => navigate('/')} className="btn-ghost mb-4 text-sm px-3 py-1.5">
          <ArrowLeft size={14} />
          Volver al Dashboard
        </button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={16} className="text-brand-400" />
              <span className="text-xs text-brand-400 font-mono tracking-wider uppercase">
                Resultados del Diagnóstico
              </span>
            </div>
            <h1 className="font-display text-3xl text-white">{metricas.nombre_empresa}</h1>
            <p className="text-slate-400 text-sm mt-1">
              Análisis de brecha ISO 9001:2015 — {metricas.total_preguntas} criterios evaluados
            </p>
          </div>
          <button
            onClick={() => navigate(`/diagnostico/${proyectoId}`)}
            className="btn-ghost text-sm"
          >
            <ClipboardList size={14} />
            Editar Respuestas
          </button>
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Cumplimiento global */}
        <div className="card lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-brand-400" />
            <span className="text-xs text-slate-400">Cumplimiento Global</span>
          </div>
          <p className={`text-4xl font-bold font-mono ${getColorClass(metricas.porcentaje_global).text}`}>
            {metricas.porcentaje_global.toFixed(1)}%
          </p>
          <p className={`text-xs mt-1 ${madurez.color}`}>{madurez.nivel}</p>
        </div>

        {/* Nivel madurez */}
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Award size={14} className="text-amber-400" />
            <span className="text-xs text-slate-400">Nivel de Madurez</span>
          </div>
          <p className={`text-lg font-bold ${madurez.color}`}>{madurez.nivel}</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{madurez.descripcion}</p>
        </div>

        {/* Capítulos conformes */}
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-xs text-slate-400">Capítulos Conformes</span>
          </div>
          <p className="text-4xl font-bold font-mono text-emerald-400">{conformes}</p>
          <p className="text-xs text-slate-500 mt-1">≥ 80% de cumplimiento</p>
        </div>

        {/* Brechas críticas */}
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-red-400" />
            <span className="text-xs text-slate-400">Brechas Críticas</span>
          </div>
          <p className="text-4xl font-bold font-mono text-red-400">{brechas}</p>
          <p className="text-xs text-slate-500 mt-1">&lt; 50% de cumplimiento</p>
        </div>
      </div>

      {/* ── Main content: Radar + Barras ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Radar chart */}
        <div className="card">
          <h2 className="font-semibold text-white mb-1">Perfil de Madurez ISO</h2>
          <p className="text-xs text-slate-500 mb-5">Cumplimiento por capítulo de la norma</p>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'DM Sans' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickCount={6}
                tickFormatter={(v) => `${v}%`}
              />
              <Radar
                name="Cumplimiento"
                dataKey="value"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', r: 4, strokeWidth: 0 }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Barras por capítulo */}
        <div className="card">
          <h2 className="font-semibold text-white mb-1">Detalle por Capítulo</h2>
          <p className="text-xs text-slate-500 mb-5">Análisis de brecha individual</p>
          <div className="space-y-5">
            {metricas.capitulos.map((c) => {
              const { text, label, icon: Icon } = getColorClass(c.porcentaje_cumplimiento)
              return (
                <div key={c.capitulo}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-brand-400 w-5">{c.capitulo}</span>
                      <span className="text-sm text-slate-300 truncate max-w-[160px]">
                        {c.nombre_capitulo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs ${text} font-medium hidden sm:block`}>{label}</span>
                      <Icon size={13} className={text} />
                      <span className={`font-mono text-sm font-bold ${text} min-w-[42px] text-right`}>
                        {c.porcentaje_cumplimiento.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar value={c.porcentaje_cumplimiento} showLabel={false} size="md" />
                  <p className="text-xs text-slate-600 mt-1">
                    {c.respuestas_afirmativas}/{c.total_preguntas} criterios cumplidos
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tabla detalle ────────────────────────────────────────────────────── */}
      <div className="card">
        <h2 className="font-semibold text-white mb-1">Resumen Ejecutivo</h2>
        <p className="text-xs text-slate-500 mb-5">
          Tabla de brechas para informe de consultoría
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Cap.</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Cláusula</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Cumple</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">%</th>
                <th className="text-center py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {metricas.capitulos.map((c) => {
                const { text, label, bg } = getColorClass(c.porcentaje_cumplimiento)
                return (
                  <tr key={c.capitulo} className="hover:bg-surface-hover/30 transition">
                    <td className="py-3 px-2 font-mono text-xs text-brand-400">{c.capitulo}</td>
                    <td className="py-3 px-2 text-slate-300">{c.nombre_capitulo}</td>
                    <td className="py-3 px-2 text-right text-slate-300 font-mono">{c.respuestas_afirmativas}</td>
                    <td className="py-3 px-2 text-right text-slate-500 font-mono">{c.total_preguntas}</td>
                    <td className={`py-3 px-2 text-right font-mono font-bold ${text}`}>
                      {c.porcentaje_cumplimiento.toFixed(1)}%
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${text} bg-current/10`}
                        style={{ backgroundColor: `${getTagBg(c.porcentaje_cumplimiento)}` }}>
                        {label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-surface-border bg-surface-hover/20">
                <td colSpan={2} className="py-3 px-2 font-semibold text-white text-xs uppercase">
                  Total General
                </td>
                <td className="py-3 px-2 text-right font-mono font-bold text-white">
                  {metricas.total_afirmativas}
                </td>
                <td className="py-3 px-2 text-right font-mono font-bold text-slate-300">
                  {metricas.total_preguntas}
                </td>
                <td className={`py-3 px-2 text-right font-mono font-bold ${getColorClass(metricas.porcentaje_global).text}`}>
                  {metricas.porcentaje_global.toFixed(1)}%
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Leyenda ──────────────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          Conforme ≥ 80%
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          En Proceso 50–79%
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          Brecha Crítica &lt; 50%
        </div>
      </div>
    </div>
  )
}

function getTagBg(pct) {
  if (pct >= 80) return 'rgba(5,150,105,0.15)'
  if (pct >= 50) return 'rgba(217,119,6,0.15)'
  return 'rgba(220,38,38,0.15)'
}

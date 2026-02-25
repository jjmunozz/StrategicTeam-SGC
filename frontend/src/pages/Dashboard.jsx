import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, ClipboardList, ArrowRight, Building2,
  Calendar, ChevronRight, Sparkles, BarChart3,
  CheckCircle2, Trash2
} from 'lucide-react'
import { proyectosAPI } from '../services/api'
import useDiagnosticoStore from '../store/diagnosticoStore'
import ModalNuevoProyecto from '../components/ModalNuevoProyecto'
import { PageLoader, AlertError, EstadoBadge, EmptyState } from '../components/UI'

function formatDate(dateStr) {
  if (!dateStr) return 'Sin fecha';
  try {
    return new Intl.DateTimeFormat('es-CO', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export default function Dashboard() {

  const navigate = useNavigate()
  const { setProyectoActivo } = useDiagnosticoStore()

  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const cargarProyectos = async () => {
    setLoading(true)
    setError(null)
    try {
      // Nota: proyectosAPI.listar() ya devuelve la data segun tu api.js
      const response = await proyectosAPI.listar()
      setProyectos(response.data || response) 
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarProyectos()
  }, [])

  const handleIniciarDiagnostico = (proyecto) => {
    setProyectoActivo(proyecto)
    navigate(`/diagnostico/${proyecto.id}`)
  }

  const handleVerResultados = (proyecto) => {
    navigate(`/resultados/${proyecto.id}`)
  }

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.")) {
      try {
        await proyectosAPI.eliminar(id);
        cargarProyectos(); // Refrescar lista
      } catch (err) {
        alert("Error al eliminar: " + err.message);
      }
    }
  };

  const handleCompletar = async (id) => {
    try {
      await proyectosAPI.actualizar(id, { estado: 'COMPLETADO' });
      cargarProyectos(); // Refrescar lista
      alert("✅ ¡Proyecto marcado como completado!");
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    }
  };

  // ── Estadísticas rápidas ──────────────────────────────────────────────────
  const stats = {
    total: proyectos.length,
    pendientes: proyectos.filter((p) => p.estado === 'PENDIENTE').length,
    enDiagnostico: proyectos.filter((p) => p.estado === 'EN_DIAGNOSTICO').length,
    completados: proyectos.filter((p) => p.estado === 'COMPLETADO').length,
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl text-white mb-2">
            Panel de Proyectos
          </h1>
          <p className="text-slate-400 text-base">
            Gestiona los diagnósticos de madurez ISO 9001:2015 de tus clientes
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)} 
          className="group relative flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30 active:scale-95"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <Plus size={18} className="relative" />
          <span className="relative">Nuevo Proyecto</span>
        </button>

      </div>

      {/* ── Stats cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Proyectos', value: stats.total, color: 'text-blue-400', bg: 'bg-blue-600/10' },
          { label: 'Pendientes', value: stats.pendientes, color: 'text-slate-400', bg: 'bg-slate-600/10' },
          { label: 'En Diagnóstico', value: stats.enDiagnostico, color: 'text-amber-400', bg: 'bg-amber-600/10' },
          { label: 'Completados', value: stats.completados, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <BarChart3 size={18} className={stat.color} />
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <AlertError message={error} onRetry={cargarProyectos} />
      ) : proyectos.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin proyectos aún"
          description="Crea tu primer proyecto para comenzar un diagnóstico ISO 9001"
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary mt-2">
              <Plus size={15} />
              Crear primer proyecto
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {proyectos.map((proyecto, idx) => (
            <ProyectoCard
              key={proyecto.id}
              proyecto={proyecto}
              idx={idx}
              onIniciar={handleIniciarDiagnostico}
              onVerResultados={handleVerResultados}
              onEliminar={handleEliminar}   // <--- ¡IMPORTANTE!
              onCompletar={handleCompletar} // <--- ¡IMPORTANTE!
            />
          ))}

        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {showModal && (
        <ModalNuevoProyecto
          onClose={() => setShowModal(false)}
          onProyectoCreado={cargarProyectos} 
        />
      )}
    </div>
  )
}

// ── Proyecto Card ─────────────────────────────────────────────────────────────
function ProyectoCard({ proyecto, idx, onIniciar, onVerResultados, onEliminar, onCompletar }) {
  const isCompletado = proyecto.estado === 'COMPLETADO'
  const isEnDiagnostico = proyecto.estado === 'EN_DIAGNOSTICO'

  return (
    <div 
      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all duration-300 group shadow-xl relative overflow-hidden"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      {/* Botón Eliminar (Visible al hacer hover) */}
      <button 
        onClick={() => onEliminar(proyecto.id)}
        className="absolute top-4 right-4 p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/50 rounded-lg border border-slate-800"
        title="Eliminar Proyecto"
      >
        <Trash2 size={16} /> 
      </button>

      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
          <Building2 size={20} className="text-blue-400" />
        </div>
        <EstadoBadge estado={proyecto.estado} />
      </div>

      <h3 className="font-semibold text-white text-lg leading-snug mb-1">
        {proyecto.nombre_empresa}
      </h3>
      
      <p className="text-slate-500 text-xs mb-3">
        {proyecto.sector || 'Sector no especificado'}
      </p>

      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-5">
        <Calendar size={12} />
        <span>Creado: {formatDate(proyecto.fecha_creacion)}</span>
      </div>

      <div className="border-t border-slate-800 my-4" />

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onIniciar(proyecto)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
        >
          {isEnDiagnostico ? (
            <><ClipboardList size={16} /> Continuar</>
          ) : (
            <><Sparkles size={16} /> Iniciar Diagnóstico</>
          )}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => onVerResultados(proyecto)}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl transition-colors text-xs"
          >
            <BarChart3 size={14} /> Resultados
          </button>
          
          {/* Solo mostrar botón finalizar si NO está completado */}
          {!isCompletado && (
            <button
              onClick={() => onCompletar(proyecto.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-500 py-2 rounded-xl border border-emerald-500/20 transition-colors text-xs font-medium"
            >
              <CheckCircle2 size={14} /> Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
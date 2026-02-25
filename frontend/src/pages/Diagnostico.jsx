import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { diagnosticoAPI } from '../services/api';
import { PageLoader, AlertError } from '../components/UI';
import { CheckCircle2, XCircle, Save, ArrowLeft } from 'lucide-react';

export default function Diagnostico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requisitos, setRequisitos] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Cargamos los requisitos y las respuestas existentes en paralelo
        const [reqsRes, respuestasRes] = await Promise.all([
          diagnosticoAPI.listarRequisitos(),
          diagnosticoAPI.obtenerRespuestas(id)
        ]);

        const dataReqs = reqsRes.data || reqsRes;
        const dataRespuestas = respuestasRes.data || respuestasRes;

        setRequisitos(dataReqs);

        // 2. Mapeamos las respuestas guardadas al estado local
        const respuestasMap = {};
        dataRespuestas.forEach(r => {
          respuestasMap[r.requisito_id] = {
            requisito_id: r.requisito_id,
            cumple: r.cumple,
            evidencia: r.evidencia || ""
          };
        });
        setRespuestas(respuestasMap);

      } catch (err) {
        console.error("Error cargando diagnóstico:", err);
        setError("No se pudieron cargar los datos del diagnóstico.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleRespuesta = (reqId, cumple) => {
    setRespuestas(prev => ({
      ...prev,
      [reqId]: { ...prev[reqId], cumple, requisito_id: reqId }
    }));
  };

  const guardarDiagnostico = async () => {
    const totalRespuestas = Object.keys(respuestas).length;
    if (totalRespuestas === 0) {
      alert("Marca al menos una respuesta antes de guardar.");
      return;
    }

    setGuardando(true);
    try {
      // Formateamos el payload para el Backend
      const payload = {
        proyecto_id: parseInt(id),
        respuestas: Object.values(respuestas).map(r => ({
          requisito_id: parseInt(r.requisito_id),
          cumple: r.cumple,
          evidencia: r.evidencia || ""
        }))
      };

      await diagnosticoAPI.guardarRespuestas(payload);
      alert("✅ ¡Progreso guardado con éxito!");
      
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("❌ Error al guardar: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <PageLoader text="Cargando cuestionario ISO 9001..." />;
  if (error) return <AlertError message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
      {/* Botón Volver corregido a la raíz */}
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Volver al Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Evaluación ISO 9001:2015</h1>
          <p className="text-slate-400 mt-1">Proyecto ID: {id} — Ciclo PHVA</p>
        </div>
        
        <button 
          onClick={guardarDiagnostico}
          disabled={guardando}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
        >
          {guardando ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {guardando ? 'Guardando...' : 'Guardar Progreso'}
        </button>
      </div>

      <div className="space-y-6">
        {requisitos.map((req) => (
          <div key={req.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <span className="inline-block bg-blue-600/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded border border-blue-500/20 mb-2 uppercase tracking-widest">
                  Capítulo {req.capitulo} • {req.numeral}
                </span>
                <p className="text-white text-lg font-medium leading-relaxed">{req.pregunta_texto}</p>
                {req.descripcion_ayuda && (
                  <p className="text-slate-500 text-sm mt-2 italic bg-slate-800/30 p-2 rounded border-l-2 border-slate-700">
                    {req.descripcion_ayuda}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 self-start md:self-center">
                <button 
                  onClick={() => handleRespuesta(req.id, true)}
                  title="Cumple"
                  className={`p-3 rounded-xl border transition-all ${
                    respuestas[req.id]?.cumple === true 
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-500 shadow-inner' 
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  <CheckCircle2 size={24} />
                </button>
                <button 
                  onClick={() => handleRespuesta(req.id, false)}
                  title="No Cumple"
                  className={`p-3 rounded-xl border transition-all ${
                    respuestas[req.id]?.cumple === false 
                    ? 'bg-rose-600/20 border-rose-500 text-rose-500 shadow-inner' 
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Evidencia / Observaciones</label>
              <textarea 
                placeholder="Describa el hallazgo o documento que soporta el cumplimiento..."
                value={respuestas[req.id]?.evidencia || ""}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl mt-1 p-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all min-h-[80px]"
                onChange={(e) => setRespuestas(prev => ({
                  ...prev,
                  [req.id]: { ...prev[req.id], evidencia: e.target.value, requisito_id: req.id }
                }))}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
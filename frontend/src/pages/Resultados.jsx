import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { diagnosticoAPI } from '../services/api';
import { PageLoader, AlertError } from '../components/UI';
import { ArrowLeft, Download, Award, Target, AlertTriangle } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';

export default function Resultados() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        const res = await diagnosticoAPI.obtenerMetricas(id);
        setMetricas(res.data || res);
      } catch (err) {
        console.error("Error al obtener métricas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetricas();
  }, [id]);

  if (loading) return <PageLoader text="Calculando indicadores de cumplimiento..." />;
  if (!metricas) return <AlertError message="No se encontraron datos para este proyecto." />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
        <ArrowLeft size={16} /> Volver al Dashboard
      </button>

      <div className="flex justify-between items-end mb-10">
        <div>
          <span className="text-blue-400 font-bold tracking-widest text-xs uppercase">Reporte de Madurez</span>
          <h1 className="text-4xl font-bold text-white mt-1">{metricas.nombre_empresa}</h1>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-sm mb-1">Cumplimiento Global</p>
          <p className={`text-5xl font-black ${metricas.porcentaje_global >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {metricas.porcentaje_global}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Gráfico de Radar */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl h-[400px]">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Target size={18} className="text-blue-400" /> Perfil de Cumplimiento ISO 9001
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metricas.capitulos}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="nombre_capitulo" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Cumplimiento %"
                dataKey="porcentaje_cumplimiento"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Resumen por Capítulos */}
        <div className="space-y-4">
          {metricas.capitulos.map((cap) => (
            <div key={cap.capitulo} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Capítulo {cap.capitulo}</p>
                <p className="text-white font-medium">{cap.nombre_capitulo}</p>
              </div>
              <div className="text-right">
                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div 
                    className={`h-full transition-all duration-1000 ${cap.porcentaje_cumplimiento >= 70 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                    style={{ width: `${cap.porcentaje_cumplimiento}%` }} 
                  />
                </div>
                <p className="text-sm font-bold text-white">{cap.porcentaje_cumplimiento}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
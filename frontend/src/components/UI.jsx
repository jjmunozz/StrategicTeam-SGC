import React from 'react';

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <p className="text-slate-400 animate-pulse">Cargando datos del sistema...</p>
  </div>
);

export const AlertError = ({ message }) => (
  <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl mb-6">
    <div className="flex items-center gap-3 text-red-400">
      <span className="text-xl">⚠️</span>
      <p className="font-medium">{message || 'Ha ocurrido un error inesperado'}</p>
    </div>
  </div>
);

export const EstadoBadge = ({ estado }) => {
  const estilos = {
    'Pendiente': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'En Progreso': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Completado': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Error': 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${estilos[estado] || estilos['Pendiente']}`}>
      {estado}
    </span>
  );
};

export const EmptyState = ({ title, description }) => (
  <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
    <div className="text-4xl mb-4">📂</div>
    <h3 className="text-white font-medium text-lg">{title}</h3>
    <p className="text-slate-500 mt-1">{description}</p>
  </div>
);
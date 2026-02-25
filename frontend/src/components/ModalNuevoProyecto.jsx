import React, { useState } from 'react';
import { proyectosAPI } from '../services/api';

export default function ModalNuevoProyecto({ onClose, onProyectoCreado }) {
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    sector: '',
    contacto_nombre: '',
    contacto_email: ''
  });
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await proyectosAPI.crear(formData);
      onProyectoCreado(); // Esta función refrescará el Dashboard
      onClose();
    } catch (error) {
      alert("Error al crear: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">🚀 Nuevo Proyecto SGC</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nombre de la Empresa</label>
            <input 
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, nombre_empresa: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Sector</label>
              <input 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                onChange={(e) => setFormData({...formData, sector: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Contacto</label>
              <input 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                onChange={(e) => setFormData({...formData, contacto_nombre: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input 
              type="email"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
              onChange={(e) => setFormData({...formData, contacto_email: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={cargando}
              className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
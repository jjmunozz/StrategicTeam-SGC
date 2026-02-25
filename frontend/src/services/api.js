import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Request interceptor ────────────────────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// ─── Response interceptor ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Error de red'
    return Promise.reject(new Error(message))
  }
)

// ─── Proyectos ──────────────────────────────────────────────────
export const proyectosAPI = {
  listar: () => api.get('/proyectos/'),
  obtener: (id) => api.get(`/proyectos/${id}`),
  crear: (data) => api.post('/proyectos/', data),
  actualizar: (id, data) => api.put(`/proyectos/${id}`, data),
  eliminar: (id) => api.delete(`/proyectos/${id}`),
}

// ─── Diagnóstico ────────────────────────────────────────────────
export const diagnosticoAPI = {
  listarRequisitos: () => api.get('/diagnostico/requisitos'),
  guardarRespuestas: (data) => api.post('/diagnostico/respuestas/', data),
  obtenerRespuestas: (proyectoId) => api.get(`/diagnostico/${proyectoId}/respuestas`),
  obtenerMetricas: (proyectoId) => api.get(`/diagnostico/${proyectoId}/metricas`),
}

export default api

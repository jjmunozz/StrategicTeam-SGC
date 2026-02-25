import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Store de Zustand para el cuestionario de diagnóstico ISO 9001.
 * Persiste en sessionStorage para sobrevivir navegación entre capítulos.
 */
const useDiagnosticoStore = create(
  persist(
    (set, get) => ({
      // ── Estado del proyecto activo ────────────────────────────
      proyectoActivo: null,           // { id, nombre_empresa, ... }
      capituloActual: 4,             // Capítulo ISO activo (4-10)

      // ── Respuestas: { [requisito_id]: { cumple: bool, evidencia: string } } ──
      respuestas: {},

      // ── Requisitos cargados desde el backend ──────────────────
      requisitos: [],                 // Array de RequisitoOut
      cargandoRequisitos: false,
      errorRequisitos: null,

      // ── Estado de envío ───────────────────────────────────────
      enviando: false,
      enviado: false,
      errorEnvio: null,

      // ─── Acciones ─────────────────────────────────────────────
      setProyectoActivo: (proyecto) =>
        set({ proyectoActivo: proyecto, capituloActual: 4, enviado: false, errorEnvio: null }),

      setCapituloActual: (capitulo) => set({ capituloActual: capitulo }),

      setRespuesta: (requisitoId, cumple, evidencia = '') =>
        set((state) => ({
          respuestas: {
            ...state.respuestas,
            [requisitoId]: { cumple, evidencia },
          },
        })),

      setEvidencia: (requisitoId, evidencia) =>
        set((state) => ({
          respuestas: {
            ...state.respuestas,
            [requisitoId]: {
              ...state.respuestas[requisitoId],
              evidencia,
            },
          },
        })),

      setRequisitos: (requisitos) => set({ requisitos }),
      setCargandoRequisitos: (val) => set({ cargandoRequisitos: val }),
      setErrorRequisitos: (err) => set({ errorRequisitos: err }),

      setEnviando: (val) => set({ enviando: val }),
      setEnviado: (val) => set({ enviado: val }),
      setErrorEnvio: (err) => set({ errorEnvio: err }),

      // ── Getters derivados ──────────────────────────────────────
      getRequisitosPorCapitulo: (capitulo) =>
        get().requisitos.filter((r) => r.capitulo === capitulo),

      getCapitulosDisponibles: () =>
        [...new Set(get().requisitos.map((r) => r.capitulo))].sort(),

      getTotalRespondidas: () => Object.keys(get().respuestas).length,

      getProgresoPorCapitulo: (capitulo) => {
        const reqs = get().getRequisitosPorCapitulo(capitulo)
        const respondidas = reqs.filter((r) => get().respuestas[r.id] !== undefined).length
        return { total: reqs.length, respondidas }
      },

      getPorcentajeCompletado: () => {
        const total = get().requisitos.length
        if (total === 0) return 0
        const respondidas = get().getTotalRespondidas()
        return Math.round((respondidas / total) * 100)
      },

      // ── Preparar payload para el backend ──────────────────────
      buildPayload: () => {
        const { proyectoActivo, respuestas } = get()
        return {
          proyecto_id: proyectoActivo.id,
          respuestas: Object.entries(respuestas).map(([id, val]) => ({
            requisito_id: parseInt(id, 10),
            cumple: val.cumple,
            evidencia: val.evidencia || null,
          })),
        }
      },

      // ── Reset del store ───────────────────────────────────────
      resetDiagnostico: () =>
        set({
          respuestas: {},
          capituloActual: 4,
          enviando: false,
          enviado: false,
          errorEnvio: null,
        }),

      resetCompleto: () =>
        set({
          proyectoActivo: null,
          capituloActual: 4,
          respuestas: {},
          requisitos: [],
          cargandoRequisitos: false,
          errorRequisitos: null,
          enviando: false,
          enviado: false,
          errorEnvio: null,
        }),
    }),
    {
      name: 'sgc-diagnostico',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        proyectoActivo: state.proyectoActivo,
        respuestas: state.respuestas,
        capituloActual: state.capituloActual,
      }),
    }
  )
)

export default useDiagnosticoStore

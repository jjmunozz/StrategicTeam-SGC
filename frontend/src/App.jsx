import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Diagnostico from './pages/Diagnostico'
import Resultados from './pages/Resultados' 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white">
        <Routes>
          {/* Ruta principal: El Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Nueva Ruta: El cuestionario de diagnóstico por ID */}
          <Route path="/diagnostico/:id" element={<Diagnostico />} />

          <Route path="/resultados/:id" element={<Resultados />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
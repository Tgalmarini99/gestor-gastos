import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Goals from './pages/Goals'
import Tracking from './pages/Tracking'
import Settings from './pages/Settings'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/gastos" element={<Expenses />} />
          <Route path="/objetivos" element={<Goals />} />
          <Route path="/analisis" element={<Tracking />} />
          <Route path="/configuracion" element={<Settings />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

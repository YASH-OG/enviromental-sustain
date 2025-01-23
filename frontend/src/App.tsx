import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

// Lazy load pages
import EcoWellness from './pages/EcoWellness'
import AgriVision from './pages/AgriVision'
import EcoImpact from './pages/EcoImpact'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<EcoWellness />} />
          <Route path="/agri-vision" element={<AgriVision />} />
          <Route path="/eco-impact" element={<EcoImpact />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

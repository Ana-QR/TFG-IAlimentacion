import Navbar from './components/layout/Navbar';
import Layout from './components/layout/Layout';
import ListaCompra from './pages/ListaCompra';
import Recetas from './pages/Recetas';
import Recomendaciones from './pages/Recomendaciones';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';

function App() {
  return (
    <Router>
      <div>
        <Layout>
        <Routes>
          <Route path="/" element={<ListaCompra />} />
          <Route path="/lista-compra" element={<ListaCompra />} />
          <Route path="/recetas" element={<Recetas />} />
          <Route path="/recomendaciones" element={<Recomendaciones />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/historial" element={<Perfil />} /> {/* Asumiendo que Perfil maneja el historial */}
          
          {/* ... otras rutas ... */}
        </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
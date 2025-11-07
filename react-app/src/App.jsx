import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store/store';
import AdminPage from './pages/AdminPage';
import CocinaPage from './pages/CocinaPage';
import MeseroPage from './pages/MeseroPage';
import './index.css';

function App() {
  const cargarProductos = useStore((state) => state.cargarProductos);

  useEffect(() => {
    cargarProductos();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/cocina" element={<CocinaPage />} />
        <Route path="/mesero" element={<MeseroPage />} />
        <Route path="/" element={<MeseroPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

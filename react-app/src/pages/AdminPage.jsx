import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import * as api from '../modules/api';

export default function AdminPage() {
  const productos = useStore((state) => state.productos);
  const setProductos = useStore((state) => state.setProductos);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: '' });

  useEffect(() => {
    api.getProductos().then(setProductos);
  }, []);

  const handleGuardar = async () => {
    try {
      if (editando) {
        await api.updateProducto(editando._id, form);
      } else {
        await api.createProducto(form);
      }
      const updated = await api.getProductos();
      setProductos(updated);
      setForm({ nombre: '', precio: '', categoria: '' });
      setEditando(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Eliminar producto?')) {
      try {
        await api.deleteProducto(id);
        const updated = await api.getProductos();
        setProductos(updated);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>👨‍💼 Admin - Gestión de Productos</h1>
      </header>

      <section>
        <h2>Nuevo Producto</h2>
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej: Ceviche"
          />
        </div>
        <div className="form-group">
          <label>Precio</label>
          <input
            type="number"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            placeholder="0"
          />
        </div>
        <div className="form-group">
          <label>Categoría</label>
          <input
            type="text"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            placeholder="Entrada"
          />
        </div>
        <button className="btn btn-success" onClick={handleGuardar}>
          {editando ? '✏️ Guardar Cambios' : '➕ Crear Producto'}
        </button>
      </section>

      <section>
        <h2>Productos ({productos.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p._id}>
                <td>{p.nombre}</td>
                <td>S/. {p.precio}</td>
                <td>{p.categoria}</td>
                <td>
                  <button
                    className="btn btn-pequeño"
                    onClick={() => {
                      setEditando(p);
                      setForm(p);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-danger btn-pequeño"
                    onClick={() => handleEliminar(p._id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

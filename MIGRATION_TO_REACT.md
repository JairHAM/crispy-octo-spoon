# 🚀 GUÍA: MIGRAR A REACT

**Objetivo:** Convertir esta arquitectura modular a React manteniendo toda la lógica existente

---

## 📋 Estrategia de Migración

### Fase 1: Setup React (1 hora)

```bash
# Crear proyecto Vite + React
npm create vite@latest restaurant-pos -- --template react
cd restaurant-pos
npm install

# Instalar dependencias mínimas
npm install react-router-dom zustand
```

### Fase 2: Migrar Módulos (2 horas)

**Los 4 módulos existentes SE REUTILIZAN SIN CAMBIOS:**

```javascript
// ✅ Estos archivos copian tal cual
src/modules/
├── api.js       ← Copiar tal cual (sin cambios)
├── state.js     ← Refactorizar a Zustand hooks
├── ui.js        ← Algunos como utilidades, algunos como componentes
└── audio.js     ← Copiar tal cual (sin cambios)
```

### Fase 3: Convertir Páginas a Componentes (3 horas)

```javascript
// admin.js → src/pages/AdminPage.jsx
export function AdminPage() {
  const [productos, setProductos] = useState([]);
  
  useEffect(() => {
    adminModule.init();
  }, []);
  
  return (
    // HTML + lógica de admin.js aquí
  );
}

// cocina.js → src/pages/CocinaPage.jsx
// mesero.js → src/pages/MeseroPage.jsx
```

---

## 🔄 Paso a Paso: Migración Detallada

### 1. Crear Proyecto React

```bash
npm create vite@latest restaurant-pos -- --template react
cd restaurant-pos
npm install
npm install react-router-dom zustand
```

### 2. Copiar Archivos Base

```bash
# Copiar módulos (sin cambios)
cp -r ../web/src/modules/* src/modules/

# Copiar estilos
cp ../web/src/styles.css src/styles.css

# Copiar assets (si existen)
cp -r ../web/src/assets/* src/assets/
```

### 3. Refactorizar State con Zustand

**Antes (state.js vanilla):**
```javascript
const state = {
  productos: [],
  pedidos: [],
  carrito: {},
};

function setProductos(data) {
  state.productos = data;
}
```

**Después (Zustand hook):**
```javascript
// src/store/restaurantStore.js
import { create } from 'zustand';
import * as apiModule from '../modules/api';

export const useRestaurantStore = create((set) => ({
  productos: [],
  pedidos: [],
  carrito: {},
  
  setProductos: (data) => set({ productos: data }),
  setPedidos: (data) => set({ pedidos: data }),
  
  agregarAlCarrito: (producto, cantidad) => 
    set((state) => ({
      carrito: {
        ...state.carrito,
        [producto.id]: cantidad
      }
    })),
}));
```

### 4. Crear Componentes Reutilizables

```javascript
// src/components/ProductCard.jsx
export function ProductCard({ producto, onSelect }) {
  return (
    <div className="producto-card">
      <h3>{producto.nombre}</h3>
      <p className="precio">${producto.precio}</p>
      <button onClick={() => onSelect(producto)}>
        Seleccionar
      </button>
    </div>
  );
}

// src/components/PedidoColumn.jsx
export function PedidoColumn({ titulo, pedidos, onEstadoChange }) {
  return (
    <div className="pedido-column">
      <h2>{titulo}</h2>
      {pedidos.map(p => (
        <PedidoCard 
          key={p.id} 
          pedido={p}
          onEstadoChange={onEstadoChange}
        />
      ))}
    </div>
  );
}
```

### 5. Convertir Página Admin

**Antes (admin.js vanilla):**
```javascript
function cargarProductos() {
  api.getProductos().then(data => {
    state.setProductos(data);
    renderizar();
  });
}

function renderizar() {
  container.innerHTML = productos.map(p => `
    <tr>
      <td>${p.nombre}</td>
      <td>$${p.precio}</td>
      <td><button onclick="editar(${p.id})">Editar</button></td>
    </tr>
  `).join('');
}
```

**Después (React componente):**
```javascript
// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { useRestaurantStore } from '../store/restaurantStore';
import { ProductCard } from '../components/ProductCard';
import * as api from '../modules/api';

export function AdminPage() {
  const { productos, setProductos } = useRestaurantStore();
  const [editando, setEditando] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({});

  useEffect(() => {
    // Cargar productos al montar
    api.getProductos().then(setProductos);
  }, []);

  const handleGuardar = async (producto) => {
    await api.updateProducto(producto.id, producto);
    const updated = await api.getProductos();
    setProductos(updated);
    setEditando(null);
  };

  return (
    <div className="admin-page">
      <h1>Panel de Administrador</h1>
      
      <section className="formulario">
        <h2>Nuevo Producto</h2>
        <input 
          placeholder="Nombre"
          value={nuevoProducto.nombre || ''}
          onChange={(e) => setNuevoProducto({
            ...nuevoProducto, 
            nombre: e.target.value
          })}
        />
        <button onClick={async () => {
          await api.createProducto(nuevoProducto);
          setNuevoProducto({});
          const updated = await api.getProductos();
          setProductos(updated);
        }}>
          Crear
        </button>
      </section>

      <section className="tabla">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>${p.precio}</td>
                <td>
                  <button onClick={() => setEditando(p)}>Editar</button>
                  <button onClick={async () => {
                    await api.deleteProducto(p.id);
                    const updated = await api.getProductos();
                    setProductos(updated);
                  }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {editando && (
        <EditModal 
          producto={editando}
          onGuardar={handleGuardar}
          onCerrar={() => setEditando(null)}
        />
      )}
    </div>
  );
}
```

### 6. Convertir Página Cocina

```javascript
// src/pages/CocinaPage.jsx
import { useState, useEffect } from 'react';
import { useRestaurantStore } from '../store/restaurantStore';
import { PedidoColumn } from '../components/PedidoColumn';
import * as api from '../modules/api';
import * as audioModule from '../modules/audio';

export function CocinaPage() {
  const store = useRestaurantStore();
  const [pedidos, setPedidos] = useState([]);
  const [audioHabilitado, setAudioHabilitado] = useState(true);

  useEffect(() => {
    audioModule.init();
    // Polling de pedidos
    const interval = setInterval(async () => {
      const data = await api.getPedidos();
      setPedidos(data);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCambiarEstado = async (pedido, nuevoEstado) => {
    await api.updatePedidoEstado(pedido.id, nuevoEstado);
    
    // Reproducir sonido si está habilitado
    if (audioHabilitado) {
      if (nuevoEstado === 'PREPARANDO') {
        await audioModule.sonidoExito();
      } else if (nuevoEstado === 'LISTOS') {
        await audioModule.sonidoListoUrgente();
      }
    }

    // Actualizar estado
    const updated = await api.getPedidos();
    setPedidos(updated);
  };

  const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE');
  const preparando = pedidos.filter(p => p.estado === 'PREPARANDO');
  const listos = pedidos.filter(p => p.estado === 'LISTOS');

  return (
    <div className="cocina-page">
      <header className="cocina-header">
        <h1>👨‍🍳 Cocina</h1>
        <button 
          className={`btn-audio ${audioHabilitado ? '' : 'disabled'}`}
          onClick={() => setAudioHabilitado(!audioHabilitado)}
        >
          🔊
        </button>
      </header>

      <div className="columnas">
        <PedidoColumn
          titulo="📋 Pendiente"
          pedidos={pendientes}
          onEstadoChange={(p) => handleCambiarEstado(p, 'PREPARANDO')}
        />
        <PedidoColumn
          titulo="👨‍🍳 Preparando"
          pedidos={preparando}
          onEstadoChange={(p) => handleCambiarEstado(p, 'LISTOS')}
        />
        <PedidoColumn
          titulo="✅ Listos"
          pedidos={listos}
          onEstadoChange={() => {}} // No hay transición
        />
      </div>
    </div>
  );
}
```

### 7. Convertir Página Mesero

```javascript
// src/pages/MeseroPage.jsx
import { useState, useEffect } from 'react';
import { useRestaurantStore } from '../store/restaurantStore';
import * as api from '../modules/api';

export function MeseroPage() {
  const store = useRestaurantStore();
  const [paso, setPaso] = useState('mesas'); // mesas → menu → carrito → monitoreo
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [carrito, setCarrito] = useState({});

  useEffect(() => {
    api.getProductos().then(store.setProductos);
  }, []);

  const total = Object.values(carrito).reduce((sum, item) => {
    const prod = store.productos.find(p => p.id === item.productoId);
    return sum + (prod?.precio || 0) * item.cantidad;
  }, 0);

  const renderPaso = () => {
    switch (paso) {
      case 'mesas':
        return (
          <div className="mesas-grid">
            {Array.from({ length: 20 }, (_, i) => i + 1).map(mesa => (
              <button
                key={mesa}
                className="mesa-btn"
                onClick={() => {
                  setMesaSeleccionada(mesa);
                  setPaso('menu');
                }}
              >
                Mesa {mesa}
              </button>
            ))}
          </div>
        );
      
      case 'menu':
        return (
          <div>
            <h2>Mesa {mesaSeleccionada} - Selecciona productos</h2>
            <div className="productos-grid">
              {store.productos.map(p => (
                <div key={p.id} className="producto">
                  <h3>{p.nombre}</h3>
                  <p>${p.precio}</p>
                  <button onClick={() => {
                    setCarrito({
                      ...carrito,
                      [p.id]: {
                        productoId: p.id,
                        cantidad: (carrito[p.id]?.cantidad || 0) + 1
                      }
                    });
                  }}>
                    Agregar
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setPaso('carrito')}>
              Ver Carrito ({Object.keys(carrito).length})
            </button>
          </div>
        );
      
      case 'carrito':
        return (
          <div className="carrito-view">
            <h2>Carrito - Mesa {mesaSeleccionada}</h2>
            {Object.entries(carrito).map(([prodId, item]) => {
              const prod = store.productos.find(p => p.id === parseInt(prodId));
              return (
                <div key={prodId} className="carrito-item">
                  <span>{prod?.nombre}</span>
                  <span>x{item.cantidad}</span>
                  <span>${(prod?.precio || 0) * item.cantidad}</span>
                </div>
              );
            })}
            <h3 className="total">Total: ${total}</h3>
            <button onClick={async () => {
              const pedido = {
                mesa: mesaSeleccionada,
                items: Object.values(carrito),
                total
              };
              await api.createPedido(pedido);
              setPaso('monitoreo');
            }}>
              Enviar Pedido
            </button>
          </div>
        );
    }
  };

  return (
    <div className="mesero-page">
      <header>
        <h1>🍽️ Punto de Venta</h1>
      </header>
      {renderPaso()}
    </div>
  );
}
```

### 8. Crear Router

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminPage } from './pages/AdminPage';
import { CocinaPage } from './pages/CocinaPage';
import { MeseroPage } from './pages/MeseroPage';
import './styles.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/cocina" element={<CocinaPage />} />
        <Route path="/mesero" element={<MeseroPage />} />
        <Route path="/" element={<MeseroPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## ✅ Checklist de Migración

- [ ] Crear proyecto React con Vite
- [ ] Copiar módulos (api.js, audio.js, ui.js)
- [ ] Crear Zustand store
- [ ] Convertir AdminPage
- [ ] Convertir CocinaPage
- [ ] Convertir MeseroPage
- [ ] Crear Router
- [ ] Copiar estilos CSS
- [ ] Probar flujo completo
- [ ] Deploy a Vercel/Netlify

---

## ⏱️ Tiempo Estimado

- Setup: 1 hora
- Módulos: 1 hora
- Componentes reutilizables: 1 hora
- AdminPage: 1 hora
- CocinaPage: 1 hora
- MeseroPage: 1.5 horas
- Testing y fixes: 1 hora

**Total: ~7.5 horas**

---

## 🎓 Beneficios de Esta Migración

✅ Mantiene toda la lógica existente  
✅ Reutiliza módulos sin cambios (api, audio)  
✅ Facilita mantenimiento futuro  
✅ Permite crecer: TypeScript, Tests, etc.  
✅ Compatible con ecosistema React (Redux, GraphQL, etc.)  

---

## 📚 Recursos Recomendados

- [React Docs](https://react.dev)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Router](https://reactrouter.com)
- [Vite](https://vitejs.dev)

---

*Guía de Migración a React - Proyecto POS Restaurant*

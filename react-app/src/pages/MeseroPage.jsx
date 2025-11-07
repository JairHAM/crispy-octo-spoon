import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { audioManager } from '../modules/audio';
import * as api from '../modules/api';

export default function MeseroPage() {
  const productos = useStore((state) => state.productos);
  const carrito = useStore((state) => state.carrito);
  const mesaSeleccionada = useStore((state) => state.mesaSeleccionada);
  const pedidos = useStore((state) => state.pedidos);

  const agregarAlCarrito = useStore((state) => state.agregarAlCarrito);
  const reducirDelCarrito = useStore((state) => state.reducirDelCarrito);
  const seleccionarMesa = useStore((state) => state.seleccionarMesa);
  const limpiarMesa = useStore((state) => state.limpiarMesa);
  const cargarProductos = useStore((state) => state.cargarProductos);
  const cargarPedidos = useStore((state) => state.cargarPedidos);
  const crearPedido = useStore((state) => state.crearPedido);
  const calcularTotalCarrito = useStore((state) => state.calcularTotalCarrito);
  const obtenerItemsCarrito = useStore((state) => state.obtenerItemsCarrito);

  const [paso, setPaso] = useState('mesas'); // mesas → menu → carrito → monitoreo
  const [audioHabilitado, setAudioHabilitado] = useState(true);

  useEffect(() => {
    audioManager.init();
    cargarProductos();
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSeleccionarMesa = (mesa) => {
    seleccionarMesa(mesa);
    setPaso('menu');
  };

  const handleEnviarPedido = async () => {
    try {
      const items = obtenerItemsCarrito();
      if (items.length === 0) {
        alert('El carrito está vacío');
        return;
      }

      const pedido = {
        mesa: mesaSeleccionada,
        items,
        total: calcularTotalCarrito()
      };

      await crearPedido(pedido);
      if (audioHabilitado) {
        await audioManager.sonidoExito();
      }
      limpiarMesa();
      setPaso('monitoreo');
    } catch (err) {
      alert('Error al crear pedido: ' + err.message);
    }
  };

  const mesa_items = pedidos.filter((p) => p.mesa === mesaSeleccionada);

  return (
    <div className="container">
      <header className="header">
        <h1>🍽️ Punto de Venta</h1>
        <button
          className={`btn-audio ${audioHabilitado ? '' : 'disabled'}`}
          onClick={() => setAudioHabilitado(!audioHabilitado)}
        >
          🔊
        </button>
      </header>

      {paso === 'mesas' && (
        <section>
          <h2>Selecciona una Mesa</h2>
          <div className="grid-mesas">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((mesa) => (
              <button
                key={mesa}
                className="mesa-btn"
                onClick={() => handleSeleccionarMesa(mesa)}
              >
                Mesa {mesa}
              </button>
            ))}
          </div>
        </section>
      )}

      {paso === 'menu' && (
        <section>
          <div className="menu-header">
            <button className="btn" onClick={() => setPaso('mesas')}>← Atrás</button>
            <h2>Mesa {mesaSeleccionada} - Menú</h2>
            <button className="btn btn-primary" onClick={() => setPaso('carrito')}>
              🛒 Carrito ({Object.keys(carrito).length})
            </button>
          </div>

          <div className="grid-productos">
            {productos.map((p) => (
              <div key={p._id} className="producto-item">
                <h4>{p.nombre}</h4>
                <small>{p.categoria}</small>
                <p>S/. {p.precio}</p>
                <div className="qty-control">
                  <button
                    className="btn btn-pequeño"
                    onClick={() => agregarAlCarrito(p._id)}
                  >
                    ➕
                  </button>
                  <span>{carrito[p._id] || 0}</span>
                  <button
                    className="btn btn-pequeño"
                    onClick={() => reducirDelCarrito(p._id)}
                  >
                    ➖
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {paso === 'carrito' && (
        <section>
          <div className="menu-header">
            <button className="btn" onClick={() => setPaso('menu')}>← Atrás</button>
            <h2>Carrito - Mesa {mesaSeleccionada}</h2>
          </div>

          <div className="carrito-items">
            {obtenerItemsCarrito().map((item) => (
              <div key={item.productoId} className="carrito-item">
                <div>
                  <strong>{item.nombre}</strong>
                  <small>
                    {item.cantidad}x S/. {item.precio} = S/. {item.subtotal}
                  </small>
                </div>
                <div>
                  <strong>S/. {item.subtotal}</strong>
                </div>
              </div>
            ))}

            {Object.keys(carrito).length === 0 ? (
              <div className="empty">Carrito vacío</div>
            ) : (
              <div className="carrito-total">
                <strong>Total: S/. {calcularTotalCarrito()}</strong>
              </div>
            )}
          </div>

          {Object.keys(carrito).length > 0 && (
            <button className="btn btn-success" onClick={handleEnviarPedido}>
              ✅ Enviar Pedido
            </button>
          )}
        </section>
      )}

      {paso === 'monitoreo' && (
        <section>
          <div className="menu-header">
            <button className="btn" onClick={() => setPaso('mesas')}>← Otra Mesa</button>
            <h2>Monitoreo - Mesa {mesaSeleccionada}</h2>
          </div>

          {mesa_items.length === 0 ? (
            <div className="empty">No hay pedidos para esta mesa</div>
          ) : (
            <div className="carrito-items">
              {mesa_items.map((p) => (
                <div key={p._id} className="pedido-card">
                  <div className="header">
                    <strong>Pedido #{p._id.slice(-4)}</strong>
                    <small>{p.estado}</small>
                  </div>
                  <div className="items">
                    {p.items.map((item, i) => (
                      <div key={i}>
                        {item.cantidad}x {item.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

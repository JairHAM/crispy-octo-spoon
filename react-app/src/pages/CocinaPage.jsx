import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { audioManager } from '../modules/audio';
import * as api from '../modules/api';

export default function CocinaPage() {
  const pedidos = useStore((state) => state.pedidos);
  const setPedidos = useStore((state) => state.setPedidos);
  const [audioHabilitado, setAudioHabilitado] = useState(true);

  useEffect(() => {
    audioManager.init();
    const interval = setInterval(async () => {
      const data = await api.getPedidos();
      setPedidos(data);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCambiarEstado = async (pedido, nuevoEstado) => {
    try {
      await api.updatePedidoEstado(pedido._id, nuevoEstado);
      if (audioHabilitado) {
        if (nuevoEstado === 'PREPARANDO') {
          await audioManager.sonidoExito();
        } else if (nuevoEstado === 'LISTOS') {
          await audioManager.sonidoListoUrgente();
        }
      }
      const updated = await api.getPedidos();
      setPedidos(updated);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const pendientes = pedidos.filter((p) => p.estado === 'PENDIENTE');
  const preparando = pedidos.filter((p) => p.estado === 'PREPARANDO');
  const listos = pedidos.filter((p) => p.estado === 'LISTOS');

  return (
    <div className="container">
      <header className="header">
        <h1>👨‍🍳 Cocina</h1>
        <button
          className={`btn-audio ${audioHabilitado ? '' : 'disabled'}`}
          onClick={() => setAudioHabilitado(!audioHabilitado)}
        >
          🔊
        </button>
      </header>

      <div className="grid-3cols">
        <section className="columna">
          <h2>📋 Pendiente ({pendientes.length})</h2>
          <div className="columna-contenido">
            {pendientes.length === 0 ? (
              <div className="empty">Sin pedidos pendientes</div>
            ) : (
              pendientes.map((p) => (
                <div key={p._id} className="pedido-card">
                  <div className="header">
                    <strong>Mesa {p.mesa}</strong>
                    <small>{new Date(p.createdAt).toLocaleTimeString()}</small>
                  </div>
                  <div className="items">
                    {p.items.map((item, i) => (
                      <div key={i}>
                        {item.cantidad}x {item.nombre}
                      </div>
                    ))}
                  </div>
                  <div className="botones">
                    <button
                      className="btn btn-primary btn-pequeño"
                      onClick={() => handleCambiarEstado(p, 'PREPARANDO')}
                    >
                      Preparando
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="columna">
          <h2>👨‍🍳 Preparando ({preparando.length})</h2>
          <div className="columna-contenido">
            {preparando.length === 0 ? (
              <div className="empty">Sin pedidos en preparación</div>
            ) : (
              preparando.map((p) => (
                <div key={p._id} className="pedido-card">
                  <div className="header">
                    <strong>Mesa {p.mesa}</strong>
                    <small>{new Date(p.createdAt).toLocaleTimeString()}</small>
                  </div>
                  <div className="items">
                    {p.items.map((item, i) => (
                      <div key={i}>
                        {item.cantidad}x {item.nombre}
                      </div>
                    ))}
                  </div>
                  <div className="botones">
                    <button
                      className="btn btn-success btn-pequeño"
                      onClick={() => handleCambiarEstado(p, 'LISTOS')}
                    >
                      ✅ Listo
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="columna">
          <h2>✅ Listos ({listos.length})</h2>
          <div className="columna-contenido">
            {listos.length === 0 ? (
              <div className="empty">Sin platos listos</div>
            ) : (
              listos.map((p) => (
                <div key={p._id} className="pedido-card">
                  <div className="header">
                    <strong>Mesa {p.mesa}</strong>
                    <small>{new Date(p.createdAt).toLocaleTimeString()}</small>
                  </div>
                  <div className="items">
                    {p.items.map((item, i) => (
                      <div key={i}>
                        {item.cantidad}x {item.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

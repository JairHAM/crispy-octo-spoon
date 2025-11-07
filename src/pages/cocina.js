/**
 * cocina.js - Interfaz de Cocina
 * Responsabilidad: Ver pedidos, cambiar estados, reproducir sonidos
 * 
 * Usa módulos:
 * - api.js → Llamadas HTTP
 * - ui.js → Funciones DOM
 * - audio.js → Sonidos
 * - state.js → Datos compartidos
 */

import { getPedidos, updatePedidoEstado } from '../modules/api.js';
import { actualizarTexto, crearElemento } from '../modules/ui.js';
import { audioManager } from '../modules/audio.js';
import { state } from '../modules/state.js';

// ========== INICIALIZACIÓN ==========

async function init() {
    console.log('🍳 Cocina iniciada');
    setInterval(actualizar, 3000); // Polling cada 3 segundos
    await actualizar();
}

// ========== ACTUALIZAR DATOS ==========

async function actualizar() {
    const pedidos = await getPedidos();
    state.setPedidos(pedidos);

    // Detectar nuevos pedidos
    const nuevos = state.detectarNuevosPedidos();
    if (nuevos.length > 0) {
        console.log('🔔 Nuevos pedidos:', nuevos);
        audioManager.sonidoNuevoPedido();
    }

    // Detectar cambios de estado
    const cambios = state.detectarCambiosEstado();
    Object.entries(cambios).forEach(([id, {de, a}]) => {
        console.log(`📊 Pedido ${id}: ${de} → ${a}`);
        if (a === 'listo') {
            audioManager.sonidoListoUrgente();
        }
    });

    renderizar();
}

// ========== RENDERIZAR ==========

function renderizar() {
    const pendiente = state.getPedidosPorEstado('pendiente');
    const preparando = state.getPedidosPorEstado('preparando');
    const listo = state.getPedidosPorEstado('listo');

    mostrarColumna('pendiente', pendiente);
    mostrarColumna('preparando', preparando);
    mostrarColumna('listo', listo);
}

function mostrarColumna(estado, pedidos) {
    const col = document.getElementById(`col-${estado}`);
    if (!col) return;

    col.innerHTML = '';

    if (pedidos.length === 0) {
        col.innerHTML = '<div class="empty">Sin pedidos</div>';
        return;
    }

    pedidos.forEach(p => {
        const card = crearElemento('div', { class: 'pedido-card' }, `
            <div class="header">
                <strong>Mesa ${p.mesa}</strong>
                <small>${tiempoTranscurrido(p.fechaCreacion)}</small>
            </div>
            <div class="items">
                ${p.items.map(i => `${i.nombre} (${i.cantidad})`).join('<br>')}
            </div>
            <div class="botones">
                ${crearBotones(p._id, estado)}
            </div>
        `);
        col.appendChild(card);
    });
}

function crearBotones(id, estado) {
    if (estado === 'pendiente') {
        return `<button onclick="cocina.cambiarEstado('${id}', 'preparando')">Preparando</button>`;
    }
    if (estado === 'preparando') {
        return `<button onclick="cocina.cambiarEstado('${id}', 'listo')">Listo</button>`;
    }
    return ''; // En listo, no hay botones
}

// ========== CAMBIAR ESTADO ==========

async function cambiarEstado(id, nuevoEstado) {
    try {
        await updatePedidoEstado(id, nuevoEstado);
        if (nuevoEstado === 'preparando') {
            audioManager.sonidoExito();
        }
        await actualizar();
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

// ========== UTILIDADES ==========

function tiempoTranscurrido(fecha) {
    const diff = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);
    return mins > 0 ? `${mins}m` : 'Ahora';
}

// ========== EXPORTAR PARA GLOBAL ==========

window.cocina = { cambiarEstado };

// ========== INICIAR ==========

init();

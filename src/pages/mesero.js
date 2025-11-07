/**
 * mesero.js - Interfaz de Mesero/POS
 * Responsabilidad: Crear pedidos, monitorear estados
 * 
 * Usa módulos:
 * - api.js → Llamadas HTTP
 * - ui.js → Funciones DOM
 * - audio.js → Sonidos
 * - state.js → Datos compartidos (carrito, pedidos)
 */

import { getProductos, createPedido, getPedidos } from '../modules/api.js';
import { showToast, mostrarPaso, crearElemento, formatearMoneda } from '../modules/ui.js';
import { audioManager } from '../modules/audio.js';
import { state } from '../modules/state.js';

// ========== INICIALIZACIÓN ==========

async function init() {
    console.log('👨‍💼 Mesero iniciado');
    await cargarProductos();
    renderizarMesas();
    setInterval(monitoreoPedidos, 3000); // Monitorear cada 3 seg
}

// ========== CARGAR PRODUCTOS ==========

async function cargarProductos() {
    const productos = await getProductos();
    state.setProductos(productos);
}

// ========== SELECCIONAR MESA ==========

function renderizarMesas() {
    const contenedor = document.getElementById('mesas-container');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const btn = crearElemento('button', {
            class: 'mesa-btn',
            onclick: `mesero.seleccionarMesa(${i})`
        }, `Mesa ${i}`);
        contenedor.appendChild(btn);
    }
}

function seleccionarMesa(mesa) {
    state.setMesaSeleccionada(mesa);
    state.limpiarCarrito();
    renderizarProductos();
    mostrarPaso('menu');
}

// ========== RENDERIZAR PRODUCTOS ==========

function renderizarProductos() {
    const contenedor = document.getElementById('productos-container');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    state.getProductos().forEach(p => {
        const cartItem = state.cart.find(c => c._id === p._id);
        const qty = cartItem ? cartItem.cantidad : 0;

        const div = crearElemento('div', { class: 'producto-item' }, `
            <h4>${p.nombre}</h4>
            <small>${p.categoria}</small>
            <p>${formatearMoneda(p.precio)}</p>
            <div class="qty-control">
                <button onclick="mesero.reducir('${p._id}')">−</button>
                <span>${qty}</span>
                <button onclick="mesero.agregar('${p._id}', '${p.nombre}', ${p.precio})">+</button>
            </div>
        `);
        contenedor.appendChild(div);
    });
}

// ========== CARRITO ==========

function agregar(id, nombre, precio) {
    state.agregarAlCarrito(id, nombre, precio);
    actualizarVistasCarrito();
}

function reducir(id) {
    state.reducirDelCarrito(id);
    actualizarVistasCarrito();
}

function eliminarDelCarrito(id) {
    state.removerDelCarrito(id);
    renderizarCarrito();
    actualizarVistasCarrito();
}

function actualizarVistasCarrito() {
    renderizarProductos();
    actualizarContador();
}

function actualizarContador() {
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.textContent = state.contarCarrito();
    }
}

function verCarrito() {
    const cart = state.obtenerCartitosConCantidad();
    if (cart.length === 0) {
        showToast('Carrito vacío', 'error');
        return;
    }
    renderizarCarrito();
    mostrarPaso('carrito');
}

function renderizarCarrito() {
    const contenedor = document.getElementById('carrito-items');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    const total = state.calcularTotalCarrito();

    state.obtenerCartitosConCantidad().forEach(item => {
        const subtotal = item.precio * item.cantidad;
        const div = crearElemento('div', { class: 'carrito-item' }, `
            <div>
                <strong>${item.nombre}</strong>
                <small>${item.cantidad} × ${formatearMoneda(item.precio)}</small>
            </div>
            <div>
                <span>${formatearMoneda(subtotal)}</span>
                <button onclick="mesero.eliminarDelCarrito('${item._id}')">🗑️</button>
            </div>
        `);
        contenedor.appendChild(div);
    });

    const totalEl = document.getElementById('total-price');
    if (totalEl) totalEl.textContent = formatearMoneda(total);
}

// ========== ENVIAR PEDIDO ==========

async function enviarPedido() {
    const mesa = state.getMesaSeleccionada();
    const items = state.obtenerCartitosConCantidad();

    if (!mesa || items.length === 0) {
        showToast('Agrega items y selecciona mesa', 'error');
        return;
    }

    try {
        await createPedido({ mesa, items });
        showToast('✅ Pedido enviado a cocina', 'success');
        audioManager.sonidoExito();
        state.limpiarCarrito();
        verMesaOrdenes();
    } catch (err) {
        showToast('❌ Error enviando pedido', 'error');
    }
}

// ========== MONITOREO DE PEDIDOS ==========

async function monitoreoPedidos() {
    const pedidos = await getPedidos();
    state.setPedidos(pedidos);

    // Detectar cambios de estado
    const cambios = state.detectarCambiosEstado();
    Object.entries(cambios).forEach(([id, {a}]) => {
        if (a === 'listo') {
            audioManager.sonidoListoUrgente();
        }
    });
}

async function verMesaOrdenes() {
    const mesa = state.getMesaSeleccionada();
    if (!mesa) {
        showToast('Selecciona una mesa', 'error');
        return;
    }

    const pedidos = state.getPedidosPorMesa(mesa);
    const pendiente = pedidos.filter(p => p.estado === 'pendiente');
    const preparando = pedidos.filter(p => p.estado === 'preparando');
    const listo = pedidos.filter(p => p.estado === 'listo');

    mostrarEstados('pendiente', pendiente);
    mostrarEstados('preparando', preparando);
    mostrarEstados('listo', listo);

    mostrarPaso('seguimiento');
}

function mostrarEstados(estado, pedidos) {
    const col = document.getElementById(`orders-mesa-${estado}`);
    if (!col) return;

    col.innerHTML = '';
    if (pedidos.length === 0) {
        col.innerHTML = '<div class="empty">Sin pedidos</div>';
        return;
    }

    pedidos.forEach(p => {
        const items = p.items.map(i => `${i.nombre} (${i.cantidad})`).join(', ');
        const div = crearElemento('div', { class: 'pedido-card' }, `
            <strong>Mesa ${p.mesa}</strong>
            <small>${items}</small>
            <small>${tiempoTranscurrido(p.fechaCreacion)}</small>
        `);
        col.appendChild(div);
    });
}

// ========== UTILIDADES ==========

function tiempoTranscurrido(fecha) {
    const diff = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);
    return mins > 0 ? `${mins}m` : 'Ahora';
}

function volver() {
    mostrarPaso('menu');
}

function nuevoPedido() {
    state.limpiarCarrito();
    state.limpiarMesaSeleccionada();
    mostrarPaso('inicio');
}

function toggleAudio() {
    const nuevoEstado = !audioManager.estaHabilitado();
    audioManager.toggle(nuevoEstado);
    const btn = document.getElementById('btn-audio');
    if (btn) {
        btn.classList.toggle('disabled', !nuevoEstado);
    }
}

// ========== EXPORTAR PARA GLOBAL ==========

window.mesero = {
    seleccionarMesa,
    agregar,
    reducir,
    eliminarDelCarrito,
    verCarrito,
    enviarPedido,
    verMesaOrdenes,
    volver,
    nuevoPedido,
    toggleAudio
};

// ========== INICIAR ==========

init();

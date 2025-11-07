/**
 * API.js - Módulo centralizado de todas las llamadas API
 * Responsabilidad: Comunicación con backend
 * 
 * Patrón: Cada función = 1 endpoint
 */

// Detectar entorno: desarrollo vs producción
const isDevelopment = import.meta.env.DEV;
const API_BASE = isDevelopment 
  ? 'http://localhost:3000/api'
  : 'https://crispy-octo-spoon.onrender.com/api';

// ========== PRODUCTOS ==========

/**
 * Obtener todos los productos
 * @returns {Promise<Array>} Lista de productos
 */
export async function getProductos() {
    try {
        const res = await fetch(`${API_BASE}/productos`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('❌ getProductos:', err);
        return [];
    }
}

/**
 * Crear nuevo producto
 * @param {Object} producto - {nombre, precio, categoria, descripcion}
 * @returns {Promise<Object>} Producto creado
 */
export async function createProducto(producto) {
    try {
        const res = await fetch(`${API_BASE}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('❌ createProducto:', err);
        throw err;
    }
}

/**
 * Editar producto existente
 * @param {string} id - ID del producto
 * @param {Object} datos - Campos a actualizar
 * @returns {Promise<Object>} Producto actualizado
 */
export async function updateProducto(id, datos) {
    try {
        const res = await fetch(`${API_BASE}/productos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('❌ updateProducto:', err);
        throw err;
    }
}

/**
 * Eliminar producto
 * @param {string} id - ID del producto
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function deleteProducto(id) {
    try {
        const res = await fetch(`${API_BASE}/productos/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('❌ deleteProducto:', err);
        throw err;
    }
}

// ========== PEDIDOS ==========

/**
 * Obtener todos los pedidos
 * @returns {Promise<Array>} Lista de pedidos
 */
export async function getPedidos() {
    try {
        const res = await fetch(`${API_BASE}/pedidos`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('❌ getPedidos:', err);
        return [];
    }
}

/**
 * Crear nuevo pedido
 * @param {Object} pedido - {mesa, items: [{nombre, cantidad, precio}]}
 * @returns {Promise<Object>} Pedido creado
 */
export async function createPedido(pedido) {
    try {
        const res = await fetch(`${API_BASE}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('❌ createPedido:', err);
        throw err;
    }
}

/**
 * Cambiar estado de un pedido
 * @param {string} id - ID del pedido
 * @param {string} estado - Nuevo estado (pendiente, preparando, listo, servido)
 * @returns {Promise<Object>} Pedido actualizado
 */
export async function updatePedidoEstado(id, estado) {
    try {
        const res = await fetch(`${API_BASE}/pedidos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('❌ updatePedidoEstado:', err);
        throw err;
    }
}

/**
 * Obtener pedidos de una mesa específica
 * @param {number} mesa - Número de mesa
 * @returns {Promise<Array>} Pedidos de la mesa
 */
export async function getPedidosMesa(mesa) {
    try {
        const pedidos = await getPedidos();
        return pedidos.filter(p => p.mesa === mesa);
    } catch (err) {
        console.error('❌ getPedidosMesa:', err);
        return [];
    }
}

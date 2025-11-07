/**
 * admin.js - Interfaz de administración (Gestión de Productos)
 * Responsabilidad: CRUD de productos
 * 
 * Usa módulos:
 * - api.js → Llamadas HTTP
 * - ui.js → Funciones DOM
 * - state.js → Datos compartidos
 */

import { getProductos, createProducto, updateProducto, deleteProducto } from '../modules/api.js';
import { showToast, mostrarPaso, crearElemento, formatearMoneda } from '../modules/ui.js';
import { state } from '../modules/state.js';

// ========== INICIALIZACIÓN ==========

async function init() {
    console.log('🏪 Admin iniciado');
    await cargarProductos();
    renderizarProductos();
}

// ========== CARGAR DATOS ==========

async function cargarProductos() {
    const productos = await getProductos();
    state.setProductos(productos);
}

// ========== RENDERIZAR ==========

function renderizarProductos() {
    const contenedor = document.getElementById('productos-tabla');
    if (!contenedor) return;

    contenedor.innerHTML = '';
    const productos = state.getProductos();

    if (productos.length === 0) {
        contenedor.innerHTML = '<tr><td colspan="5">Sin productos</td></tr>';
        return;
    }

    productos.forEach(p => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>${formatearMoneda(p.precio)}</td>
            <td>${p.descripcion || '-'}</td>
            <td>
                <button onclick="admin.editar('${p._id}')" class="btn-pequeno">Editar</button>
                <button onclick="admin.eliminar('${p._id}')" class="btn-pequeno btn-danger">Eliminar</button>
            </td>
        `;
        contenedor.appendChild(fila);
    });
}

// ========== CREAR PRODUCTO ==========

async function crearProducto_() {
    const nombre = document.getElementById('nombre').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const categoria = document.getElementById('categoria').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();

    // Validar
    if (!nombre || !precio || !categoria) {
        showToast('Completa todos los campos', 'error');
        return;
    }

    try {
        await createProducto({ nombre, precio, categoria, descripcion });
        showToast('✅ Producto creado', 'success');
        limpiarFormulario();
        await cargarProductos();
        renderizarProductos();
    } catch (err) {
        showToast('❌ Error creando producto', 'error');
    }
}

// ========== EDITAR PRODUCTO ==========

async function editar(id) {
    const producto = state.obtenerProductoPorId(id);
    if (!producto) return;

    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('categoria').value = producto.categoria;
    document.getElementById('descripcion').value = producto.descripcion || '';
    document.getElementById('producto-id').value = id;

    mostrarPaso('editar');
}

async function guardarEdicion() {
    const id = document.getElementById('producto-id').value;
    const nombre = document.getElementById('nombre').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const categoria = document.getElementById('categoria').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();

    if (!nombre || !precio || !categoria) {
        showToast('Completa todos los campos', 'error');
        return;
    }

    try {
        await updateProducto(id, { nombre, precio, categoria, descripcion });
        showToast('✅ Producto actualizado', 'success');
        limpiarFormulario();
        await cargarProductos();
        renderizarProductos();
        mostrarPaso('listar');
    } catch (err) {
        showToast('❌ Error actualizando', 'error');
    }
}

// ========== ELIMINAR PRODUCTO ==========

async function eliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return;

    try {
        await deleteProducto(id);
        showToast('✅ Producto eliminado', 'success');
        await cargarProductos();
        renderizarProductos();
    } catch (err) {
        showToast('❌ Error eliminando', 'error');
    }
}

// ========== UTILIDADES ==========

function limpiarFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('producto-id').value = '';
}

function cancelarEdicion() {
    limpiarFormulario();
    mostrarPaso('listar');
}

// ========== EXPORTAR PARA GLOBAL ==========

window.admin = {
    editar,
    eliminar,
    crearProducto: crearProducto_,
    guardarEdicion,
    cancelarEdicion
};

// ========== INICIAR ==========

init();

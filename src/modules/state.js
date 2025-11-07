/**
 * State.js - Manejo centralizado del estado
 * Responsabilidad: Guardar datos globales, sincronización
 */

class StateManager {
    constructor() {
        // Estado compartido
        this.productos = [];
        this.pedidos = [];
        this.cart = [];
        this.mesaSeleccionada = null;

        // Para sincronización de cambios
        this.listeners = [];

        // Tracking de cambios
        this.idsAnteriores = [];
        this.estadosAnteriores = {};
    }

    /**
     * Suscribirse a cambios de estado
     * @param {Function} callback - Función a ejecutar cuando cambie
     */
    onChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notificar cambios a listeners
     * @param {string} tipo - Tipo de cambio (productos, pedidos, cart)
     */
    notificar(tipo) {
        this.listeners.forEach(cb => cb(tipo));
    }

    // ===== PRODUCTOS =====

    setProductos(productos) {
        this.productos = productos;
        this.notificar('productos');
    }

    getProductos() {
        return this.productos;
    }

    obtenerProductoPorId(id) {
        return this.productos.find(p => p._id === id);
    }

    // ===== PEDIDOS =====

    setPedidos(pedidos) {
        this.pedidos = pedidos;
        this.notificar('pedidos');
    }

    getPedidos() {
        return this.pedidos;
    }

    getPedidosPorEstado(estado) {
        return this.pedidos.filter(p => p.estado === estado);
    }

    getPedidosPorMesa(mesa) {
        return this.pedidos.filter(p => p.mesa === mesa);
    }

    /**
     * Detectar nuevos pedidos comparando IDs
     * @returns {Array} IDs de pedidos nuevos
     */
    detectarNuevosPedidos() {
        const idsActuales = this.pedidos.map(p => p._id);
        const nuevos = idsActuales.filter(id => !this.idsAnteriores.includes(id));
        this.idsAnteriores = idsActuales;
        return nuevos;
    }

    /**
     * Detectar cambios de estado
     * @returns {Object} {pedidoId: {antiguo, nuevo}}
     */
    detectarCambiosEstado() {
        const cambios = {};

        this.pedidos.forEach(pedido => {
            const estadoAnterior = this.estadosAnteriores[pedido._id];
            const estadoNuevo = pedido.estado;

            if (estadoAnterior && estadoAnterior !== estadoNuevo) {
                cambios[pedido._id] = {
                    de: estadoAnterior,
                    a: estadoNuevo
                };
            }

            this.estadosAnteriores[pedido._id] = estadoNuevo;
        });

        return cambios;
    }

    // ===== CARRITO =====

    agregarAlCarrito(id, nombre, precio) {
        let item = this.cart.find(c => c._id === id);

        if (item) {
            item.cantidad++;
        } else {
            this.cart.push({ _id: id, nombre, precio, cantidad: 1 });
        }

        this.notificar('cart');
    }

    reducirDelCarrito(id) {
        let item = this.cart.find(c => c._id === id);
        if (item && item.cantidad > 0) {
            item.cantidad--;
            this.notificar('cart');
        }
    }

    removerDelCarrito(id) {
        this.cart = this.cart.filter(c => c._id !== id);
        this.notificar('cart');
    }

    obtenerCarrito() {
        return this.cart;
    }

    limpiarCarrito() {
        this.cart = [];
        this.notificar('cart');
    }

    contarCarrito() {
        return this.cart.reduce((sum, item) => sum + item.cantidad, 0);
    }

    calcularTotalCarrito() {
        return this.cart
            .filter(item => item.cantidad > 0) // Solo contar items con cantidad > 0
            .reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }

    obtenerCartitosConCantidad() {
        return this.cart.filter(item => item.cantidad > 0);
    }

    // ===== MESA =====

    setMesaSeleccionada(mesa) {
        this.mesaSeleccionada = mesa;
        this.notificar('mesa');
    }

    getMesaSeleccionada() {
        return this.mesaSeleccionada;
    }

    limpiarMesaSeleccionada() {
        this.mesaSeleccionada = null;
    }

    // ===== UTILIDADES =====

    /**
     * Resetear todo el estado
     */
    reset() {
        this.productos = [];
        this.pedidos = [];
        this.cart = [];
        this.mesaSeleccionada = null;
        this.idsAnteriores = [];
        this.estadosAnteriores = {};
    }

    /**
     * Obtener resumen del estado
     */
    getResumen() {
        return {
            productos: this.productos.length,
            pedidos: this.pedidos.length,
            carrito: this.cart.length,
            mesaSeleccionada: this.mesaSeleccionada,
            totalCarrito: this.calcularTotalCarrito()
        };
    }
}

// Crear instancia global única
export const state = new StateManager();

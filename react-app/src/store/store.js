/**
 * Store.js - Zustand store para React
 * Centraliza todo el estado de la aplicación
 */

import { create } from 'zustand';
import * as api from '../modules/api';

export const useStore = create((set, get) => ({
  // Estado
  productos: [],
  pedidos: [],
  carrito: {},
  mesaSeleccionada: null,
  
  // Acciones - Productos
  setProductos: (productos) => set({ productos }),
  
  cargarProductos: async () => {
    try {
      const productos = await api.getProductos();
      set({ productos });
    } catch (err) {
      console.error('Error cargando productos:', err);
    }
  },

  // Acciones - Pedidos
  setPedidos: (pedidos) => set({ pedidos }),
  
  cargarPedidos: async () => {
    try {
      const pedidos = await api.getPedidos();
      set({ pedidos });
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    }
  },

  crearPedido: async (pedido) => {
    try {
      const nuevoPedido = await api.createPedido(pedido);
      const pedidos = await api.getPedidos();
      set({ pedidos, carrito: {} });
      return nuevoPedido;
    } catch (err) {
      console.error('Error creando pedido:', err);
      throw err;
    }
  },

  cambiarEstadoPedido: async (id, estado) => {
    try {
      await api.updatePedidoEstado(id, estado);
      const pedidos = await api.getPedidos();
      set({ pedidos });
    } catch (err) {
      console.error('Error cambiando estado:', err);
      throw err;
    }
  },

  // Acciones - Carrito
  agregarAlCarrito: (productoId, cantidad = 1) => set((state) => {
    const actual = state.carrito[productoId] || 0;
    return {
      carrito: {
        ...state.carrito,
        [productoId]: actual + cantidad
      }
    };
  }),

  reducirDelCarrito: (productoId) => set((state) => {
    const actual = state.carrito[productoId] || 0;
    if (actual <= 1) {
      const { [productoId]: _, ...resto } = state.carrito;
      return { carrito: resto };
    }
    return {
      carrito: {
        ...state.carrito,
        [productoId]: actual - 1
      }
    };
  }),

  limpiarCarrito: () => set({ carrito: {} }),

  calcularTotalCarrito: () => {
    const { carrito, productos } = get();
    return Object.entries(carrito).reduce((total, [prodId, cantidad]) => {
      const prod = productos.find(p => p._id === prodId);
      return total + (prod?.precio || 0) * cantidad;
    }, 0);
  },

  // Acciones - Mesa
  seleccionarMesa: (mesa) => set({ mesaSeleccionada: mesa }),
  
  limpiarMesa: () => set({ mesaSeleccionada: null }),

  // Helpers
  obtenerProducto: (id) => {
    const { productos } = get();
    return productos.find(p => p._id === id);
  },

  obtenerItemsCarrito: () => {
    const { carrito, productos } = get();
    return Object.entries(carrito).map(([prodId, cantidad]) => {
      const prod = productos.find(p => p._id === prodId);
      return {
        productoId: prodId,
        nombre: prod?.nombre || 'Desconocido',
        cantidad,
        precio: prod?.precio || 0,
        subtotal: (prod?.precio || 0) * cantidad
      };
    });
  }
}));

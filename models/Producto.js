// models/Producto.js
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    unique: true 
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  // --- CAMBIO CRÍTICO: DE 'disponibilidad' A 'disponible' ---
  disponible: {
    type: Boolean,
    default: true // True = Hay, False = Agotado
  },
  // -----------------------------------------------------------
  categoria: {
    type: String,
    enum: ['Entrada', 'Plato Principal', 'Postre', 'Bebida', 'Otro'],
    default: 'Plato Principal'
  }
});

module.exports = mongoose.model('Producto', ProductoSchema);
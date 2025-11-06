// models/Producto.js
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    unique: true // No puede haber dos productos con el mismo nombre
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  disponibilidad: {
    type: Boolean,
    default: true // True = Hay, False = Agotado
  },
  categoria: {
    type: String,
    // Puedes ajustar estas categorías a las de tu restaurante
    enum: ['Entrada', 'Plato Principal', 'Postre', 'Bebida', 'Otro'],
    default: 'Plato Principal'
  }
});

// El modelo se llama 'Producto' y creará la colección 'productos' en MongoDB
module.exports = mongoose.model('Producto', ProductoSchema);
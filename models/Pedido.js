const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  mesa: { type: String, required: true },
  items: [
    {
      productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
      nombre: String,
      cantidad: Number,
      precio: Number
    }
  ],
  estado: { type: String, enum: ['pendiente', 'en preparacion', 'listo', 'entregado'], default: 'pendiente' },
  total: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pedido', pedidoSchema);

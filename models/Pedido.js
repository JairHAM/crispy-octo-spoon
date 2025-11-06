const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    mesa: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    items: [{
        _id: mongoose.Schema.Types.ObjectId,
        nombre: String,
        precio: Number,
        cantidad: Number
    }],
    estado: {
        type: String,
        enum: ['pendiente', 'preparando', 'listo', 'servido'],
        default: 'pendiente'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    horaEstimada: Date,
    fechaFinalizacion: Date
});

module.exports = mongoose.model('Pedido', pedidoSchema);

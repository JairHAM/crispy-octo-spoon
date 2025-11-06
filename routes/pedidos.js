const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
    try {
        const pedidos = await Pedido.find().sort({ fechaCreacion: -1 });
        res.json(pedidos);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { mesa, items, estado, fechaCreacion, horaEstimada } = req.body;
        
        if (!mesa || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Mesa e items requeridos' });
        }
        
        const pedido = new Pedido({
            mesa,
            items,
            estado: estado || 'pendiente',
            fechaCreacion,
            horaEstimada
        });
        
        await pedido.save();
        
        if (global.io) {
            global.io.emit('pedido-nuevo', pedido);
        }
        
        res.status(201).json(pedido);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        const pedido = await Pedido.findById(req.params.id);
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        
        res.json(pedido);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        
        if (global.io) {
            global.io.emit('pedido-actualizado', pedido);
        }
        
        res.json(pedido);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        const updateData = {};
        if (req.body.estado) updateData.estado = req.body.estado;
        if (req.body.estado === 'listo' || req.body.estado === 'servido') {
            updateData.fechaFinalizacion = new Date();
        }
        
        const pedido = await Pedido.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        
        if (global.io) {
            global.io.emit('pedido-actualizado', pedido);
        }
        
        res.json(pedido);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        const pedido = await Pedido.findByIdAndDelete(req.params.id);
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        
        res.status(204).send();
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;

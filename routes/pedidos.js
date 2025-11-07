const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');

// GET all pedidos
router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find();
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET pedidos by mesa
router.get('/mesa/:mesa', async (req, res) => {
  try {
    const pedidos = await Pedido.find({ mesa: req.params.mesa });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new pedido
router.post('/', async (req, res) => {
  try {
    const pedido = new Pedido(req.body);
    await pedido.save();
    global.io?.emit('pedidoNuevo', pedido);
    res.status(201).json(pedido);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update pedido estado
router.put('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, { new: true });
    global.io?.emit('pedidoActualizado', pedido);
    res.json(pedido);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

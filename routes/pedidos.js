const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');

// Datos mock para desarrollo
const pedidosMock = [];

// GET all pedidos
router.get('/', async (req, res) => {
  try {
    // Intentar desde BD primero
    if (Pedido.collection) {
      const pedidos = await Pedido.find();
      return res.json(pedidos);
    }
  } catch (err) {
    console.warn('BD no disponible, usando mock data');
  }
  
  // Fallback a mock data
  res.json(pedidosMock);
});

// GET pedidos by mesa
router.get('/mesa/:mesa', async (req, res) => {
  try {
    // Intentar en BD
    if (Pedido.collection) {
      const pedidos = await Pedido.find({ mesa: req.params.mesa });
      return res.json(pedidos);
    }
  } catch (e) {
    console.warn('BD no disponible');
  }
  
  // Mock
  const pedidos = pedidosMock.filter(p => p.mesa === req.params.mesa);
  res.json(pedidos);
});

// POST new pedido
router.post('/', async (req, res) => {
  try {
    const newPedido = {
      _id: Date.now().toString(),
      ...req.body,
      estado: 'pendiente',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Intentar guardar en BD
    try {
      if (Pedido.collection) {
        const pedido = new Pedido(newPedido);
        await pedido.save();
        global.io?.emit('pedidoNuevo', pedido);
        return res.status(201).json(pedido);
      }
    } catch (e) {
      console.warn('No se pudo guardar en BD');
    }
    
    // Mock
    pedidosMock.push(newPedido);
    global.io?.emit('pedidoNuevo', newPedido);
    res.status(201).json(newPedido);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update pedido estado
router.put('/:id', async (req, res) => {
  try {
    // Intentar en BD primero
    try {
      if (Pedido.collection) {
        const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, { new: true });
        global.io?.emit('pedidoActualizado', pedido);
        return res.json(pedido);
      }
    } catch (e) {
      console.warn('No se pudo actualizar en BD');
    }
    
    // Mock update
    const idx = pedidosMock.findIndex(p => p._id === req.params.id);
    if (idx !== -1) {
      pedidosMock[idx] = { ...pedidosMock[idx], ...req.body, updatedAt: new Date() };
      global.io?.emit('pedidoActualizado', pedidosMock[idx]);
      res.json(pedidosMock[idx]);
    } else {
      res.status(404).json({ error: 'Pedido no encontrado' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

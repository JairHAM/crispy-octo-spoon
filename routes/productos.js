const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');

// GET all productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new producto
router.post('/', async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    global.io?.emit('productosActualizados', { productos: await Producto.find() });
    res.status(201).json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update producto
router.put('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    global.io?.emit('productosActualizados', { productos: await Producto.find() });
    res.json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE producto
router.delete('/:id', async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    global.io?.emit('productosActualizados', { productos: await Producto.find() });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

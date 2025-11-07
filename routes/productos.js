const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');

// Datos mock para desarrollo (cuando BD no está disponible)
const productsMock = [
  { _id: '1', nombre: 'Ceviche', categoria: 'Entrada', precio: 25, disponible: true },
  { _id: '2', nombre: 'Lomo a lo Pobre', categoria: 'Plato Fuerte', precio: 35, disponible: true },
  { _id: '3', nombre: 'Arroz con Pollo', categoria: 'Plato Fuerte', precio: 28, disponible: true },
  { _id: '4', nombre: 'Causa Limeña', categoria: 'Entrada', precio: 22, disponible: true },
  { _id: '5', nombre: 'Ají de Gallina', categoria: 'Plato Fuerte', precio: 30, disponible: true },
];

// GET all productos
router.get('/', async (req, res) => {
  try {
    // Intentar desde BD primero
    if (Producto.collection) {
      const productos = await Producto.find();
      return res.json(productos);
    }
  } catch (err) {
    console.warn('BD no disponible, usando mock data:', err.message);
  }
  
  // Fallback a mock data
  res.json(productsMock);
});

// POST new producto
router.post('/', async (req, res) => {
  try {
    // Generar ID mock
    const newProduct = {
      _id: Date.now().toString(),
      ...req.body,
      disponible: req.body.disponible !== false
    };
    
    // Intentar guardar en BD
    try {
      if (Producto.collection) {
        const producto = new Producto(newProduct);
        await producto.save();
        global.io?.emit('productosActualizados', { productos: await Producto.find() });
        return res.status(201).json(producto);
      }
    } catch (e) {
      console.warn('No se pudo guardar en BD, usando mock');
    }
    
    // Mock response
    productsMock.push(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update producto
router.put('/:id', async (req, res) => {
  try {
    // Intentar en BD primero
    try {
      if (Producto.collection) {
        const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        global.io?.emit('productosActualizados', { productos: await Producto.find() });
        return res.json(producto);
      }
    } catch (e) {
      console.warn('No se pudo actualizar en BD');
    }
    
    // Mock update
    const idx = productsMock.findIndex(p => p._id === req.params.id);
    if (idx !== -1) {
      productsMock[idx] = { ...productsMock[idx], ...req.body };
      res.json(productsMock[idx]);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE producto
router.delete('/:id', async (req, res) => {
  try {
    // Intentar en BD primero
    try {
      if (Producto.collection) {
        await Producto.findByIdAndDelete(req.params.id);
        global.io?.emit('productosActualizados', { productos: await Producto.find() });
        return res.json({ message: 'Producto eliminado' });
      }
    } catch (e) {
      console.warn('No se pudo eliminar de BD');
    }
    
    // Mock delete
    const idx = productsMock.findIndex(p => p._id === req.params.id);
    if (idx !== -1) {
      productsMock.splice(idx, 1);
      res.json({ message: 'Producto eliminado' });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

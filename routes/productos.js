// routes/productos.js
const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const mongoose = require('mongoose');

router.post('/', async (req, res) => {
  try {
    if (req.body.disponibilidad !== undefined) {
      req.body.disponible = req.body.disponibilidad;
      delete req.body.disponibilidad;
    }
    const nuevoProducto = new Producto(req.body);
    const productoGuardado = await nuevoProducto.save();
    const salida = productoGuardado.toObject();
    if (salida.disponible === undefined && salida.disponibilidad !== undefined) {
      salida.disponible = salida.disponibilidad;
    }
    
    if (global.io) {
      global.io.to('productos').emit('productos-updated', { action: 'created', producto: salida });
    }
    
    res.status(201).json(salida);
  } catch (err) {
    res.status(400).json({ error: 'No se pudo crear el producto', mensaje: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().lean();
    const norm = productos.map(p => {
      if (p.disponible === undefined && p.disponibilidad !== undefined) {
        p.disponible = p.disponibilidad;
      }
      return p;
    });
    res.status(200).json(norm);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    if (req.body.disponibilidad !== undefined) {
      req.body.disponible = req.body.disponibilidad;
      delete req.body.disponibilidad;
    }

    const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { 
      new: true,
      runValidators: true
    });
    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const salida = productoActualizado.toObject();
    if (salida.disponible === undefined && salida.disponibilidad !== undefined) {
      salida.disponible = salida.disponibilidad;
    }
    
    if (global.io) {
      global.io.to('productos').emit('productos-updated', { action: 'updated', producto: salida });
    }
    
    res.status(200).json(salida);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el producto', mensaje: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
    if (!productoEliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    if (global.io) {
      global.io.to('productos').emit('productos-updated', { action: 'deleted', productoId: req.params.id });
    }
    
    res.status(204).send(); 
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

module.exports = router;
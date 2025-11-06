// routes/productos.js
const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto'); // Importamos el modelo 'Producto'
const mongoose = require('mongoose');

// 1. CREATE (POST /api/productos) - Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    // Compatibilidad: si el cliente envía 'disponibilidad' (campo antiguo), mapearlo
    if (req.body.disponibilidad !== undefined) {
      req.body.disponible = req.body.disponibilidad;
      delete req.body.disponibilidad;
    }
    const nuevoProducto = new Producto(req.body);
    const productoGuardado = await nuevoProducto.save();
    // Normalizar salida: asegurar que el cliente reciba 'disponible'
    const salida = productoGuardado.toObject();
    if (salida.disponible === undefined && salida.disponibilidad !== undefined) {
      salida.disponible = salida.disponibilidad;
    }
    res.status(201).json(salida);
  } catch (err) {
    // 400 Bad Request si la validación falla (ej. falta nombre)
    res.status(400).json({ error: 'No se pudo crear el producto', mensaje: err.message });
  }
});

// 2. READ (GET /api/productos) - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().lean();
    // Normalizar cada documento para exponer 'disponible' al cliente
    const norm = productos.map(p => {
      if (p.disponible === undefined && p.disponibilidad !== undefined) {
        p.disponible = p.disponibilidad;
      }
      return p;
    });
    res.status(200).json(norm);
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

// 3. UPDATE (PUT /api/productos/:id) - Actualizar un producto por ID
router.put('/:id', async (req, res) => {
  try {
    // Validar ObjectId
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    // Compatibilidad: mapear campo antiguo si se envía
    if (req.body.disponibilidad !== undefined) {
      req.body.disponible = req.body.disponibilidad;
      delete req.body.disponibilidad;
    }

    const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, // Devuelve el documento actualizado
      runValidators: true // Ejecuta las validaciones del esquema
    });
    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const salida = productoActualizado.toObject();
    if (salida.disponible === undefined && salida.disponibilidad !== undefined) {
      salida.disponible = salida.disponibilidad;
    }
    res.status(200).json(salida);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el producto', mensaje: err.message });
  }
});

// 4. DELETE (DELETE /api/productos/:id) - Borrar un producto por ID
router.delete('/:id', async (req, res) => {
  try {
    // Validar ObjectId
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
    if (!productoEliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    // 204 No Content indica éxito sin devolver un cuerpo
    res.status(204).send(); 
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

module.exports = router;
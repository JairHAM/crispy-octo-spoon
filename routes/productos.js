// routes/productos.js
const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto'); // Importamos el modelo 'Producto'

// 1. CREATE (POST /api/productos) - Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (err) {
    // 400 Bad Request si la validación falla (ej. falta nombre)
    res.status(400).json({ error: 'No se pudo crear el producto', mensaje: err.message });
  }
});

// 2. READ (GET /api/productos) - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.status(200).json(productos);
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

// 3. UPDATE (PUT /api/productos/:id) - Actualizar un producto por ID
router.put('/:id', async (req, res) => {
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, // Devuelve el documento actualizado
      runValidators: true // Ejecuta las validaciones del esquema
    });
    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(productoActualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el producto', mensaje: err.message });
  }
});

// 4. DELETE (DELETE /api/productos/:id) - Borrar un producto por ID
router.delete('/:id', async (req, res) => {
  try {
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
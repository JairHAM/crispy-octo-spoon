// server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); 

const app = express();
app.use(express.json()); // Middleware para parsear JSON

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Rutas (se añadirá en el Paso 5)
const productosRouter = require('./routes/productos');
app.use('/api/productos', productosRouter); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

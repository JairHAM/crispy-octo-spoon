// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Necesario para la conexión con GitHub Pages
require('dotenv').config(); 

const app = express();

// --- CONFIGURACIÓN DE CORS (PRIMERO) ---
// Configuración para permitir solicitudes solo desde tu dominio de GitHub Pages
// NOTA: 'https://jairham.github.io' permite cualquier repositorio bajo ese usuario.
const corsOptions = {
    origin: 'https://jairham.github.io', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Middleware para parsear JSON (DEBE IR ANTES DE LAS RUTAS)
app.use(express.json()); 
// --- FIN DE CONFIGURACIÓN ---

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Rutas
const productosRouter = require('./routes/productos');
app.use('/api/productos', productosRouter); 

// Definición del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
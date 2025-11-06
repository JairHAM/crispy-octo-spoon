// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Necesario para la conexión con GitHub Pages
require('dotenv').config(); 

const app = express();

// --- CONFIGURACIÓN DE CORS (PRIMERO) ---
// Permitir solicitudes desde GitHub Pages y desde el dominio del servidor (Render).
// Usamos una lista blanca y manejamos preflight (OPTIONS) explícitamente.
const allowedOrigins = [
  'https://jairham.github.io',
  'https://crispy-octo-spoon.onrender.com',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // origin puede ser undefined en herramientas como curl o cuando se hace una petición desde el mismo servidor
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('No permitido por CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// Asegurar que las solicitudes preflight OPTIONS sean respondidas
app.options('*', cors(corsOptions));

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
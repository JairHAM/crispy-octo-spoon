// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Necesario para la conexión con GitHub Pages
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
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
// Express/cors ya manejan las solicitudes preflight cuando se usa el middleware
// Evitamos registrar una ruta con '*' que causa errores en algunas versiones de path-to-regexp
// (Render/Express path parser). Si es necesario, manejamos OPTIONS globalmente abajo.

// SECURITY & PERFORMANCE MIDDLEWARE
app.use(helmet());
app.use(compression());
app.use(mongoSanitize());
// Logger (morgan) - usar en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiter (básico)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use(limiter);

// Middleware para parsear JSON con límite de tamaño
app.use(express.json({ limit: '10kb' })); 
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

// Manejo de errores global (simple)
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const msg = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(status).json({ error: msg });
});
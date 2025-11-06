// server.js - Updated for productoId fix + static files + audio debug
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config(); 

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['https://jairham.github.io', 'https://crispy-octo-spoon.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

app.set('trust proxy', 1);

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

app.use(helmet());
app.use(compression());
// Reemplazo seguro: eliminar claves que empiezan por '$' o contienen '.'
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.indexOf('.') !== -1) {
      delete obj[key];
    } else {
      sanitizeObject(obj[key]);
    }
  }
}

app.use((req, res, next) => {
  try {
    sanitizeObject(req.body);
    sanitizeObject(req.params);
  } catch (err) {
    console.error('Sanitization error:', err);
  }
  next();
});

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiter (básico)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use(limiter);

app.use(express.json({ limit: '10kb' }));

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

const productosRouter = require('./routes/productos');
app.use('/api/productos', productosRouter);

const pedidosRouter = require('./routes/pedidos');
app.use('/api/pedidos', pedidosRouter);

io.on('connection', (socket) => {
  socket.on('subscribe', (data) => {
    if (data.channel === 'productos') {
      socket.join('productos');
    }
  });

  socket.on('disconnect', () => {
    socket.leave('productos');
  });
});

global.io = io;

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
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
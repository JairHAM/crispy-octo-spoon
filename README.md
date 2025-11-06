# 🍽️ El Enkanto - Panel Administrativo

Sistema de gestión de productos para restaurante con interfaz moderna, tema oscuro y actualizaciones en tiempo real.

## 📋 Características

- ✅ **CRUD Completo** - Crear, leer, actualizar, eliminar productos
- ✅ **Live Updates** - Polling cada 5 segundos para sincronización automática
- ✅ **Diseño Responsive** - Optimizado para desktop, tablet y mobile
- ✅ **Tema Oscuro** - Interfaz profesional con colores: Índigo + Rosa
- ✅ **Acceso Rápido** - Sin autenticación requerida
- ✅ **Notificaciones** - Toast automáticas con feedback visual

## 🚀 Stack Tecnológico

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Express.js 5.1.0, Node.js
- **Base de Datos**: MongoDB + Mongoose
- **Icons**: Remix Icon (CDN)
- **Hosting**: Render (Backend), GitHub Pages (Frontend)

## 📁 Estructura

```
├── admin.html         (157 líneas) - Markup limpio
├── admin.css          (1316 líneas) - Styles responsive
├── admin.js           (246 líneas) - Lógica optimizada
├── server.js          - Backend Express
├── package.json       - Dependencias
├── models/
│   └── Producto.js    - Schema MongoDB
└── routes/
    └── productos.js   - Endpoints API
```

## 🔧 Configuración

### Instalar Dependencias
```bash
npm install
```

### Variables de Entorno (.env)
```
PORT=5000
MONGODB_URI=mongodb://...
NODE_ENV=production
```

### Iniciar Servidor
```bash
npm start
```

## 📊 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Obtener todos los productos |
| POST | `/api/productos` | Crear nuevo producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+ (Grid 3 columnas)
- **Tablet**: 768px-1023px (Grid 2 columnas)
- **Mobile**: 480px-767px (Grid 1 columna, full-width)
- **Pequeño**: <360px (Ultra compacto)
- **Landscape**: Optimizado para rotación

## 🎨 Colores

- **Primario**: Índigo `#6366f1`
- **Secundario**: Rosa `#ec4899`
- **Éxito**: Verde `#10b981`
- **Error**: Rojo `#ef4444`
- **Background**: `#0f172a`
- **Texto**: `#f1f5f9`

## ⚡ Optimizaciones

- Código minimalista sin comentarios innecesarios
- Polling automático para live updates (5s)
- Scroll inteligente en mobile
- Prevención de zoom en iOS
- Animaciones GPU-optimizadas
- Rate-limit: 200 req/min
- CORS y sanitización habilitadas

## 🔒 Seguridad

- Helmet para headers seguros
- CORS configurado
- Rate limiting activo
- Sanitización de inputs
- Escape de HTML para XSS prevention

## 📞 Contacto

Restaurante El Enkanto - Panel Administrativo

---

**Última actualización**: 5 de Noviembre 2025

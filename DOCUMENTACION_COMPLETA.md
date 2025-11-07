# 🍽️ Restaurant POS - Documentación Completa del Sistema

## 📋 Resumen General

Es un sistema de Punto de Venta (POS) para restaurantes con 3 interfaces principales:
1. **Admin** - Gestión de productos (CRUD)
2. **Cocina** - Panel de preparación de pedidos (3 estados)
3. **Mesero** - Toma de pedidos y monitoreo

**Stack Tecnológico:**
- Frontend: React 18 + Vite 5 + React Router 6
- Backend: Express.js + Node.js
- Base de datos: MongoDB (Mongoose)
- Estado: Zustand
- Audio: Web Audio API
- Deploy: Vercel (frontend) + Render (backend)

---

## 🎯 Páginas y Funcionalidades

### 1. PÁGINA ADMIN - Gestión de Productos

**URL:** `http://localhost:5173/admin`

**Qué hace:**
- Listar todos los productos
- Crear nuevos productos
- Editar productos existentes
- Eliminar productos

**Flujo:**
```
1. Al cargar: GET /api/productos
   ├─ Obtiene lista de todos los productos
   └─ Los muestra en una tabla

2. Crear Producto:
   ├─ Llenar formulario (nombre, precio, categoría)
   ├─ Click "Crear Producto"
   ├─ POST /api/productos { nombre, precio, categoria }
   └─ Se actualiza la tabla

3. Editar Producto:
   ├─ Click en ✏️ en la fila
   ├─ El formulario se llena con datos del producto
   ├─ Cambiar campos
   ├─ Click "Guardar Cambios"
   ├─ PUT /api/productos/{id} { nombre, precio, categoria }
   └─ Se actualiza la tabla

4. Eliminar:
   ├─ Click en 🗑️
   ├─ Confirmar eliminación
   ├─ DELETE /api/productos/{id}
   └─ Se elimina de la tabla
```

**Estado (Zustand):**
```javascript
{
  productos: [],           // Array de productos
  setProductos: fn,        // Actualizar lista
  cargarProductos: fn      // GET /api/productos
}
```

**API Endpoints:**
```
GET /api/productos
  ├─ Response: [{ _id, nombre, precio, categoria, disponible }]
  
POST /api/productos
  ├─ Body: { nombre, precio, categoria }
  └─ Response: { _id, nombre, precio, categoria, disponible }
  
PUT /api/productos/:id
  ├─ Body: { nombre, precio, categoria }
  └─ Response: { _id, nombre, precio, categoria, disponible }
  
DELETE /api/productos/:id
  └─ Response: { message: "Producto eliminado" }
```

---

### 2. PÁGINA MESERO - Toma de Pedidos

**URL:** `http://localhost:5173/mesero` (o raíz `/`)

**Qué hace:**
- Seleccionar mesa
- Ver menú de productos
- Agregar/remover items al carrito
- Ver carrito
- Enviar pedido
- Monitorear estado del pedido

**Flujo (4 pasos):**

#### PASO 1: SELECCIONAR MESA
```
1. Al cargar: GET /api/productos y GET /api/pedidos
2. Mostrar botones de mesas (1-20)
3. Click en "Mesa 5" → pasa a PASO 2
```

#### PASO 2: VER MENÚ
```
1. Muestra todos los productos
2. Cada producto tiene:
   ├─ Nombre
   ├─ Categoría
   ├─ Precio
   └─ Botones ➕/➖ para cantidad

3. Flujo de agregar al carrito:
   ├─ Click ➕ en producto
   ├─ Se suma 1 cantidad en estado Zustand
   ├─ carrito { productoId: cantidad }
   └─ Se actualiza el contador
   
4. Botón "Carrito (3)" → pasa a PASO 3
```

#### PASO 3: VER CARRITO
```
1. Muestra items agregados:
   ├─ Nombre del producto
   ├─ Cantidad
   ├─ Precio unitario
   └─ Subtotal

2. Calcula total:
   └─ Suma de (cantidad × precio) para cada item

3. Botón "Enviar Pedido":
   ├─ Recopila datos:
   │  ├─ mesa: "5"
   │  ├─ items: [
   │  │   { productoId, nombre, cantidad, precio, subtotal },
   │  │   ...
   │  │ ]
   │  └─ total: 85.5
   │
   ├─ POST /api/pedidos (envía pedido)
   ├─ Audio de éxito (si está habilitado)
   ├─ Limpia carrito
   └─ Pasa a PASO 4

4. Botón "Atrás" → vuelve a PASO 2
```

#### PASO 4: MONITOREO
```
1. Muestra todos los pedidos de esa mesa
2. Cada pedido muestra:
   ├─ ID del pedido
   ├─ Estado actual (pendiente, preparando, listo)
   └─ Items pedidos

3. Botón "Otra Mesa" → vuelve a PASO 1

4. Cada 3 segundos:
   └─ GET /api/pedidos (actualiza estado)
```

**Estado (Zustand):**
```javascript
{
  productos: [],
  pedidos: [],
  carrito: { productoId: cantidad, ... },
  mesaSeleccionada: "5",
  
  agregarAlCarrito: fn,
  reducirDelCarrito: fn,
  seleccionarMesa: fn,
  calcularTotalCarrito: fn,
  obtenerItemsCarrito: fn
}
```

---

### 3. PÁGINA COCINA - Preparación de Pedidos

**URL:** `http://localhost:5173/cocina`

**Qué hace:**
- Ver pedidos en 3 columnas (estados)
- Cambiar estado de pedidos
- Audio de alerta

**Flujo:**

```
Al cargar:
├─ GET /api/pedidos
└─ Cada 3 segundos: GET /api/pedidos

Columnas (filtradas por estado):
├─ PENDIENTE: pedidos con estado "pendiente"
├─ PREPARANDO: pedidos con estado "en preparacion"
└─ LISTOS: pedidos con estado "listo"

Cada tarjeta de pedido muestra:
├─ Mesa #X
├─ Hora creación
├─ Items (ej: 2x Ceviche, 1x Arroz con Pollo)
└─ Botón de acción (según columna)

Acciones:
├─ En PENDIENTE:
│  ├─ Click "Preparando"
│  ├─ PUT /api/pedidos/{id} { estado: "en preparacion" }
│  └─ Audio de éxito
│
├─ En PREPARANDO:
│  ├─ Click "✅ Listo"
│  ├─ PUT /api/pedidos/{id} { estado: "listo" }
│  └─ Audio "Listo Urgente"
│
└─ En LISTOS:
   └─ Solo muestra (sin botón)

Estados posibles:
├─ "pendiente" - Recién creado
├─ "en preparacion" - En la cocina
└─ "listo" - Esperando ser servido
```

**Estado (Zustand):**
```javascript
{
  pedidos: [],
  setPedidos: fn,
  cargarPedidos: fn,
  cambiarEstadoPedido: async (id, estado) => PUT /api/pedidos/{id}
}
```

---

## 🔄 FLUJO DE DATOS GENERAL (End-to-End)

### Caso de Uso: Mesero toma pedido → Cocina lo prepara → Mesero lo sirve

```
PASO 1: MESERO CREA PEDIDO
├─ Mesero abre app, selecciona Mesa 5
├─ Agrega 2x Ceviche, 1x Arroz con Pollo
├─ Envía pedido
│
├─ Frontend ejecuta:
│  POST http://localhost:3000/api/pedidos
│  {
│    mesa: "5",
│    items: [
│      { productoId: "1", nombre: "Ceviche", cantidad: 2, precio: 25, subtotal: 50 },
│      { productoId: "3", nombre: "Arroz con Pollo", cantidad: 1, precio: 28, subtotal: 28 }
│    ],
│    total: 78
│  }
│
└─ Backend crea documento en MongoDB:
   {
     _id: ObjectId(...),
     mesa: "5",
     items: [...],
     total: 78,
     estado: "pendiente",
     createdAt: 2025-11-06T22:30:00Z,
     updatedAt: 2025-11-06T22:30:00Z
   }

PASO 2: SOCKET.IO NOTIFICA
├─ Backend emite: io.emit('pedidoNuevo', { _id, mesa, items, ... })
├─ App Cocina recibe en tiempo real
└─ Se agrega a la columna "PENDIENTE"

PASO 3: COCINA VE PEDIDO
├─ Cocinero ve: "Mesa 5 - 2x Ceviche, 1x Arroz"
├─ Click "Preparando"
│
├─ Frontend ejecuta:
│  PUT http://localhost:3000/api/pedidos/{id}
│  { estado: "en preparacion" }
│
└─ Backend actualiza documento:
   { estado: "en preparacion", updatedAt: ahora }

PASO 4: SOCKET.IO NOTIFICA
├─ Backend emite: io.emit('pedidoActualizado', { _id, estado: "en preparacion", ... })
├─ App Cocina mueve tarjeta a columna "PREPARANDO"
└─ App Mesero ve cambio en monitoreo (próximo polling)

PASO 5: COMIDA LISTA
├─ Cocinero prepara comida
├─ Click "✅ Listo"
│
├─ Frontend ejecuta:
│  PUT http://localhost:3000/api/pedidos/{id}
│  { estado: "listo" }
│
└─ Backend actualiza documento:
   { estado: "listo", updatedAt: ahora }

PASO 6: SOCKET.IO NOTIFICA
├─ Backend emite: io.emit('pedidoActualizado', { _id, estado: "listo", ... })
├─ App Cocina mueve tarjeta a columna "LISTOS"
└─ App Mesero ve en monitoreo que está listo

PASO 7: MESERO SIRVE
├─ Mesero ve "Mesa 5 - LISTO"
├─ Toma bandeja y sirve
└─ Fin del proceso
```

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Colección: productos

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  nombre: "Ceviche",
  categoria: "Entrada",
  precio: 25,
  disponible: true,
  createdAt: ISODate("2025-11-06T20:00:00Z")
}
```

**Campos:**
- `_id`: ID único (generado por MongoDB)
- `nombre`: Texto del producto
- `categoria`: Agrupación (Entrada, Plato Fuerte, Bebida, etc.)
- `precio`: Número en soles
- `disponible`: Boolean (true/false)
- `createdAt`: Fecha de creación

**Operaciones:**
```
CREATE: POST /api/productos
READ:   GET /api/productos
UPDATE: PUT /api/productos/:id
DELETE: DELETE /api/productos/:id
```

---

### Colección: pedidos

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  mesa: "5",
  items: [
    {
      productoId: ObjectId("507f1f77bcf86cd799439011"),
      nombre: "Ceviche",
      cantidad: 2,
      precio: 25,
      subtotal: 50
    },
    {
      productoId: ObjectId("507f1f77bcf86cd799439013"),
      nombre: "Arroz con Pollo",
      cantidad: 1,
      precio: 28,
      subtotal: 28
    }
  ],
  total: 78,
  estado: "pendiente",
  createdAt: ISODate("2025-11-06T22:30:00Z"),
  updatedAt: ISODate("2025-11-06T22:30:00Z")
}
```

**Campos:**
- `_id`: ID único del pedido
- `mesa`: String o número (ej: "5", "12")
- `items`: Array de objetos con detalles
  - `productoId`: Referencia al producto
  - `nombre`: Nombre del producto (desnormalizado)
  - `cantidad`: Cuántos se pidieron
  - `precio`: Precio unitario al momento del pedido
  - `subtotal`: cantidad × precio
- `total`: Suma de todos los subtotales
- `estado`: "pendiente" | "en preparacion" | "listo"
- `createdAt`: Cuándo se creó el pedido
- `updatedAt`: Última actualización

**Operaciones:**
```
CREATE: POST /api/pedidos
READ:   GET /api/pedidos
READ:   GET /api/pedidos/mesa/:mesa
UPDATE: PUT /api/pedidos/:id (cambiar estado)
```

---

## 🎙️ SISTEMA DE AUDIO

**4 sonidos sintetizados con Web Audio API:**

```javascript
audioManager.sonidoNuevoPedido()    // Melodía urgente (800Hz → 600Hz)
audioManager.sonidoExito()          // Campanada (1000Hz)
audioManager.sonidoError()          // Beep bajo (300Hz)
audioManager.sonidoListoUrgente()   // Doble beep (1200Hz + 1000Hz)
```

**Cuándo suenan:**
- Mesero envía pedido → `sonidoExito()`
- Cocina marca como "Preparando" → `sonidoExito()`
- Cocina marca como "Listo" → `sonidoListoUrgente()`
- Error en petición API → `sonidoError()` (no implementado aún)

**Toggle:** Botón 🔊 en esquina superior derecha

---

## 🌐 ARQUITECTURA DE RED

### Frontend (Vite en Puerto 5173)
```
http://localhost:5173/
├─ /admin       (página admin)
├─ /cocina      (página cocina)
└─ /mesero      (página mesero)
```

### Backend (Express en Puerto 3000)
```
http://localhost:3000/
├─ / (sirve React build en prod)
├─ /api/productos
│  ├─ GET    → lista todos
│  ├─ POST   → crear
│  ├─ PUT/:id → actualizar
│  └─ DELETE/:id → eliminar
│
└─ /api/pedidos
   ├─ GET     → lista todos
   ├─ GET/mesa/:mesa → por mesa
   ├─ POST    → crear
   └─ PUT/:id → cambiar estado
```

### Socket.io (Tiempo real)
```
Eventos emitidos por servidor:
├─ productosActualizados: { productos: [] }
├─ pedidoNuevo: { _id, mesa, items, estado }
└─ pedidoActualizado: { _id, mesa, items, estado }
```

**Nota:** Los eventos de Socket.io se usan para notificaciones en tiempo real.
Los cambios también se detectan con polling cada 3 segundos.

---

## 🔐 CORS (Cross-Origin Resource Sharing)

**Orígenes permitidos:**
```javascript
[
  'https://jairham.github.io',           // GitHub Pages
  'https://crispy-octo-spoon.onrender.com', // Render (producción)
  'http://localhost:3000',               // Backend local
  'http://localhost:5173'                // Vite dev (React)
]
```

**Sin esta configuración:** El navegador bloquea peticiones entre
diferentes puertos/dominios por razones de seguridad.

---

## 🚀 FLUJO DE DEPLOY

### Desarrollo Local
```
Terminal 1: npm run dev (backend en :3000)
Terminal 2: cd react-app && npm run dev (frontend en :5173)
```

### Producción - Backend en Render.com
```
1. git push origin main
2. Render detecta cambios
3. Ejecuta: npm install && npm start
4. Sirve en: https://crispy-octo-spoon.onrender.com
```

### Producción - Frontend en Vercel
```
1. git push origin main
2. Vercel detecta cambios
3. Ejecuta: npm run build (en react-app/)
4. Sirve en: https://tu-app.vercel.app
```

---

## 💾 FLUJO DE ESTADO ZUSTAND

**Inicialización:**
```javascript
// App.jsx carga
useEffect(() => {
  cargarProductos();  // GET /api/productos
}, [])
```

**Agregar al carrito:**
```javascript
agregarAlCarrito(productoId, cantidad)
// Zustand: carrito[productoId] += cantidad
```

**Enviar pedido:**
```javascript
crearPedido({ mesa, items, total })
├─ POST /api/pedidos
├─ Espera respuesta
├─ set({ carrito: {} })  // Limpia
└─ Navega a monitoreo
```

**Cambiar estado pedido (Cocina):**
```javascript
cambiarEstadoPedido(pedidoId, "en preparacion")
├─ PUT /api/pedidos/{pedidoId}
├─ GET /api/pedidos (recarga lista)
└─ set({ pedidos: [...] })  // Actualiza estado
```

---

## ⚙️ CONFIGURACIONES IMPORTANTES

### API Base URL (Development vs Production)
```javascript
// En react-app/src/modules/api.js
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:3000/api'           // Desarrollo
  : 'https://crispy-octo-spoon.onrender.com/api'  // Producción
```

### Polling (Actualización automática)
```javascript
// En MeseroPage y CocinaPage
setInterval(() => {
  cargarPedidos();  // GET /api/pedidos cada 3 segundos
}, 3000);
```

### Timeouts de peticiones
```javascript
// Las peticiones fetch tienen timeout implícito del navegador
// Típicamente 30 segundos
```

---

## 🐛 LISTA DE BUGS ACTUALES

1. ❌ **AudioContext no se inicializa automáticamente** - Necesita gesto del usuario
   - Solución: Hacer que el primer click reinicie AudioContext

2. ❌ **CORS bloqueado** - Ya solucionado agregando localhost:5173

3. ❌ **MongoDB no conectado localmente** - Usando mock data
   - Solución: Configurar .env con MONGO_URI real o usar MongoDB Atlas

4. ⚠️ **React Router Future Flag Warnings** - Advertencias de React Router v6
   - No crítico, solo warnings para v7

---

## 📝 RESUMEN: CÓMO RECREAR DESDE CERO

### 1. Backend (Express)
```bash
npm init -y
npm install express cors helmet compression mongoose socket.io
# Crear rutas: /api/productos, /api/pedidos
# Conectar MongoDB
# Habilitar Socket.io
```

### 2. Frontend (React + Vite)
```bash
npm create vite@latest react-app -- --template react
cd react-app
npm install react-router-dom zustand
# Crear 3 páginas: AdminPage, CocinaPage, MeseroPage
# Crear Header con navegación
# Crear store Zustand
# Crear módulo API
```

### 3. Deploy
- Backend → Render.com (conectar GitHub, variables de entorno)
- Frontend → Vercel (conectar GitHub)

---

**¿Quieres que profundice en alguna sección específica?**

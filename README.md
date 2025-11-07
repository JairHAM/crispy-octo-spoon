# 🍽️ Sistema POS Restaurant - Código Limpio & Educativo

Un sistema de gestión para restaurante con **arquitectura modular**, ideal para aprender **Vanilla JavaScript**, **Web Audio API**, y **buenas prácticas de código**.

## 📋 Tabla de contenidos

- [Características](#características)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Módulos](#módulos)
- [Cómo funciona](#cómo-funciona)
- [URLs de demo](#urls-de-demo)
- [Para desarrolladores](#para-desarrolladores)

---

## ✨ Características

✅ **3 Interfaces funcionales:**
- **Admin**: Gestión CRUD de productos
- **Cocina**: Visualización de órdenes con 3 estados
- **Mesero**: Sistema POS para crear órdenes

✅ **Funcionalidades principales:**
- 🔊 Sonidos sintetizados en tiempo real (Web Audio API)
- 📡 Sincronización en tiempo real (Polling cada 3 segundos)
- 🎨 Diseño minimalista, sin frameworks
- 📱 Responsive (funciona en tablet y mobile)
- ⚡ Performance optimizado
- 🧹 Código limpio con 47% menos líneas

---

## 📁 Estructura del proyecto

```
web/
├── src/
│   ├── modules/              # Módulos reutilizables
│   │   ├── api.js            # 127 líneas - Todas las llamadas HTTP
│   │   ├── ui.js             # 260 líneas - Funciones DOM comunes
│   │   ├── audio.js          # 115 líneas - Web Audio API
│   │   └── state.js          # 220 líneas - Manejo de estado global
│   │
│   ├── pages/                # Lógica de interfaces
│   │   ├── admin.js          # 137 líneas - CRUD de productos
│   │   ├── cocina.js         # 89 líneas  - Gestión de órdenes
│   │   └── mesero.js         # 259 líneas - Sistema POS
│   │
│   ├── admin.html            # 74 líneas - HTML puro
│   ├── cocina.html           # 54 líneas - HTML puro
│   ├── mesero.html           # 86 líneas - HTML puro
│   └── styles.css            # 460 líneas - CSS minimal
│
├── server.js                 # Express backend
├── package.json              # Dependencias (solo Express, MongoDB)
└── README.md                 # Este archivo
```

**Total: ~1,880 líneas (vs 3,500+ originales con Bootstrap)**

---

## 🔧 Módulos

### 1. **api.js** - Comunicación HTTP

Centraliza todas las llamadas al backend. Patrón: **1 función = 1 endpoint**

```javascript
// Importar
import { getProductos, createPedido, updatePedidoEstado } from '../modules/api.js';

// Usar
const productos = await getProductos();
const pedido = await createPedido({ mesa: 1, items: [...] });
await updatePedidoEstado(id, 'listo');
```

**Funciones disponibles:**
- Productos: `getProductos()`, `createProducto()`, `updateProducto()`, `deleteProducto()`
- Pedidos: `getPedidos()`, `createPedido()`, `updatePedidoEstado()`, `getPedidosMesa()`

---

### 2. **ui.js** - Funciones DOM Comunes

Utilidades reutilizables para manipular el DOM sin jQuery.

```javascript
import { showToast, mostrarPaso, crearElemento, formatearMoneda } from '../modules/ui.js';

// Mostrar notificación
showToast('Pedido creado', 'success');

// Cambiar de sección
mostrarPaso('carrito');

// Crear elemento
const btn = crearElemento('button', { class: 'btn-primary' }, 'Enviar');
document.body.appendChild(btn);

// Formatear dinero
formatearMoneda(123.45); // → "S/. 123.45"
```

---

### 3. **audio.js** - Web Audio API

Reproduce sonidos sintetizados (sin archivos .mp3).

```javascript
import { audioManager } from '../modules/audio.js';

// Reproducir sonidos
await audioManager.sonidoNuevoPedido();  // 2 beeps graves
await audioManager.sonidoExito();        // Escala ascendente
await audioManager.sonidoListoUrgente(); // 3 beeps agudos

// Habilitar/deshabilitar
audioManager.toggle(false); // Silencio
```

**Sonidos incluidos:**
- 🔔 `sonidoNuevoPedido()` - Nuevo pedido llega (400→500 Hz)
- ✅ `sonidoExito()` - Acción completada (600→800→1000 Hz)
- 🚨 `sonidoListoUrgente()` - Plato listo (3× 1000 Hz)

---

### 4. **state.js** - Manejo de Estado

**Single Source of Truth** para toda la aplicación.

```javascript
import { state } from '../modules/state.js';

// Productos
state.setProductos(productos);
state.getProductos();
state.obtenerProductoPorId(id);

// Carrito
state.agregarAlCarrito(id, nombre, precio);
state.reducirDelCarrito(id);
state.calcularTotalCarrito(); // → 123.45

// Pedidos
state.setPedidos(pedidos);
state.getPedidosPorEstado('listo');
state.detectarNuevosPedidos(); // Devuelve IDs nuevos

// Mesa
state.setMesaSeleccionada(5);
state.getMesaSeleccionada(); // → 5
```

---

## 🔄 Cómo funciona

### Flujo de datos

```
┌─────────────────┐
│  ADMIN crea     │
│  "Hamburguesa"  │
│ (POST /api)     │
└────────┬────────┘
         ↓
    MongoDB
    (guardada)
         ↓
┌─────────────────────┐
│  MESERO solicita    │
│  (GET /api)         │
│  Agrega cantidad    │
│  Envía pedido       │
│  (POST /api)        │
└────────┬────────────┘
         ↓
    MongoDB
    (pedido guardado)
         ↓
┌──────────────────────┐
│  COCINA monitorea    │
│  (GET /api c/3 seg)  │
│  🔊 SUENA            │
│  Ve pedido nuevo     │
│  Presiona botones    │
│  (PUT /api)          │
└──────────────────────┘
```

### Estados de un pedido

```
PENDIENTE → PREPARANDO → LISTO → SERVIDO
   🔊         🔊          🚨      ✅
(nuevo)   (empieza)   (urgente)  (final)
```

---

## 🎯 Para desarrolladores

### 1. Entender los módulos

**Cada módulo es independiente:**
- `api.js` → Cambiar URL base, agregar endpoints
- `ui.js` → Agregar funciones DOM nuevas
- `audio.js` → Modificar frecuencias de sonidos
- `state.js` → Cambiar estructura de datos

### 2. Agregar una nueva funcionalidad

**Ejemplo: Agregar descuento en carrito**

1. En `state.js`, agregar:
```javascript
aplicarDescuento(porcentaje) {
    this.descuento = porcentaje;
}
```

2. En `mesero.js`, usar:
```javascript
state.aplicarDescuento(10);
const totalConDescuento = state.calcularTotalCarrito() * 0.9;
```

### 3. Modificar estilos

Todo está en `src/styles.css` (460 líneas). No necesitas framework.

### 4. Cambiar sonidos

En `src/modules/audio.js`, modificar frecuencias:
```javascript
// Cambiar beep grave a más agudo
await this.reproducirBeep(800, 150); // Era 400
```

---

## 📡 URLs de Demo

**En producción (Render.com):**

```
Admin:   https://crispy-octo-spoon.onrender.com/src/admin.html
Cocina:  https://crispy-octo-spoon.onrender.com/src/cocina.html
Mesero:  https://crispy-octo-spoon.onrender.com/src/mesero.html
```

**Localmente:**

```bash
npm install
npm start
# Abre http://localhost:3000/src/admin.html
```

---

## 💡 Lecciones educativas

Este código enseña:

1. **Modularización** - Separar responsabilidades
2. **APIs REST** - Fetch, GET/POST/PUT/DELETE
3. **Web Audio API** - Sonidos sintetizados
4. **DOM Manipulation** - Sin jQuery
5. **Event Handling** - Click, input, etc
6. **State Management** - Datos centralizados
7. **Async/Await** - Programación asincrónica
8. **CSS Grid/Flex** - Layouts responsive
9. **Buenas prácticas** - Clean code, naming, etc

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| **Líneas totales** | ~1,880 |
| **Módulos** | 4 |
| **Interfaces** | 3 |
| **Endpoints API** | 12+ |
| **Sonidos** | 4 tipos |
| **Sin dependencias frontend** | ✅ |
| **Responsive** | ✅ |
| **Dark theme** | ✅ |

---

## 🚀 Próximos pasos

**Opción 1: Seguir con Vanilla JS**
- Agregar más características
- Mejorar performance
- Agregar testing

**Opción 2: Migrar a React**
- Usar los módulos como base lógica
- Crear componentes React
- Usar React hooks para state

---

## 📝 Licencia

Código educativo. Libre de usar y modificar.

---

**Creado con ❤️ para aprender**

*Última actualización: Noviembre 6, 2025*

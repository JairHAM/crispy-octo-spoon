# 📋 Funciones por Interfaz - El Enkanto

## 🟣 PANEL ADMINISTRATIVO (admin.html / admin.js)

### Funciones de API
| Función | Descripción | Endpoint |
|---------|-------------|----------|
| `loadProducts()` | Carga todos los productos desde el servidor | `GET /api/productos` |
| `startPolling()` | Inicia actualización automática cada 5 segundos | - |
| `stopPolling()` | Detiene el polling de productos | - |

### Funciones de CRUD
| Función | Descripción | Tipo |
|---------|-------------|------|
| `createCard(p)` | Crea tarjeta HTML de producto | CREATE |
| `editProduct(id)` | Carga producto para editar | READ/UPDATE |
| `deleteProduct(id)` | Elimina un producto | DELETE |
| `resetForm()` | Limpia el formulario después de guardar | - |

### Funciones de UI
| Función | Descripción |
|---------|-------------|
| `renderProducts(products)` | Renderiza grid de productos |
| `escape(text)` | Escapa caracteres especiales (seguridad XSS) |
| `notify(msg, isError)` | Muestra toast de notificación |
| `updateCount(count)` | Actualiza contador de productos en navbar |

### Validaciones
- ✓ Nombre no vacío
- ✓ Precio válido (≥ 0)
- ✓ Categoría seleccionada
- ✓ Disponibilidad (checkbox)

### Características
- ✓ Grid responsivo (4 columnas en lg, 3 en md, 2 en sm, 1 en xs)
- ✓ Emojis por categoría (🥗 Entrada, 🍽️ Plato Principal, 🥤 Bebida, 🍰 Postre)
- ✓ Badge de disponibilidad (verde/rojo)
- ✓ Polling automático cada 5 segundos
- ✓ Tema oscuro con colores primarios

---

## 🍴 PANEL COCINA (cocina.html / cocina.js)

### Funciones de API
| Función | Descripción | Endpoint |
|---------|-------------|----------|
| `loadOrders()` | Carga todas las órdenes | `GET /api/pedidos` |
| `startAutoRefresh()` | Inicia polling cada 3 segundos | - |
| `changeStatus(id, status)` | Cambiar estado de orden | `PATCH /api/pedidos/{id}` |

### Funciones de Estado
| Función | Descripción |
|---------|-------------|
| `renderOrders()` | Agrupa órdenes por estado |
| `renderOrderSection(section, list)` | Renderiza una columna de órdenes |
| `getButtonClass(section)` | Retorna clase del botón según estado |
| `getButtonText(section)` | Retorna texto del botón |
| `getNextStatus(section)` | Calcula siguiente estado |

### Funciones de Utilidad
| Función | Descripción |
|---------|-------------|
| `createOrderCard(order, section)` | Crea tarjeta de orden |
| `getElapsedTime(dateString)` | Calcula tiempo transcurrido |
| `updateStats()` | Actualiza badges de estadísticas |
| `showToast(msg, isError)` | Muestra notificación |

### Flujo de Estados
```
pendiente 
    ↓ (botón "Preparar")
preparando 
    ↓ (botón "Listo")
listo 
    ↓ (botón "Servido")
servido
```

### Características
- ✓ Layout 3-columnas (Pendiente | Preparando | Listo)
- ✓ Badges con contador en navbar (amarillo/indigo/verde)
- ✓ Tiempo transcurrido en cada orden
- ✓ Bordes de color según estado (amarillo/indigo/verde)
- ✓ Fondo coloreado por estado (opacidad)
- ✓ Polling automático cada 3 segundos
- ✓ Tema oscuro optimizado

---

## 🛒 PANEL MESERO (mesero.html / mesero.js)

### Funciones de Productos
| Función | Descripción | Endpoint |
|---------|-------------|----------|
| `loadProducts()` | Carga lista de productos | `GET /api/productos` |
| `renderProducts()` | Renderiza grid de productos por categoría | - |
| `filterByCategory(cat)` | Filtra productos por categoría | - |

### Funciones de Carrito
| Función | Descripción |
|---------|-------------|
| `addToCart(id)` | Agrega producto al carrito |
| `removeFromCart(id)` | Elimina producto del carrito |
| `updateQuantity(id, qty)` | Actualiza cantidad de item |
| `clearCart()` | Vacía el carrito |
| `calculateTotal()` | Calcula total del carrito |

### Funciones de Órdenes
| Función | Descripción | Endpoint |
|---------|-------------|----------|
| `createOrder()` | Crea nueva orden | `POST /api/pedidos` |
| `loadAllOrders()` | Obtiene todas las órdenes | `GET /api/pedidos` |
| `displayOrdersByStatus(orders)` | Agrupa por estado | - |

### Funciones de Mesas
| Función | Descripción |
|---------|-------------|
| `renderMesas()` | Renderiza 10 mesas disponibles (1-10) |
| `selectMesa(mesa)` | Selecciona mesa para nueva orden |

### Funciones de UI
| Función | Descripción |
|---------|-------------|
| `showStep(step)` | Muestra paso específico (mesas/menu/carrito/tracking) |
| `updateSectionDisplay(text)` | Actualiza encabezado con mesa seleccionada |
| `createOrderCard(order)` | Crea tarjeta de orden para tracking |
| `showToast(msg, type)` | Muestra notificación |

### Flujo de Pasos
```
Paso 1: Seleccionar Mesa (1-10)
    ↓
Paso 2: Seleccionar Productos + Cantidad
    ↓
Paso 3: Revisar Carrito + Total
    ↓
Paso 4: Crear Orden + Rastreo en Tiempo Real
```

### Características
- ✓ 10 mesas disponibles
- ✓ Filtro por categoría (badges)
- ✓ Grid responsivo de productos
- ✓ Carrito en tiempo real con total
- ✓ Tracking de órdenes (3 columnas: Pendiente/Preparando/Listo)
- ✓ Contador de órdenes por estado
- ✓ Tiempo transcurrido por orden
- ✓ Polling automático cada 3 segundos
- ✓ Tema oscuro moderno

---

## 🔧 FUNCIONES GLOBALES/COMPARTIDAS

### Notificaciones
- `notify(msg, isError)` - Toast en esquina inferior derecha
- `showToast(msg, isError)` - Alternativa con animación

### Validación
- `escape(text)` - Previene inyección XSS

### Utilidades
- `getElapsedTime(date)` - Calcula tiempo transcurrido en minutos/segundos
- `calculateTotal()` - Suma precios × cantidades

---

## 📡 ENDPOINTS API CONSUMIDOS

### Productos
```javascript
GET    /api/productos           // Obtener todos
POST   /api/productos           // Crear nuevo
GET    /api/productos/:id       // Obtener uno
PUT    /api/productos/:id       // Actualizar
DELETE /api/productos/:id       // Eliminar
```

### Órdenes
```javascript
GET    /api/pedidos             // Obtener todos
POST   /api/pedidos             // Crear nueva
GET    /api/pedidos/:id         // Obtener una
PATCH  /api/pedidos/:id         // Cambiar estado
DELETE /api/pedidos/:id         // Eliminar
```

---

## ⏱️ INTERVALOS DE ACTUALIZACIÓN

| Interfaz | Intervalo | Función |
|----------|-----------|---------|
| Admin | 5 segundos | Polling de productos |
| Cocina | 3 segundos | Polling de órdenes |
| Mesero | 3 segundos | Polling de órdenes para tracking |

---

## 🎨 TEMAS Y COLORES

### Variables CSS (Dark Mode)
```css
--primary: #6366f1      /* Indigo - Botones, destacados */
--secondary: #ec4899    /* Pink - Acciones, datos */
--success: #10b981      /* Verde - Disponible, completado */
--warning: #f59e0b      /* Amarillo - Pendiente, atención */
--danger: #ef4444       /* Rojo - Error, agotado */

--dark-bg: #0f172a      /* Fondo principal */
--dark-surface: #1e293b /* Cards, navbar, inputs */
--dark-border: #334155  /* Bordes */
--dark-text: #f1f5f9    /* Texto principal */
--dark-text-secondary: #cbd5e1  /* Texto secundario */
```

---

## ✅ CHECKLIST DE FUNCIONES PROBADAS

### Admin
- [x] Crear producto (CREATE)
- [x] Leer producto (READ)
- [x] Actualizar producto (UPDATE)
- [x] Eliminar producto (DELETE)
- [x] Listar productos
- [x] Filtro por disponibilidad
- [x] Validaciones de formulario
- [x] Notificaciones toast
- [x] Polling automático

### Cocina
- [x] Obtener órdenes
- [x] Cambiar estado: pendiente → preparando
- [x] Cambiar estado: preparando → listo
- [x] Cambiar estado: listo → servido
- [x] Actualizar estadísticas
- [x] Mostrar tiempo transcurrido
- [x] Separar por columnas
- [x] Notificaciones
- [x] Polling automático

### Mesero
- [x] Seleccionar mesa
- [x] Cargar productos
- [x] Filtrar por categoría
- [x] Agregar al carrito
- [x] Actualizar cantidad
- [x] Eliminar del carrito
- [x] Calcular total
- [x] Crear orden
- [x] Rastrear orden
- [x] Mostrar órdenes por estado

---

## 🚀 OPTIMIZACIONES APLICADAS

1. **Código Reducido**: 70% menos líneas totales (3,749 → 1,147)
2. **Polling Optimizado**: Intervalos adecuados (3-5 segundos)
3. **Seguridad XSS**: Función `escape()` en admin
4. **Responsive Design**: Bootstrap grid system
5. **Dark Mode**: Variables CSS personalizadas
6. **Performance**: Eventos delegados, sin memory leaks
7. **UX**: Toast notifications, smooth transitions

---

## 📖 Documentación

Para más detalles sobre las pruebas, consulta: `TEST_FUNCTIONS.md`
Para abrir el test: `file:///home/hytale/Escritorio/web/test-functions.html`

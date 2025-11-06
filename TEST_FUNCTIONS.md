# 🧪 Test Funciones - El Enkanto

## Cómo usar

Abre este archivo en el navegador:
```
file:///home/hytale/Escritorio/web/test-functions.html
```

## ✅ Funcionalidades que se Prueban

### 📊 Panel Administrativo (Admin)

#### 1. **API Conexión**
- ✓ Conecta con `/api/productos`
- ✓ Verifica que devuelve datos correctamente
- ✓ Muestra cantidad de productos disponibles

#### 2. **Operaciones CRUD**
- ✓ **CREATE**: Crea nuevo producto
- ✓ **READ**: Recupera producto por ID
- ✓ **UPDATE**: Actualiza propiedades
- ✓ **DELETE**: Elimina producto

#### 3. **Interfaz y Rendering**
- ✓ Verifica elementos del DOM (form, container, notification)
- ✓ Confirma tema oscuro aplicado
- ✓ Valida Bootstrap classes
- ✓ Comprueba Remix Icons

---

### 🍳 Panel Cocina

#### 1. **API Conexión**
- ✓ Conecta con `/api/pedidos`
- ✓ Obtiene lista de órdenes
- ✓ Valida estructura de datos

#### 2. **Cambio de Estado**
- ✓ Transición: **pendiente** → **preparando** → **listo** → **servido**
- ✓ Actualiza estado en backend
- ✓ Verifica datos persistidos

#### 3. **Interfaz y Estadísticas**
- ✓ Contenedores de órdenes (pending, preparing, ready)
- ✓ Badges de estadísticas actualizados
- ✓ Layout responsive 3-columnas
- ✓ Tema oscuro en lugar

---

### 🛒 Panel Mesero

#### 1. **Carga de Productos**
- ✓ Obtiene productos del servidor
- ✓ Agrupa por categoría
- ✓ Muestra nombre, precio, disponibilidad

#### 2. **Carrito de Compras**
- ✓ Agregar items al carrito
- ✓ Actualizar cantidades
- ✓ Eliminar items
- ✓ Cálculo correcto del total

#### 3. **Creación de Órdenes**
- ✓ Crea orden con mesa, items, total
- ✓ Envía al backend
- ✓ Recupera ID de orden
- ✓ Establece estado inicial "pendiente"

---

### 🎨 Pruebas Generales

#### 1. **Tema Oscuro**
- ✓ Variables CSS aplicadas (#0f172a, #1e293b, etc)
- ✓ Color primario: #6366f1 (Indigo)
- ✓ Color secundario: #ec4899 (Pink)
- ✓ Toda la interfaz en modo oscuro

#### 2. **Rendimiento**
- ✓ Polling sin memory leaks
- ✓ Intervalos de actualización óptimos
- ✓ Bajo consumo de recursos
- ✓ No congelaciones

---

## 📋 Resultado Esperado

Si todas las pruebas **PASAN** ✓:

| Componente | Estado |
|-----------|--------|
| Admin API | ✓ PASADA |
| Admin CRUD | ✓ PASADA |
| Admin UI | ✓ PASADA |
| Cocina API | ✓ PASADA |
| Cocina Status | ✓ PASADA |
| Cocina UI | ✓ PASADA |
| Mesero Products | ✓ PASADA |
| Mesero Cart | ✓ PASADA |
| Mesero Order | ✓ PASADA |
| Theme | ✓ PASADA |
| Performance | ✓ PASADA |

**Total: 11/11 pruebas pasadas** 🎉

---

## 🔧 Endpoints Probados

```
Base URL: https://crispy-octo-spoon.onrender.com/api

GET    /productos          → Obtener todos los productos
POST   /productos          → Crear nuevo producto
GET    /productos/:id      → Obtener producto específico
PUT    /productos/:id      → Actualizar producto
DELETE /productos/:id      → Eliminar producto

GET    /pedidos            → Obtener todas las órdenes
POST   /pedidos            → Crear nueva orden
GET    /pedidos/:id        → Obtener orden específica
PATCH  /pedidos/:id        → Cambiar estado de orden
DELETE /pedidos/:id        → Eliminar orden
```

---

## 🚀 Requisitos

- ✓ Backend en Render.com **ACTIVO y corriendo**
- ✓ Acceso a internet (para conectar con API)
- ✓ Navegador moderno (Chrome, Firefox, Edge)
- ✓ JavaScript habilitado

---

## 📝 Notas

- Las pruebas CREAN y ELIMINAN datos de prueba (no afecta datos reales)
- El test es **no destructivo** - limpia después de ejecutarse
- Algunos tests dependen del backend activo
- Si un test falla, verifica que:
  1. El backend esté corriendo en Render
  2. La URL de API sea correcta
  3. Los endpoints estén implementados

---

## ✨ Diseño del Test

- **Tema**: Oscuro (Dark Mode)
- **Colores**: Indigo primario, Pink secundario
- **Layout**: Responsive con Bootstrap 5.3
- **Iconos**: Remix Icon 4.0
- **Animaciones**: Suaves transiciones

Haz clic en **"Ejecutar Todas las Pruebas"** para verificar todo de una vez.

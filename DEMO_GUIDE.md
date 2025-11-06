# 🎬 GUÍA DE DEMO - INSTRUCCIONES PARA STAKEHOLDERS

## 📍 Acceso a la Aplicación

**URLs de Demo (24/7 disponibles):**
```
🔧 Admin (Gestión de Productos)
   https://crispy-octo-spoon.onrender.com/admin.html

🍳 Cocina (Vista de Órdenes en Preparación)
   https://crispy-octo-spoon.onrender.com/cocina.html

👨‍💼 Mesero/POS (Sistema de Creación de Órdenes)
   https://crispy-octo-spoon.onrender.com/mesero.html
```

---

## 🎯 FLUJO DE DEMOSTRACIÓN

### 1️⃣ **Preparación Inicial (Admin)**

Abrir en navegador:
```
https://crispy-octo-spoon.onrender.com/admin.html
```

**Acciones:**
- Ver lista de productos disponibles
- Verificar que los productos tengan precios y descripciones
- Nota: La BD fue limpiada pero contiene productos de ejemplo

---

### 2️⃣ **Abre Mesero en otra pestaña**

```
https://crispy-octo-spoon.onrender.com/mesero.html
```

**Interfaz muestra:**
- Selector de mesa (1-12)
- Formulario para agregar items al pedido
- Botón "ENVIAR PEDIDO" (rojo)
- Historial de pedidos por estado

**Importante:** 🔊 **Habilitar audio en el navegador**
- Algunos navegadores requieren interacción usuario para permitir audio
- Se mostrará un botón de audio en pantalla

---

### 3️⃣ **Abre Cocina en tercera pestaña**

```
https://crispy-octo-spoon.onrender.com/cocina.html
```

**Interfaz muestra:**
- 3 columnas: PENDIENTE | PREPARANDO | LISTOS
- Cada pedido es una tarjeta con:
  - Número de pedido
  - Mesa
  - Items y cantidades
  - Botones para cambiar estado

**Botón flotante (rojo):** Toggle de audio

---

## 🎮 ESCENARIO DE DEMOSTRACIÓN

### Demo Simple (5 minutos)

**Paso 1:** En MESERO, selecciona Mesa 5
```
- Agregar 2 x Hamburguesa
- Agregar 1 x Refresco
- CLIC en "ENVIAR PEDIDO"
```
✅ **Esperado:** Se escucha 🔊 **SONIDO GRAVE** (ping-ping) en COCINA

---

**Paso 2:** En COCINA, verás el pedido en columna PENDIENTE
```
- CLIC en "PREPARANDO"
```
✅ **Esperado:** 
- Pedido se mueve a columna PREPARANDO
- Se escucha 🔊 **SONIDO ASCENDENTE** (ping-pong-ping)
- MESERO también detecta cambio

---

**Paso 3:** En COCINA, confirma que está listo
```
- CLIC en "LISTO"
```
✅ **Esperado:**
- Pedido se mueve a columna LISTOS
- Se escucha 🔊 **SONIDO URGENTE ALTO** (3 beeps agudos)
- MESERO suena con el mismo tono urgente
- MESERO actualiza estado a "Listo"

---

**Paso 4:** En MESERO, confirma entrega
```
- CLIC en botón "MARCAR SERVIDO"
```
✅ **Esperado:**
- Estado pasa a "Servido"
- Se escucha 🔊 **SONIDO DE ÉXITO** (ping-pong-ping ascendente)

---

## 🔊 GUÍA DE SONIDOS

| Situación | Sonido | Descripción |
|-----------|--------|-------------|
| **Nuevo Pedido Llega** | 🔊 Grave (ping-ping) | Frecuencia: 400-500 Hz |
| **Inicio Preparación** | 🔊 Ascendente (ping-pong-ping) | Frecuencia: 600-800-1000 Hz |
| **Plato Listo** | 🔊 Urgente (3 beeps agudos) | Frecuencia: 800-1000-1200 Hz |
| **Pedido Servido** | 🔊 Éxito (escala ascendente) | Frecuencia: 600-800-1000 Hz |

---

## 🧪 PRUEBAS AVANZADAS (Opcional)

### Test de Sincronización en Tiempo Real

1. Abre MESERO y COCINA lado a lado
2. Crea un pedido en MESERO
3. Observa que aparece inmediatamente en COCINA (<1 segundo)
4. Cambia estado en COCINA
5. Observa que MESERO actualiza en <3 segundos

---

### Test de Múltiples Pedidos

1. Crea 3-4 pedidos diferentes en MESERO
2. En COCINA, cambia algunos a PREPARANDO
3. Sube otros a LISTO
4. Verifica que cada sonido es diferente según la acción
5. Confirma sincronización entre interfaces

---

### Test de Persistencia

1. Crea un pedido y llévalo a "Listo"
2. Actualiza la página de MESERO (F5)
3. El pedido sigue en estado "Listo" (datos persisten)
4. Actualiza página de COCINA
5. El pedido sigue en columna LISTOS

---

## ⚠️ NOTAS DE SOPORTE

### Si no suena audio:

1. **Verificar que audio esté habilitado:**
   - Botón flotante rojo en COCINA/MESERO
   - Debe estar en color ROJO (habilitado)

2. **Permitir audio del navegador:**
   - Chrome/Edge: Primer acceso pregunta por permisos
   - Firefox: Clic en icono de audio mudo y permitir

3. **Volumen del equipo:**
   - Verificar que volumen no esté silenciado
   - Volumen de navegador debe estar al máximo

### Si hay latencia:

- Normal: <100ms de latencia esperada
- Render.com usa 1 dynos (free tier)
- Si hay problemas, contactar soporte técnico

---

## 📱 REQUISITOS TÉCNICOS

- **Navegadores soportados:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Resolución mínima:** 1024x768 (funciona en tablet)
- **Internet:** Conexión estable (cualquier velocidad)
- **Audio:** Altavoces o audífonos (requerido para demo completa)
- **JavaScript:** Habilitado (requerido)

---

## 🎁 CARACTERÍSTICAS PRINCIPALES

✅ **Interface Responsiva**
- Funciona en desktop, tablet, smartphone
- Diseño moderno con Bootstrap 5.3

✅ **Tiempo Real (Socket.io)**
- Sincronización instantánea entre interfaces
- Sin necesidad de refrescar

✅ **Audio Inteligente**
- Sintetizado (no requiere descargas)
- Diferente sonido por cada acción
- Toggle de audio en interfaz

✅ **Persistencia de Datos**
- MongoDB almacena todos los pedidos
- Datos disponibles después de actualizar página

✅ **Disponibilidad 24/7**
- GitHub Actions mantiene servidor activo
- Ping automático cada 5 minutos
- Sin tiempo de inactividad

---

## 📞 SOPORTE DURANTE DEMO

Si algo no funciona:

1. **Actualizar página (F5)** - Resuelve 90% de problemas
2. **Limpiar cookies/cache** - DevTools → Application → Clear Storage
3. **Revisar consola (F12)** - Buscar mensajes de error
4. **Verificar URLs** - Usar URLs exactas de arriba
5. **Contactar técnico** - Si persiste el problema

---

## 📊 MÉTRICAS DE ÉXITO

La demo es exitosa si:

- ✅ Mesero puede crear pedidos
- ✅ Cocina ve pedidos en tiempo real
- ✅ Audio suena en cada transición
- ✅ Estados cambian sin errores
- ✅ Ambas interfaces sincronizadas
- ✅ Ningún timeout o crash

---

## 🎯 PUNTOS CLAVE A DESTACAR

1. **Interfaz Moderna:** Bootstrap 5 con tema oscuro profesional
2. **Sonidos Inteligentes:** Diferentes para cada evento importante
3. **Tiempo Real:** Sin delays perceptibles
4. **Escalabilidad:** Arquitectura lista para múltiples mesas/cocinas
5. **Confiabilidad:** Sistema anti-sleep de 24/7

---

_Guía de Demo - Versión 1.0_  
_Noviembre 6, 2025_

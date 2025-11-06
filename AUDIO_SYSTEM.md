# 🔊 Sistema de Notificaciones de Audio

Documentación del sistema de sonidos implementado en la aplicación El Enkanto.

## 📋 Contenido

1. [Descripción General](#descripción-general)
2. [Sonidos Disponibles](#sonidos-disponibles)
3. [Integración en Interfaces](#integración-en-interfaces)
4. [Uso de la API](#uso-de-la-api)
5. [Configuración](#configuración)

---

## Descripción General

El sistema de audio utiliza **Web Audio API** para generar tonos sintetizados en tiempo real. No requiere archivos de audio externos, lo que reduce la carga del servidor y aumenta la compatibilidad.

**Características:**
- ✅ Sin dependencias externas
- ✅ Compatible con todos los navegadores modernos
- ✅ Generación de audio en tiempo real
- ✅ Control de volumen dinámico
- ✅ Toggle para activar/desactivar sonidos

---

## Sonidos Disponibles

### 1. **playOrderReady()** - Pedido Listo ✅

Reproducido cuando un pedido está listo para servir.

```
Frecuencias: 800Hz → 1000Hz → 1200Hz
Duración: 150ms + 150ms + 200ms
Tipo: 3 beeps progresivos
Volumen: 0.7 (70%)
```

**Dónde se usa:**
- `cocina.js`: Cuando marcas un pedido como "listo" (línea ~105)
- `mesero.js`: Cuando detecta nuevos pedidos listos (línea ~43)

---

### 2. **playNewOrder()** - Nuevo Pedido 📢

Reproducido cuando llega un nuevo pedido a la cocina.

```
Frecuencias: 400Hz → 500Hz
Duración: 200ms + 200ms
Tipo: 2 beeps bajos (pulsante)
Volumen: 0.7 (70%)
```

**Dónde se usa:**
- `cocina.js`: Cuando llega un nuevo pedido pendiente (línea ~25)

---

### 3. **playError()** - Error ⚠️

Reproducido para indicar errores o alertas.

```
Frecuencias: 300Hz × 2
Duración: 100ms + 100ms
Tipo: Doble tono de alerta
Volumen: 0.7 (70%)
```

**Dónde se usa:**
- Disponible para futuras implementaciones

---

### 4. **playSuccess()** - Confirmación ✨

Reproducido para confirmaciones exitosas.

```
Frecuencias: 600Hz → 800Hz → 1000Hz
Duración: 100ms + 100ms + 150ms
Tipo: 3 tonos ascendentes (escala musical)
Volumen: 0.7 (70%)
```

**Dónde se usa:**
- Disponible para futuras implementaciones

---

## Integración en Interfaces

### COCINA (cocina.html / cocina.js)

```javascript
// Nuevo pedido llega
if (newPendingOrders.length > oldPendingCount) {
    soundManager.playNewOrder();
}

// Cuando marcas como listo
if (newStatus === 'listo') {
    soundManager.playOrderReady();
}

// Toggle de sonidos (botón flotante rojo)
function toggleSound() {
    const enabled = soundManager.toggle();
    // Cambia icono: volumen-2-line ↔ volumen-mute-2-line
}
```

**Botón de Control:**
- Ubicación: Abajo a la izquierda (flotante)
- Color: Primario (#6366f1)
- Icono: ri-volume-2-line (activo) / ri-volume-mute-2-line (mudo)

### MESERO (mesero.html / mesero.js)

```javascript
// Detecta cuando hay nuevos pedidos listos
if (ready.length > parseInt(oldReady)) {
    soundManager.playOrderReady();
}

// Monitoreo automático cada 3 segundos
setInterval(loadAllOrders, 3000);
```

**Funcionamiento:**
- Monitoreo automático sin interacción del usuario
- Suena cuando detecta nuevos pedidos en estado "listo"
- Actualiza contador automáticamente

### ADMIN (admin.html)

No incluye sonidos (no necesarios para esta interfaz)

---

## Uso de la API

### Reproducir Sonidos

```javascript
// Pedido listo
soundManager.playOrderReady();

// Nuevo pedido
soundManager.playNewOrder();

// Error
soundManager.playError();

// Confirmación
soundManager.playSuccess();
```

### Control de Volumen

```javascript
// Establecer volumen (0-1)
soundManager.setVolume(0.5);  // 50%
soundManager.setVolume(0.9);  // 90%
soundManager.setVolume(0.3);  // 30%

// Obtener volumen actual
console.log(soundManager.volume);  // 0.7 (por defecto)
```

### Activar/Desactivar Sonidos

```javascript
// Toggle
const isEnabled = soundManager.toggle();
console.log(isEnabled);  // true o false

// Verificar si está activado
if (soundManager.enabled) {
    console.log('Sonidos activados');
}
```

---

## Configuración

### Archivo: `sonidos.js`

**Variables configurables:**

```javascript
// Volumen por defecto (línea ~5)
this.volume = 0.7;  // 70%

// Duración de beeps (se pueden ajustar):
// playOrderReady():  150ms, 150ms, 200ms
// playNewOrder():    200ms, 200ms
// playError():       100ms, 100ms
// playSuccess():     100ms, 100ms, 150ms

// Frecuencias (se pueden cambiar):
// Bajas:   300Hz, 400Hz, 500Hz, 600Hz
// Medias:  800Hz, 1000Hz
// Altas:   1200Hz
```

### Ajustar Frecuencias

Para cambiar las frecuencias de los sonidos, edita `sonidos.js`:

```javascript
// Antes
playOrderReady() {
    setTimeout(() => this.createBeep(800, 150), 0);
    setTimeout(() => this.createBeep(1000, 150), 200);
    setTimeout(() => this.createBeep(1200, 200), 400);
}

// Después (ejemplo: tonos más bajos)
playOrderReady() {
    setTimeout(() => this.createBeep(600, 150), 0);
    setTimeout(() => this.createBeep(800, 150), 200);
    setTimeout(() => this.createBeep(1000, 200), 400);
}
```

### Ajustar Volumen

**Por defecto:** 70%

Para cambiar globalmente, edita `sonidos.js`:

```javascript
// Línea ~5
this.volume = 0.5;  // Cambiar a 50%
```

O ajustar dinámicamente desde la consola:

```javascript
soundManager.setVolume(0.6);  // 60%
```

---

## Troubleshooting

### El audio no se escucha

1. **Verifica el volumen del navegador** (esquina superior derecha)
2. **Verifica el volumen del sistema** (barra de tareas)
3. **Recarga la página** (F5 o Ctrl+F5)
4. **Abre la consola** (F12) y ejecuta:
   ```javascript
   soundManager.setVolume(0.9);  // Máximo volumen
   soundManager.playOrderReady();  // Prueba
   ```

### AudioContext no se reanuda

El navegador puede estar bloqueando el audio. Solución:

```javascript
// Esto se hace automáticamente, pero puedes forzarlo:
await soundManager.audioContext.resume();
```

### Sonidos muy bajos/altos

Ajusta el volumen:

```javascript
// Muy bajo (aumentar)
soundManager.setVolume(0.9);

// Muy alto (disminuir)
soundManager.setVolume(0.3);
```

---

## Próximas Optimizaciones

- [ ] Persistir volumen en `localStorage`
- [ ] Notificación visual + sonido simultáneo
- [ ] Diferentes sonidos por tipo de plato
- [ ] Configuración de sonidos en panel de admin
- [ ] Historial de eventos de audio

---

## Referencias

- **Web Audio API**: https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API
- **OscillatorNode**: https://developer.mozilla.org/es/docs/Web/API/OscillatorNode
- **Frecuencias de notas musicales**: https://en.wikipedia.org/wiki/Piano_key_frequencies

---

**Última actualización:** 6 de noviembre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Funcional

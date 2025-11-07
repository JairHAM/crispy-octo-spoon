/**
 * UI.js - Funciones comunes de interfaz
 * Responsabilidad: Manipular DOM, mostrar mensajes, etc
 */

/**
 * Mostrar notificación temporal
 * @param {string} mensaje - Texto a mostrar
 * @param {string} tipo - 'success', 'error', 'warning'
 */
export function showToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn('⚠️ No existe elemento #toast');
        return;
    }
    
    document.getElementById('toast-message').textContent = mensaje;
    toast.className = `toast ${tipo}`;
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

/**
 * Cambiar entre secciones/pasos
 * @param {string} paso - ID del paso a mostrar
 */
export function mostrarPaso(paso) {
    // Ocultar todos
    document.querySelectorAll('[data-paso]').forEach(el => {
        el.style.display = 'none';
    });
    
    // Mostrar el seleccionado
    const elemento = document.querySelector(`[data-paso="${paso}"]`);
    if (elemento) {
        elemento.style.display = 'block';
    }
}

/**
 * Limpiar contenedor HTML
 * @param {string} selector - Selector CSS del contenedor
 */
export function limpiarContenedor(selector) {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = '';
}

/**
 * Actualizar texto de elemento
 * @param {string} selector - Selector CSS
 * @param {string} texto - Nuevo texto
 */
export function actualizarTexto(selector, texto) {
    const el = document.querySelector(selector);
    if (el) el.textContent = texto;
}

/**
 * Agregar clase CSS
 * @param {string} selector - Selector CSS
 * @param {string} clase - Nombre de clase
 */
export function agregarClase(selector, clase) {
    const el = document.querySelector(selector);
    if (el) el.classList.add(clase);
}

/**
 * Remover clase CSS
 * @param {string} selector - Selector CSS
 * @param {string} clase - Nombre de clase
 */
export function removerClase(selector, clase) {
    const el = document.querySelector(selector);
    if (el) el.classList.remove(clase);
}

/**
 * Toggle clase CSS
 * @param {string} selector - Selector CSS
 * @param {string} clase - Nombre de clase
 */
export function toggleClase(selector, clase) {
    const el = document.querySelector(selector);
    if (el) el.classList.toggle(clase);
}

/**
 * Obtener valor de input
 * @param {string} selector - Selector CSS del input
 * @returns {string} Valor del input
 */
export function obtenerValor(selector) {
    const el = document.querySelector(selector);
    return el ? el.value : '';
}

/**
 * Establecer valor de input
 * @param {string} selector - Selector CSS del input
 * @param {string} valor - Nuevo valor
 */
export function establecerValor(selector, valor) {
    const el = document.querySelector(selector);
    if (el) el.value = valor;
}

/**
 * Crear elemento HTML
 * @param {string} tag - Etiqueta (div, button, etc)
 * @param {Object} attrs - Atributos {class, id, data-*}
 * @param {string} contenido - HTML interno (opcional)
 * @returns {HTMLElement} Elemento creado
 */
export function crearElemento(tag, attrs = {}, contenido = '') {
    const el = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'class') {
            el.className = value;
        } else if (key.startsWith('data-')) {
            el.setAttribute(key, value);
        } else {
            el.setAttribute(key, value);
        }
    });
    
    if (contenido) el.innerHTML = contenido;
    return el;
}

/**
 * Agregar evento a elemento
 * @param {string} selector - Selector CSS
 * @param {string} evento - Tipo de evento (click, input, etc)
 * @param {Function} callback - Función a ejecutar
 */
export function enEvento(selector, evento, callback) {
    const el = document.querySelector(selector);
    if (el) el.addEventListener(evento, callback);
}

/**
 * Agregar evento a múltiples elementos
 * @param {string} selector - Selector CSS
 * @param {string} evento - Tipo de evento
 * @param {Function} callback - Función a ejecutar
 */
export function enEventoMultiple(selector, evento, callback) {
    document.querySelectorAll(selector).forEach(el => {
        el.addEventListener(evento, callback);
    });
}

/**
 * Deshabilitar/habilitar botón
 * @param {string} selector - Selector CSS del botón
 * @param {boolean} deshabilitado - true = deshabilitado
 */
export function deshabilitarBoton(selector, deshabilitado = true) {
    const el = document.querySelector(selector);
    if (el) el.disabled = deshabilitado;
}

/**
 * Formatear número a moneda
 * @param {number} valor - Número a formatear
 * @param {string} moneda - Símbolo de moneda (ej: S/.)
 * @returns {string} Formato: "S/. 123.45"
 */
export function formatearMoneda(valor, moneda = 'S/.') {
    return `${moneda} ${parseFloat(valor).toFixed(2)}`;
}

/**
 * Calcular tiempo transcurrido
 * @param {string|Date} fecha - Fecha inicial
 * @returns {string} Ej: "5m", "2h", "Ahora"
 */
export function tiempoTranscurrido(fecha) {
    const diff = Date.now() - new Date(fecha).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    
    if (minutos === 0) return 'Ahora';
    if (minutos < 60) return `${minutos}m`;
    return `${horas}h`;
}

/**
 * Mostrar diálogo de confirmación
 * @param {string} mensaje - Pregunta
 * @returns {Promise<boolean>} true si acepta, false si cancela
 */
export async function confirmar(mensaje) {
    return confirm(mensaje);
}

/**
 * Prompt mejorado
 * @param {string} pregunta - Pregunta
 * @param {string} defecto - Valor por defecto
 * @returns {Promise<string|null>} Respuesta o null
 */
export async function prompt(pregunta, defecto = '') {
    return window.prompt(pregunta, defecto);
}

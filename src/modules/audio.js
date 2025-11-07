/**
 * Audio.js - Web Audio API simplificado
 * Responsabilidad: Reproducir sonidos sintetizados
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.habilitado = true;
        this.init();
    }

    /**
     * Inicializar AudioContext
     */
    async init() {
        try {
            if (!window.AudioContext && !window.webkitAudioContext) {
                console.warn('⚠️ Web Audio API no soportada');
                this.habilitado = false;
                return;
            }

            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioCtx();

            // Reanudar si está suspendido
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('✅ AudioContext reanudado');
            }
        } catch (err) {
            console.error('❌ Error inicializando Audio:', err);
            this.habilitado = false;
        }
    }

    /**
     * Crear y reproducir un beep
     * @param {number} frecuencia - Hz
     * @param {number} duracion - ms
     * @param {string} tipo - 'sine', 'square', 'sawtooth'
     */
    async reproducirBeep(frecuencia, duracion, tipo = 'sine') {
        if (!this.habilitado || !this.audioContext) return;

        try {
            // Reanudar si está suspendido
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(this.audioContext.destination);

            oscillator.frequency.value = frecuencia;
            oscillator.type = tipo;

            // Volumen (suave)
            gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duracion / 1000);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duracion / 1000);
        } catch (err) {
            console.error('❌ Error reproduciendo beep:', err);
        }
    }

    /**
     * 🔔 Sonido: Nuevo Pedido (grave)
     */
    async sonidoNuevoPedido() {
        await this.reproducirBeep(400, 150);
        await new Promise(r => setTimeout(r, 100));
        await this.reproducirBeep(500, 150);
    }

    /**
     * ✅ Sonido: Éxito (ascendente)
     */
    async sonidoExito() {
        await this.reproducirBeep(600, 100);
        await new Promise(r => setTimeout(r, 50));
        await this.reproducirBeep(800, 100);
        await new Promise(r => setTimeout(r, 50));
        await this.reproducirBeep(1000, 100);
    }

    /**
     * 🚨 Sonido: Plato Listo (urgente)
     */
    async sonidoListoUrgente() {
        for (let i = 0; i < 3; i++) {
            await this.reproducirBeep(1000, 100);
            await new Promise(r => setTimeout(r, 50));
        }
    }

    /**
     * ❌ Sonido: Error
     */
    async sonidoError() {
        await this.reproducirBeep(1000, 300, 'square');
    }

    /**
     * Habilitar/deshabilitar audio
     */
    toggle(habilitado) {
        this.habilitado = habilitado;
        console.log(`🔊 Audio: ${habilitado ? 'HABILITADO' : 'DESHABILITADO'}`);
    }

    /**
     * Verificar si está habilitado
     */
    estaHabilitado() {
        return this.habilitado;
    }
}

// Crear instancia global
export const audioManager = new AudioManager();

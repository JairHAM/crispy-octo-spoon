// sonidos.js - Gestión de notificaciones de audio

class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.7;
        this.audioContext = null;
        this.initAudioContext();
    }

    // Inicializar AudioContext
    initAudioContext() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            // Resume el contexto de audio si está suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().catch(e => console.error('Error resumiendo audio:', e));
            }
        } catch (e) {
            console.error('Error inicializando AudioContext:', e);
        }
    }

    // Crear sonidos simples usando Web Audio API (sin archivos externos)
    createBeep(frequency = 800, duration = 200, type = 'sine') {
        try {
            // Asegurar que el contexto está inicializado
            this.initAudioContext();
            
            if (!this.audioContext) {
                console.error('AudioContext no disponible');
                return;
            }

            const now = this.audioContext.currentTime;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(this.volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
            
            oscillator.start(now);
            oscillator.stop(now + duration / 1000);
        } catch (e) {
            console.error('Error reproduciendo sonido:', e);
        }
    }

    // Sonido para pedido LISTO (tono agudo y alegre - 3 beeps)
    playOrderReady() {
        if (!this.enabled) return;
        
        console.log('🔊 Sonido: Pedido listo');
        
        // Secuencia de 3 beeps progresivos
        setTimeout(() => this.createBeep(800, 150), 0);
        setTimeout(() => this.createBeep(1000, 150), 200);
        setTimeout(() => this.createBeep(1200, 200), 400);
    }

    // Sonido para nuevo pedido (tono bajo pulsante - 2 beeps)
    playNewOrder() {
        if (!this.enabled) return;
        
        console.log('�� Sonido: Nuevo pedido');
        
        // Secuencia de 2 beeps
        setTimeout(() => this.createBeep(400, 200), 0);
        setTimeout(() => this.createBeep(500, 200), 300);
    }

    // Sonido para error (tono de alerta)
    playError() {
        if (!this.enabled) return;
        
        console.log('🔊 Sonido: Error');
        
        setTimeout(() => this.createBeep(300, 100), 0);
        setTimeout(() => this.createBeep(300, 100), 150);
    }

    // Sonido para confirmación
    playSuccess() {
        if (!this.enabled) return;
        
        console.log('🔊 Sonido: Éxito');
        
        setTimeout(() => this.createBeep(600, 100), 0);
        setTimeout(() => this.createBeep(800, 100), 120);
        setTimeout(() => this.createBeep(1000, 150), 240);
    }

    // Toggle sonidos
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Cambiar volumen (0-1)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

// Instancia global
const soundManager = new SoundManager();

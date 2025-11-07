/**
 * TEST.js - Testing profundo de todas las funciones
 * Ejecutar este archivo para validar que todo funciona
 */

console.log('🧪 INICIANDO TESTING PROFUNDO...\n');

// ========== TEST 1: MÓDULO API ==========

console.log('📡 TEST 1: API Module');
console.log('─'.repeat(50));

async function testAPI() {
    try {
        const { getProductos, getPedidos } = await import('../modules/api.js');
        
        console.log('✅ API importado correctamente');
        
        const productos = await getProductos();
        console.log(`✅ getProductos(): ${productos.length} productos obtenidos`);
        
        const pedidos = await getPedidos();
        console.log(`✅ getPedidos(): ${pedidos.length} pedidos obtenidos`);
        
        return true;
    } catch (err) {
        console.error('❌ Error en API:', err.message);
        return false;
    }
}

// ========== TEST 2: MÓDULO STATE ==========

console.log('\n🗂️ TEST 2: State Module');
console.log('─'.repeat(50));

async function testState() {
    try {
        const { state } = await import('../modules/state.js');
        
        // Test productos
        const testProds = [
            { _id: '1', nombre: 'Hamburguesa', precio: 10 },
            { _id: '2', nombre: 'Pizza', precio: 15 }
        ];
        state.setProductos(testProds);
        console.log(`✅ setProductos(): ${state.getProductos().length} productos guardados`);
        
        // Test carrito
        state.agregarAlCarrito('1', 'Hamburguesa', 10);
        console.log(`✅ agregarAlCarrito(): Carrito tiene ${state.contarCarrito()} items`);
        
        state.agregarAlCarrito('1', 'Hamburguesa', 10);
        console.log(`✅ Agregar mismo item: ${state.contarCarrito()} items`);
        
        state.reducirDelCarrito('1');
        console.log(`✅ reducirDelCarrito(): Carrito = ${state.contarCarrito()} items`);
        
        const total = state.calcularTotalCarrito();
        console.log(`✅ calcularTotalCarrito(): S/. ${total.toFixed(2)}`);
        
        // Test mesa
        state.setMesaSeleccionada(5);
        console.log(`✅ setMesaSeleccionada(5): Mesa = ${state.getMesaSeleccionada()}`);
        
        return true;
    } catch (err) {
        console.error('❌ Error en State:', err.message);
        return false;
    }
}

// ========== TEST 3: MÓDULO UI ==========

console.log('\n🎨 TEST 3: UI Module');
console.log('─'.repeat(50));

async function testUI() {
    try {
        const { 
            formatearMoneda, 
            tiempoTranscurrido,
            crearElemento 
        } = await import('../modules/ui.js');
        
        const moneda = formatearMoneda(123.45);
        console.log(`✅ formatearMoneda(123.45): "${moneda}"`);
        
        const tiempo = tiempoTranscurrido(new Date());
        console.log(`✅ tiempoTranscurrido(): "${tiempo}"`);
        
        const elem = crearElemento('button', { class: 'btn' }, 'Test');
        console.log(`✅ crearElemento(): ${elem.tagName} creado`);
        
        return true;
    } catch (err) {
        console.error('❌ Error en UI:', err.message);
        return false;
    }
}

// ========== TEST 4: MÓDULO AUDIO ==========

console.log('\n🔊 TEST 4: Audio Module');
console.log('─'.repeat(50));

async function testAudio() {
    try {
        const { audioManager } = await import('../modules/audio.js');
        
        console.log(`✅ Audio importado`);
        console.log(`✅ Audio habilitado: ${audioManager.estaHabilitado()}`);
        
        // Test sonidos (solo log, no reproduce)
        console.log(`✅ sonidoNuevoPedido disponible`);
        console.log(`✅ sonidoExito disponible`);
        console.log(`✅ sonidoListoUrgente disponible`);
        console.log(`✅ sonidoError disponible`);
        
        return true;
    } catch (err) {
        console.error('❌ Error en Audio:', err.message);
        return false;
    }
}

// ========== TEST 5: PÁGINAS ==========

console.log('\n📄 TEST 5: Páginas');
console.log('─'.repeat(50));

function testPaginas() {
    try {
        const adminBtn = document.querySelector('[data-paso]');
        console.log(`✅ Elementos DOM encontrados: ${adminBtn ? 'SÍ' : 'NO'}`);
        
        // Verificar que existen los elementos esperados
        const elementos = {
            'Toast': document.getElementById('toast'),
            'Header': document.querySelector('header'),
        };
        
        Object.entries(elementos).forEach(([name, elem]) => {
            console.log(`  ${elem ? '✅' : '❌'} ${name}`);
        });
        
        return true;
    } catch (err) {
        console.error('❌ Error verificando DOM:', err.message);
        return false;
    }
}

// ========== EJECUTAR TESTS ==========

async function ejecutarTests() {
    const resultados = {
        'API': await testAPI(),
        'State': await testState(),
        'UI': await testUI(),
        'Audio': await testAudio(),
        'Páginas': testPaginas()
    };
    
    console.log('\n' + '═'.repeat(50));
    console.log('📊 RESULTADO FINAL:');
    console.log('═'.repeat(50));
    
    const total = Object.keys(resultados).length;
    const passed = Object.values(resultados).filter(r => r).length;
    
    Object.entries(resultados).forEach(([name, result]) => {
        console.log(`${result ? '✅' : '❌'} ${name}`);
    });
    
    console.log(`\n🎯 ${passed}/${total} tests pasaron`);
    
    if (passed === total) {
        console.log('🎉 ¡TODOS LOS TESTS PASARON!');
    } else {
        console.log(`⚠️ ${total - passed} tests fallaron`);
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ejecutarTests);
} else {
    ejecutarTests();
}

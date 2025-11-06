const API = 'https://crispy-octo-spoon.onrender.com/api';

let selectedMesa = null;
let cart = [];
let allProducts = [];
let filteredProducts = [];

async function init() {
    await loadProducts();
    renderMesas();
}

async function loadProducts() {
    try {
        const res = await fetch(`${API}/productos`);
        allProducts = await res.json();
        filteredProducts = allProducts;
    } catch (e) {
        notify('Error cargando menú', true);
    }
}

function renderMesas() {
    const container = document.getElementById('mesas-container');
    container.innerHTML = '';
    
    for (let i = 1; i <= 20; i++) {
        const btn = document.createElement('button');
        btn.className = 'mesa-btn';
        btn.innerHTML = `<i class="ri-door-line"></i><span>Mesa ${i}</span>`;
        btn.onclick = () => selectMesa(i);
        container.appendChild(btn);
    }
}

function selectMesa(mesa) {
    selectedMesa = mesa;
    document.querySelectorAll('.mesa-btn').forEach(b => b.classList.remove('active'));
    event.target.closest('.mesa-btn').classList.add('active');
    
    document.getElementById('current-mesa').textContent = mesa;
    document.getElementById('mesa-title').textContent = mesa;
    document.getElementById('mesa-carrito').textContent = mesa;
    
    showStep('menu');
    renderProducts(allProducts);
}

function showStep(step) {
    document.querySelectorAll('.step-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`step-${step}`).classList.remove('hidden');
}

function renderProducts(products) {
    const container = document.getElementById('productos-container');
    container.innerHTML = '';
    
    if (!products.length) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No hay productos</p>';
        return;
    }
    
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        
        const cartItem = cart.find(item => item._id === p._id);
        const qty = cartItem ? cartItem.cantidad : 0;
        
        card.innerHTML = `
            <div class="producto-title">${p.nombre}</div>
            <div class="producto-category">${getCategoryEmoji(p.categoria)} ${p.categoria}</div>
            <div class="producto-price">S/. ${p.precio.toFixed(2)}</div>
            <div class="producto-quantity">
                <button class="quantity-btn" onclick="decreaseQty('${p._id}')">−</button>
                <div class="quantity-display">${qty}</div>
                <button class="quantity-btn" onclick="increaseQty('${p._id}', '${p.nombre}', ${p.precio})">+</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function getCategoryEmoji(cat) {
    const emojis = {
        'Entrada': '🥗',
        'Plato Principal': '🍽️',
        'Bebida': '🥤',
        'Postre': '🍰',
        'Otro': '📦'
    };
    return emojis[cat] || '📦';
}

function increaseQty(id, name, price) {
    const item = cart.find(i => i._id === id);
    if (item) {
        item.cantidad++;
    } else {
        cart.push({ _id: id, nombre: name, precio: price, cantidad: 1 });
    }
    updateCart();
}

function decreaseQty(id) {
    const item = cart.find(i => i._id === id);
    if (item) {
        item.cantidad--;
        if (item.cantidad <= 0) {
            cart = cart.filter(i => i._id !== id);
        }
    }
    updateCart();
}

function updateCart() {
    document.getElementById('cart-count').textContent = cart.reduce((sum, item) => sum + item.cantidad, 0);
    renderProducts(filteredProducts);
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const category = e.target.dataset.category;
        if (category === 'todas') {
            filteredProducts = allProducts;
        } else {
            filteredProducts = allProducts.filter(p => p.categoria === category);
        }
        renderProducts(filteredProducts);
    });
});

function backToMenu() {
    showStep('menu');
}

async function sendOrder() {
    if (!cart.length) {
        notify('Agrega platos al carrito', true);
        return;
    }
    
    try {
        setLoading(true);
        
        const orderData = {
            mesa: selectedMesa,
            items: cart,
            estado: 'pendiente',
            fechaCreacion: new Date(),
            horaEstimada: new Date(Date.now() + 30 * 60000)
        };
        
        const res = await fetch(`${API}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        if (!res.ok) throw new Error('Error al enviar pedido');
        
        notify('✅ Pedido enviado a cocina', false);
        cart = [];
        updateCart();
        
        setTimeout(() => {
            selectedMesa = null;
            showStep('mesa');
            document.querySelectorAll('.mesa-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('current-mesa').textContent = '-';
        }, 1500);
        
    } catch (e) {
        notify(e.message || 'Error al enviar pedido', true);
    } finally {
        setLoading(false);
    }
}

function resetSelection() {
    selectedMesa = null;
    cart = [];
    updateCart();
    showStep('mesa');
    document.querySelectorAll('.mesa-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('current-mesa').textContent = '-';
}

function notify(msg, isError = false) {
    const toast = document.getElementById('notification');
    document.getElementById('toast-message').textContent = msg;
    
    toast.classList.remove('error', 'show');
    toast.classList.add('show', isError ? 'error' : 'success');
    
    const icon = toast.querySelector('i');
    icon.className = isError ? 'ri-close-circle-line' : 'ri-check-circle-line';
    
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function setLoading(on) {
    const overlay = document.getElementById('loading-overlay');
    if (on) {
        overlay.style.display = 'flex';
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
        setTimeout(() => overlay.style.display = 'none', 300);
    }
}

document.addEventListener('DOMContentLoaded', init);

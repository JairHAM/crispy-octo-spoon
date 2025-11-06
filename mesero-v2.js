const API = 'https://crispy-octo-spoon.onrender.com/api';

let selectedMesa = null;
let cart = [];
let allProducts = [];
let filteredProducts = [];
let refreshInterval = null;

async function init() {
    await loadProducts();
    renderMesas();
    loadAllOrders();
    startRefresh();
}

async function loadProducts() {
    try {
        const res = await fetch(`${API}/productos`);
        allProducts = await res.json();
        filteredProducts = allProducts;
    } catch (e) {
        showToast('Error cargando menú', 'error');
    }
}

function renderMesas() {
    const container = document.getElementById('mesas-container');
    container.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3';
        col.innerHTML = `
            <div class="card-mesa" onclick="selectMesa(${i})">
                <i class="ri-door-line"></i>
                <div>Mesa ${i}</div>
            </div>
        `;
        container.appendChild(col);
    }
}

function selectMesa(mesa) {
    selectedMesa = mesa;
    showStep('menu');
    updateSectionDisplay('menu', mesa);
    renderProducts(allProducts);
    document.getElementById('btn-seguimiento').style.display = 'inline-block';
}

function showStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
}

function updateSectionDisplay(step, mesa = null) {
    const display = document.getElementById('section-display');
    const sectionName = document.getElementById('section-name');
    const sectionIcon = document.getElementById('section-icon');
    
    const sections = {
        'menu': { icon: 'ri-book-line', name: `Menú - Mesa ${mesa}` },
        'carrito': { icon: 'ri-shopping-cart-line', name: `Tu Pedido - Mesa ${mesa}` },
        'seguimiento': { icon: 'ri-receipt-2-line', name: `Mi Seguimiento - Mesa ${mesa}` }
    };
    
    if (sections[step]) {
        const info = sections[step];
        sectionIcon.className = `ri ${info.icon}`;
        sectionName.textContent = info.name;
        display.style.display = 'flex';
    } else {
        display.style.display = 'none';
    }
}

function renderProducts(products) {
    const container = document.getElementById('productos-container');
    container.innerHTML = '';
    
    if (!products.length) {
        container.innerHTML = '<div class="col-12 empty-state">No hay productos</div>';
        return;
    }
    
    products.forEach(p => {
        const cartItem = cart.find(item => item._id === p._id);
        const qty = cartItem ? cartItem.cantidad : 0;
        
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3';
        col.innerHTML = `
            <div class="producto-item">
                <div class="producto-nombre">${p.nombre}</div>
                <div class="producto-categoria">${getCategoryEmoji(p.categoria)} ${p.categoria}</div>
                <div class="producto-precio">S/. ${p.precio.toFixed(2)}</div>
                <div class="qty-control">
                    <button onclick="decreaseQty('${p._id}')">−</button>
                    <div class="qty-display">${qty}</div>
                    <button onclick="increaseQty('${p._id}', '${p.nombre}', ${p.precio})">+</button>
                </div>
            </div>
        `;
        container.appendChild(col);
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
    const count = cart.reduce((sum, item) => sum + item.cantidad, 0);
    document.getElementById('cart-count').textContent = count;
    
    const btn = document.getElementById('btn-carrito');
    btn.style.display = count > 0 ? 'inline-block' : 'none';
    
    renderProducts(filteredProducts);
}

function filterProducts(category) {
    document.querySelectorAll('.filter-badge').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    if (category === 'todas') {
        filteredProducts = allProducts;
    } else {
        filteredProducts = allProducts.filter(p => p.categoria === category);
    }
    renderProducts(filteredProducts);
}

function showCart() {
    if (!cart.length) {
        showToast('Agrega platos al carrito', 'error');
        return;
    }
    renderCartItems();
    showStep('carrito');
    updateSectionDisplay('carrito', selectedMesa);
}

function renderCartItems() {
    const container = document.getElementById('carrito-items');
    container.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        const div = document.createElement('div');
        div.className = 'carrito-item';
        div.innerHTML = `
            <div class="item-info">
                <h6>${item.nombre}</h6>
                <small>Cantidad: ${item.cantidad}</small>
            </div>
            <div class="item-price">S/. ${subtotal.toFixed(2)}</div>
            <button class="btn-delete" onclick="removeFromCart('${item._id}')">
                <i class="ri-delete-bin-line"></i>
            </button>
        `;
        container.appendChild(div);
    });
    
    document.getElementById('total-price').textContent = `S/. ${total.toFixed(2)}`;
}

function removeFromCart(id) {
    cart = cart.filter(i => i._id !== id);
    updateCart();
    if (cart.length === 0) {
        showStep('menu');
        updateSectionDisplay('menu', selectedMesa);
    } else {
        renderCartItems();
    }
}

async function sendOrder() {
    if (!cart.length) {
        showToast('Agrega platos al carrito', 'error');
        return;
    }
    
    try {
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
        
        showToast('✅ Pedido enviado a cocina', 'success');
        cart = [];
        updateCart();
        
        setTimeout(() => {
            viewMesaOrders();
        }, 1000);
    } catch (e) {
        showToast(e.message || 'Error al enviar pedido', 'error');
    }
}

function backToMenu() {
    showStep('menu');
    updateSectionDisplay('menu', selectedMesa);
}

async function loadAllOrders() {
    try {
        const res = await fetch(`${API}/pedidos`);
        const orders = await res.json();
        
        displayOrdersByStatus(orders, 'orders-pending', 'count-pending', 'pendiente');
        displayOrdersByStatus(orders, 'orders-preparing', 'count-preparing', 'preparando');
        displayOrdersByStatus(orders, 'orders-ready', 'count-ready', 'listo');
    } catch (e) {
        console.error('Error cargando pedidos:', e);
    }
}

function displayOrdersByStatus(allOrders, containerId, countId, status) {
    const orders = allOrders.filter(o => o.estado === status);
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="ri-inbox-line"></i> Sin pedidos</div>';
        document.getElementById(countId).textContent = '0';
        return;
    }
    
    document.getElementById(countId).textContent = orders.length;
    
    orders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        const time = getElapsedTime(order.fechaCreacion);
        const items = order.items.map(i => `${i.nombre} x${i.cantidad}`).join(', ');
        
        card.innerHTML = `
            <div class="order-mesa">Mesa ${order.mesa}</div>
            <div class="order-items">${items}</div>
            <div class="order-time">${time}</div>
        `;
        container.appendChild(card);
    });
}

function getElapsedTime(date) {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
}

async function viewMesaOrders() {
    showStep('seguimiento');
    updateSectionDisplay('seguimiento', selectedMesa);
    
    try {
        const res = await fetch(`${API}/pedidos`);
        const allOrders = await res.json();
        const mesaOrders = allOrders.filter(o => o.mesa === selectedMesa);
        
        displayMesaOrders(mesaOrders, 'orders-mesa-pending', 'count-mesa-pending', 'pendiente');
        displayMesaOrders(mesaOrders, 'orders-mesa-preparing', 'count-mesa-preparing', 'preparando');
        displayMesaOrders(mesaOrders, 'orders-mesa-ready', 'count-mesa-ready', 'listo');
    } catch (e) {
        console.error('Error:', e);
    }
}

function displayMesaOrders(orders, containerId, countId, status) {
    const filtered = orders.filter(o => o.estado === status);
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="ri-inbox-line"></i> Sin pedidos</div>';
        document.getElementById(countId).textContent = '0';
        return;
    }
    
    document.getElementById(countId).textContent = filtered.length;
    
    filtered.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        const time = getElapsedTime(order.fechaCreacion);
        const items = order.items.map(i => `${i.nombre} x${i.cantidad}`).join(', ');
        
        card.innerHTML = `
            <div class="order-mesa">Pedido Mesa ${order.mesa}</div>
            <div class="order-items">${items}</div>
            <div class="order-time">${time}</div>
        `;
        container.appendChild(card);
    });
}

function newOrder() {
    cart = [];
    updateCart();
    selectedMesa = null;
    document.getElementById('btn-seguimiento').style.display = 'none';
    showStep('inicio');
}

function resetSelection() {
    cart = [];
    selectedMesa = null;
    document.getElementById('btn-seguimiento').style.display = 'none';
    showStep('inicio');
    updateSectionDisplay('inicio');
}

function startRefresh() {
    loadAllOrders();
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        loadAllOrders();
        if (selectedMesa) viewMesaOrders();
    }, 3000);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    
    msg.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

document.addEventListener('DOMContentLoaded', init);

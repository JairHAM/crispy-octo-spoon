const API = 'https://crispy-octo-spoon.onrender.com/api';
let selectedMesa = null;
let cart = [];
let products = [];

async function init() {
    await loadProducts();
    await loadAllOrders();
    renderMesas();
    setInterval(loadAllOrders, 3000);
}

async function loadProducts() {
    try {
        const res = await fetch(`${API}/productos`);
        products = await res.json();
    } catch (err) {
        console.error('Error loading products:', err);
        showToast('Error cargando productos', 'error');
    }
}

async function loadAllOrders() {
    try {
        const res = await fetch(`${API}/pedidos`);
        const orders = await res.json();
        displayOrdersByStatus(orders);
    } catch (err) {
        console.error('Error loading orders:', err);
    }
}

function displayOrdersByStatus(orders) {
    const pending = [], preparing = [], ready = [];
    
    orders.forEach(order => {
        const item = createOrderCard(order);
        if (order.estado === 'pendiente') pending.push(item);
        else if (order.estado === 'preparando') preparing.push(item);
        else if (order.estado === 'listo') ready.push(item);
    });

    // 🔊 Reproducir sonido si hay nuevos pedidos LISTOS
    const oldReady = document.getElementById('count-ready')?.textContent || '0';
    if (ready.length > parseInt(oldReady) && typeof soundManager !== 'undefined') {
        soundManager.playOrderReady();
    }

    updateOrderColumn('pending', pending);
    updateOrderColumn('preparing', preparing);
    updateOrderColumn('ready', ready);
}

function createOrderCard(order) {
    const items = order.items.map(i => `${i.nombre} (${i.cantidad})`).join(', ');
    const elapsed = getElapsedTime(order.fechaCreacion || order.createdAt);
    
    return `
        <div class="order-card">
            <div class="order-mesa">Mesa ${order.mesa}</div>
            <div class="order-items">${items}</div>
            <div class="order-time">${elapsed}</div>
        </div>
    `;
}

function updateOrderColumn(type, items) {
    const col = document.getElementById(`orders-${type}`);
    const count = document.getElementById(`count-${type}`);
    
    if (!col) return;
    
    if (items.length === 0) {
        col.innerHTML = '<div class="empty-state"><i class="ri-inbox-line"></i> Sin pedidos</div>';
    } else {
        col.innerHTML = items.join('');
    }
    
    if (count) count.textContent = items.length;
}

function renderMesas() {
    const container = document.getElementById('mesas-container');
    container.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const div = document.createElement('div');
        div.className = 'col-6 col-md-4 col-lg-3';
        div.innerHTML = `
            <div class="card-mesa" onclick="selectMesa(${i})">
                <i class="ri-door-line"></i>
                <div>Mesa ${i}</div>
            </div>
        `;
        container.appendChild(div);
    }
}

function selectMesa(mesa) {
    selectedMesa = mesa;
    cart = [];
    showStep('menu');
    renderProducts();
}

function renderProducts() {
    const container = document.getElementById('productos-container');
    container.innerHTML = '';
    
    products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'col-6 col-md-4 col-lg-3';
        div.setAttribute('data-product-id', p._id);
        const cartItem = cart.find(c => c._id === p._id);
        const qty = cartItem ? cartItem.cantidad : 0;
        const precio = parseFloat(p.precio) || 0;
        
        div.innerHTML = `
            <div class="producto-item">
                <div class="producto-nombre">${p.nombre}</div>
                <div class="producto-categoria">${p.categoria}</div>
                <div class="producto-precio">S/. ${precio.toFixed(2)}</div>
                <div class="qty-control">
                    <button onclick="decreaseQty('${p._id}')">−</button>
                    <div class="qty-display">${qty}</div>
                    <button onclick="increaseQty('${p._id}', '${p.nombre}', ${precio})">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function increaseQty(id, name, price) {
    let item = cart.find(c => c._id === id);
    if (item) {
        item.cantidad++;
    } else {
        cart.push({ _id: id, nombre: name, precio: price, cantidad: 1 });
    }
    updateCart();
}

function decreaseQty(id) {
    let item = cart.find(c => c._id === id);
    if (item) {
        item.cantidad--;
        if (item.cantidad === 0) cart = cart.filter(c => c._id !== id);
    }
    updateCart();
}

function updateCart() {
    const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) cartCountEl.textContent = cartCount;
    
    // Actualizar solo las cantidades, no re-renderizar todo
    const container = document.getElementById('productos-container');
    if (container && container.children.length > 0) {
        cart.forEach(item => {
            const qtyDisplay = document.querySelector(`[data-product-id="${item._id}"] .qty-display`);
            if (qtyDisplay) qtyDisplay.textContent = item.cantidad;
        });
    }
}

function filterProducts(category) {
    const filtered = category === 'todas' ? products : products.filter(p => p.categoria === category);
    
    document.querySelectorAll('.filter-badge').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    const container = document.getElementById('productos-container');
    container.innerHTML = '';
    
    filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'col-6 col-md-4 col-lg-3';
        div.setAttribute('data-product-id', p._id);
        const cartItem = cart.find(c => c._id === p._id);
        const qty = cartItem ? cartItem.cantidad : 0;
        const precio = parseFloat(p.precio) || 0;
        
        div.innerHTML = `
            <div class="producto-item">
                <div class="producto-nombre">${p.nombre}</div>
                <div class="producto-categoria">${p.categoria}</div>
                <div class="producto-precio">S/. ${precio.toFixed(2)}</div>
                <div class="qty-control">
                    <button onclick="decreaseQty('${p._id}')">−</button>
                    <div class="qty-display">${qty}</div>
                    <button onclick="increaseQty('${p._id}', '${p.nombre}', ${precio})">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function showCart() {
    if (cart.length === 0) {
        showToast('El carrito está vacío', 'error');
        return;
    }
    renderCartItems();
    showStep('carrito');
}

function renderCartItems() {
    const container = document.getElementById('carrito-items');
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        html += `
            <div class="carrito-item">
                <div class="item-info">
                    <h6>${item.nombre}</h6>
                    <small>S/. ${item.precio.toFixed(2)} × ${item.cantidad}</small>
                </div>
                <div class="item-price">S/. ${subtotal.toFixed(2)}</div>
                <button class="btn-delete" onclick="removeFromCart('${item._id}')">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    document.getElementById('total-price').textContent = `S/. ${total.toFixed(2)}`;
}

function removeFromCart(id) {
    cart = cart.filter(c => c._id !== id);
    updateCart();
    if (cart.length === 0) showStep('menu');
    else renderCartItems();
}

async function sendOrder() {
    if (cart.length === 0) return;
    
    try {
        const items = cart.map(c => ({
            nombre: c.nombre,
            cantidad: c.cantidad,
            precio: c.precio
        }));
        
        const res = await fetch(`${API}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mesa: selectedMesa, items })
        });
        
        if (res.ok) {
            showToast('Pedido enviado a cocina', 'success');
            cart = [];
            await loadAllOrders();
            viewMesaOrders();
        }
    } catch (err) {
        console.error('Error sending order:', err);
        showToast('Error enviando pedido', 'error');
    }
}

function viewMesaOrders() {
    if (!selectedMesa) {
        showToast('Selecciona una mesa primero', 'error');
        return;
    }
    
    fetch(`${API}/pedidos`).then(r => r.json()).then(orders => {
        const mesaOrders = orders.filter(o => o.mesa === selectedMesa);
        const pending = [], preparing = [], ready = [];
        
        mesaOrders.forEach(order => {
            const item = createOrderCard(order);
            if (order.estado === 'pendiente') pending.push(item);
            else if (order.estado === 'preparando') preparing.push(item);
            else if (order.estado === 'listo') ready.push(item);
        });
        
        updateMesaOrderColumn('pending', pending);
        updateMesaOrderColumn('preparing', preparing);
        updateMesaOrderColumn('ready', ready);
        showStep('seguimiento');
    });
}

function updateMesaOrderColumn(type, items) {
    const col = document.getElementById(`orders-mesa-${type}`);
    const count = document.getElementById(`count-mesa-${type}`);
    
    if (!col) return;
    
    if (items.length === 0) {
        col.innerHTML = '<div class="empty-state"><i class="ri-inbox-line"></i> Sin pedidos</div>';
    } else {
        col.innerHTML = items.join('');
    }
    
    if (count) count.textContent = items.length;
}

function backToMenu() {
    showStep('menu');
}

function newOrder() {
    selectedMesa = null;
    cart = [];
    showStep('inicio');
}

function resetSelection() {
    selectedMesa = null;
    cart = [];
    showStep('inicio');
}

function showStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
    
    const btnCarrito = document.getElementById('btn-carrito');
    
    if (step === 'menu') {
        btnCarrito.style.display = 'block';
    } else {
        btnCarrito.style.display = 'none';
    }
}

function getElapsedTime(createdAt) {
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    return mins > 0 ? `${mins}m` : 'Ahora';
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('notification');
    toast.className = `toast ${type}`;
    document.getElementById('toast-message').textContent = msg;
    toast.style.display = 'flex';
    setTimeout(() => toast.style.display = 'none', 3000);
}

init();

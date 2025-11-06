const API = 'https://crispy-octo-spoon.onrender.com/api';

let selectedMesa = null;
let cart = [];
let allProducts = [];
let filteredProducts = [];
let refreshInterval = null;

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
    document.getElementById('mesa-ordenes').textContent = mesa;
    document.getElementById('btn-ver-pedidos').style.display = 'flex';
    
    showStep('menu');
    renderProducts(allProducts);
}

function showStep(step) {
    document.querySelectorAll('.step-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`step-${step}`).classList.remove('hidden');
    
    if (step === 'ordenes') {
        loadMesaOrders();
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(() => loadMesaOrders(), 2000);
    } else {
        clearRefreshInterval();
    }
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
    
    attachFilterListeners();
}

function attachFilterListeners() {
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
    const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
    document.getElementById('cart-count').textContent = cartCount;
    document.getElementById('cart-badge').textContent = cartCount;
    
    const cartButton = document.getElementById('cart-button');
    if (cartCount > 0) {
        cartButton.style.display = 'flex';
    } else {
        cartButton.style.display = 'none';
    }
    
    renderProducts(filteredProducts);
}

function attachFilterListeners() {
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
}

function backToMenu() {
    showStep('menu');
}

function showCart() {
    if (!cart.length) {
        notify('Agrega platos al carrito', true);
        return;
    }
    
    renderCartItems();
    showStep('carrito');
}

function renderCartItems() {
    const container = document.getElementById('carrito-items');
    container.innerHTML = '';
    
    let total = 0;
    cart.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrito-item';
        itemDiv.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.nombre}</div>
                <div class="item-qty">Cantidad: ${item.cantidad}</div>
            </div>
            <div class="item-price">S/. ${subtotal.toFixed(2)}</div>
            <button class="item-delete" onclick="removeFromCart('${item._id}')">
                <i class="ri-delete-bin-line"></i>
            </button>
        `;
        container.appendChild(itemDiv);
    });
    
    const totalDiv = document.createElement('div');
    totalDiv.className = 'carrito-total';
    totalDiv.innerHTML = `
        <span>Total</span>
        <span>S/. ${total.toFixed(2)}</span>
    `;
    container.appendChild(totalDiv);
}

function removeFromCart(id) {
    cart = cart.filter(i => i._id !== id);
    updateCart();
    if (cart.length === 0) {
        showStep('menu');
    } else {
        renderCartItems();
    }
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
            loadMesaOrders();
            showStep('ordenes');
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
    document.getElementById('btn-ver-pedidos').style.display = 'none';
    clearRefreshInterval();
}

async function loadMesaOrders() {
    try {
        const res = await fetch(`${API}/pedidos`);
        const allOrders = await res.json();
        
        const mesaOrders = allOrders.filter(o => o.mesa === selectedMesa);
        
        document.getElementById('ordenes-pending').innerHTML = '';
        document.getElementById('ordenes-preparing').innerHTML = '';
        document.getElementById('ordenes-ready').innerHTML = '';
        
        let countPending = 0, countPreparing = 0, countReady = 0;
        
        mesaOrders.forEach(order => {
            const card = createMesaOrderCard(order);
            
            if (order.estado === 'pendiente') {
                document.getElementById('ordenes-pending').appendChild(card);
                countPending++;
            } else if (order.estado === 'preparando') {
                document.getElementById('ordenes-preparing').appendChild(card);
                countPreparing++;
            } else if (order.estado === 'listo') {
                document.getElementById('ordenes-ready').appendChild(card);
                countReady++;
            }
        });
        
        document.getElementById('count-mesa-pending').textContent = countPending;
        document.getElementById('count-mesa-preparing').textContent = countPreparing;
        document.getElementById('count-mesa-ready').textContent = countReady;
        
        if (countPending === 0 && document.getElementById('ordenes-pending').children.length === 0) {
            document.getElementById('ordenes-pending').innerHTML = '<div class="empty-state-small">Sin pedidos</div>';
        }
        if (countPreparing === 0 && document.getElementById('ordenes-preparing').children.length === 0) {
            document.getElementById('ordenes-preparing').innerHTML = '<div class="empty-state-small">Sin pedidos</div>';
        }
        if (countReady === 0 && document.getElementById('ordenes-ready').children.length === 0) {
            document.getElementById('ordenes-ready').innerHTML = '<div class="empty-state-small">Sin pedidos</div>';
        }
    } catch (e) {
        console.error('Error cargando pedidos:', e);
    }
}

function createMesaOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'mesa-order-card';
    
    const elapsedTime = getElapsedTime(order.fechaCreacion);
    const itemsHTML = order.items.map(item => 
        `<div class="order-item"><span>${item.nombre}</span> <span>x${item.cantidad}</span></div>`
    ).join('');
    
    card.innerHTML = `
        <div class="order-time">${elapsedTime}</div>
        <div class="order-items">
            ${itemsHTML}
        </div>
    `;
    
    return card;
}

function getElapsedTime(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now - created) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
}

function goBackToMesa() {
    selectedMesa = null;
    cart = [];
    updateCart();
    showStep('mesa');
    document.querySelectorAll('.mesa-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('current-mesa').textContent = '-';
    document.getElementById('btn-ver-pedidos').style.display = 'none';
    clearRefreshInterval();
}

function newOrder() {
    cart = [];
    updateCart();
    showStep('menu');
}

function viewMesaOrders() {
    loadMesaOrders();
    showStep('ordenes');
}

function clearRefreshInterval() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
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

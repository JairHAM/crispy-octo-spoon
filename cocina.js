const API = 'https://crispy-octo-spoon.onrender.com/api';

let orders = [];
let refreshInterval = null;

async function init() {
    await loadOrders();
    startAutoRefresh();
    setupWebSocket();
}

async function loadOrders() {
    try {
        const res = await fetch(`${API}/pedidos`);
        orders = await res.json();
        renderOrders();
        updateStats();
    } catch (e) {
        console.error('Error cargando pedidos:', e);
    }
}

function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(loadOrders, 3000);
}

function setupWebSocket() {
    try {
        const wsURL = 'wss://crispy-octo-spoon.onrender.com';
        const ws = new WebSocket(wsURL);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'pedido-actualizado') {
                loadOrders();
            }
        };
    } catch (e) {
        console.log('WebSocket no disponible, usando polling');
    }
}

function renderOrders() {
    const pending = orders.filter(o => o.estado === 'pendiente');
    const preparing = orders.filter(o => o.estado === 'preparando');
    const ready = orders.filter(o => o.estado === 'listo');
    
    renderOrderSection('pending', pending);
    renderOrderSection('preparing', preparing);
    renderOrderSection('ready', ready);
}

function renderOrderSection(section, orderList) {
    const container = document.getElementById(`orders-${section}`);
    const countEl = document.getElementById(`count-${section}`);
    
    countEl.textContent = orderList.length;
    container.innerHTML = '';
    
    if (!orderList.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-inbox-line"></i>
                <p>Sin pedidos</p>
            </div>
        `;
        return;
    }
    
    orderList.forEach(order => {
        const card = createOrderCard(order, section);
        container.appendChild(card);
    });
}

function createOrderCard(order, section) {
    const card = document.createElement('div');
    card.className = 'order-card';
    
    const tiempoTranscurrido = getElapsedTime(order.fechaCreacion);
    const itemsHTML = order.items.map(item => `
        <div class="order-item">
            <span class="order-item-name">${item.nombre}</span>
            <span class="order-item-qty">x${item.cantidad}</span>
        </div>
    `).join('');
    
    card.innerHTML = `
        <div class="order-header">
            <div class="order-mesa">Mesa ${order.mesa}</div>
            <div class="order-time">
                <i class="ri-time-line"></i>
                ${tiempoTranscurrido}
            </div>
        </div>
        <div class="order-items">
            ${itemsHTML}
        </div>
        <div class="order-actions">
            ${getActionButton(order, section)}
        </div>
    `;
    
    return card;
}

function getActionButton(order, section) {
    if (section === 'pending') {
        return `<button class="order-btn" onclick="changeStatus('${order._id}', 'preparando')">
                    <i class="ri-restaurant-line"></i> Preparar
                </button>`;
    } else if (section === 'preparing') {
        return `<button class="order-btn" onclick="changeStatus('${order._id}', 'listo')">
                    <i class="ri-check-double-line"></i> Listo
                </button>`;
    } else {
        return `<button class="order-btn" onclick="changeStatus('${order._id}', 'servido')">
                    <i class="ri-team-line"></i> Servido
                </button>`;
    }
}

function getElapsedTime(dateString) {
    const fecha = new Date(dateString);
    const ahora = new Date();
    const diff = Math.floor((ahora - fecha) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
}

async function changeStatus(orderId, newStatus) {
    try {
        const res = await fetch(`${API}/pedidos/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: newStatus })
        });
        
        if (res.ok) {
            await loadOrders();
        }
    } catch (e) {
        console.error('Error actualizando pedido:', e);
    }
}

function updateStats() {
    const pending = orders.filter(o => o.estado === 'pendiente').length;
    const preparing = orders.filter(o => o.estado === 'preparando').length;
    const ready = orders.filter(o => o.estado === 'listo').length;
    
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-preparing').textContent = preparing;
    document.getElementById('stat-ready').textContent = ready;
}

document.addEventListener('DOMContentLoaded', init);

window.addEventListener('beforeunload', () => {
    if (refreshInterval) clearInterval(refreshInterval);
});

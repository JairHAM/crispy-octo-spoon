const API = 'https://crispy-octo-spoon.onrender.com/api';

let orders = [];
let refreshInterval = null;

async function init() {
    await loadOrders();
    startAutoRefresh();
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
    const div = document.createElement('div');
    div.className = `order-card ${section}`;
    
    const elapsed = getElapsedTime(order.createdAt);
    const items = order.items.map(i => `${i.nombre} (${i.cantidad})`).join(', ');
    
    div.innerHTML = `
        <div class="order-mesa">Mesa ${order.mesa}</div>
        <div class="order-items">${items}</div>
        <div class="order-time">${elapsed}</div>
        <button class="status-button ${getButtonClass(section)}" onclick="changeStatus('${order._id}', '${getNextStatus(section)}')">
            <i class="ri-arrow-right-line"></i> ${getButtonText(section)}
        </button>
    `;
    
    return div;
}

function getButtonClass(section) {
    return section === 'pending' || section === 'preparing' ? 'btn-preparing' : 'btn-ready';
}

function getButtonText(section) {
    if (section === 'pending') return 'Preparar';
    if (section === 'preparing') return 'Listo';
    return 'Servido';
}

function getNextStatus(section) {
    if (section === 'pending') return 'preparando';
    if (section === 'preparing') return 'listo';
    return 'servido';
}

function getElapsedTime(dateString) {
    const diff = Date.now() - new Date(dateString).getTime();
    const secs = Math.floor(diff / 1000);
    const mins = Math.floor(secs / 60);
    
    if (mins > 0) return `${mins}m`;
    return `${secs}s`;
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
            showToast('Pedido actualizado ✓', false);
        }
    } catch (e) {
        console.error('Error actualizando pedido:', e);
        showToast('Error actualizando pedido', true);
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

function showToast(msg, isError = false) {
    const toast = document.getElementById('notification');
    toast.className = `toast ${isError ? 'error' : 'success'}`;
    document.getElementById('toast-message').textContent = msg;
    toast.style.display = 'flex';
    setTimeout(() => toast.style.display = 'none', 3000);
}

document.addEventListener('DOMContentLoaded', init);

window.addEventListener('beforeunload', () => {
    if (refreshInterval) clearInterval(refreshInterval);
});

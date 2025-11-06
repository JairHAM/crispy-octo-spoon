const API = 'https://crispy-octo-spoon.onrender.com/api';

let orders = [];
let refreshInterval = null;
let previousOrderIds = []; // Guardar IDs anteriores para detectar nuevos

async function init() {
    await loadOrders();
    startAutoRefresh();
}

async function loadOrders() {
    try {
        const res = await fetch(`${API}/pedidos`);
        const newOrders = await res.json();
        
        // Obtener IDs de pedidos actuales
        const currentOrderIds = newOrders.map(o => o._id);
        
        // Detectar NUEVOS pedidos comparando IDs
        const newPedidoIds = currentOrderIds.filter(id => !previousOrderIds.includes(id));
        
        // Si hay nuevos pedidos, sonar
        if (newPedidoIds.length > 0 && typeof soundManager !== 'undefined') {
            console.log('🔊 Nuevos pedidos detectados:', newPedidoIds);
            soundManager.playNewOrder();
        }
        
        // Detectar cambios de estado en pedidos existentes
        newOrders.forEach(newOrder => {
            const oldOrder = orders.find(o => o._id === newOrder._id);
            if (oldOrder && oldOrder.estado !== newOrder.estado) {
                console.log(`Estado cambió: ${oldOrder._id} ${oldOrder.estado} → ${newOrder.estado}`);
            }
        });
        
        console.log('Total pedidos en BD:', newOrders.length);
        console.log('Estados:', newOrders.map(o => o.estado));
        
        // Guardar estado actual
        previousOrderIds = currentOrderIds;
        orders = newOrders;
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
    
    const elapsed = getElapsedTime(order.fechaCreacion || order.createdAt);
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
            
            // 🔊 Reproducir sonido según el estado nuevo
            if (typeof soundManager !== 'undefined') {
                if (newStatus === 'preparando') {
                    // Sonido cuando se comienza a preparar
                    soundManager.playSuccess();
                } else if (newStatus === 'listo') {
                    // Sonido cuando está listo
                    soundManager.playOrderReady();
                } else if (newStatus === 'servido') {
                    // Sonido cuando se entrega
                    soundManager.playSuccess();
                }
            }
        }
    } catch (e) {
        console.error('Error actualizando pedido:', e);
        showToast('Error actualizando pedido', true);
    }
}

function updateStats() {
    // Contar solo pedidos activos (pendiente, preparando, listo) - NO incluir servidos
    const activeOrders = orders.filter(o => o.estado && o.estado !== 'servido').length;
    const countElement = document.getElementById('order-count');
    if (countElement) {
        countElement.textContent = activeOrders;
    }
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

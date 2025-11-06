const API = 'https://crispy-octo-spoon.onrender.com/api/productos';
const DOM = {
    form: document.getElementById('product-form'),
    submitBtn: document.getElementById('submit-button'),
    cancelBtn: document.getElementById('cancel-button'),
    container: document.getElementById('products-container'),
    productId: document.getElementById('product-id'),
    count: document.getElementById('product-count'),
    badge: document.getElementById('edit-mode-badge'),
    loading: document.getElementById('loading-overlay'),
    toast: document.getElementById('notification'),
};

let isEdit = false;
let isMobile = window.innerWidth <= 768;
let pollInterval = null;

window.addEventListener('resize', () => { isMobile = window.innerWidth <= 768; });
window.addEventListener('orientationchange', () => {
    isMobile = window.innerWidth <= 768;
    setTimeout(() => loadProducts(), 200);
});

function startPolling() {
    if (pollInterval) return;
    pollInterval = setInterval(() => {
        fetch(API).then(r => r.json()).then(p => { 
            renderProducts(p);
            updateCount(p.length);
        }).catch(e => console.log('Polling error:', e));
    }, 5000);
}

function stopPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = null;
}

async function loadProducts() {
    try {
        setLoading(true);
        const res = await fetch(API);
        if (!res.ok) throw new Error('Error al cargar');
        const products = await res.json();
        renderProducts(products);
        updateCount(products.length);
    } catch (e) {
        notify('No se pudieron cargar los productos', true);
    } finally {
        setLoading(false);
    }
}

function renderProducts(products) {
    DOM.container.innerHTML = '';
    if (!products?.length) {
        DOM.container.innerHTML = `<div class="empty-state">
            <i class="ri-inbox-line"></i>
            <p>No hay productos</p>
            <small>Crea tu primer producto</small>
        </div>`;
        return;
    }
    products.forEach(p => DOM.container.appendChild(createCard(p)));
}

function createCard(p) {
    const card = document.createElement('div');
    const available = p.disponible ?? p.disponibilidad ?? true;
    const emojis = { 'Entrada': '🥗', 'Plato Principal': '🍽️', 'Bebida': '🥤', 'Postre': '🍰', 'Otro': '📦' };
    
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-header">
            <h3 class="product-title">${escape(p.nombre)}</h3>
            <div class="product-category">${emojis[p.categoria] || '📦'} ${p.categoria}</div>
        </div>
        <div class="product-price">S/. ${p.precio.toFixed(2)}</div>
        <div class="product-status ${available ? '' : 'unavailable'}">
            <i class="${available ? 'ri-check-circle-line' : 'ri-close-circle-line'}"></i>
            ${available ? 'Disponible' : 'Agotado'}
        </div>
        <div class="product-actions">
            <button class="btn btn-edit btn-sm" onclick="editProduct('${p._id}')">
                <i class="ri-edit-line"></i> Editar
            </button>
            <button class="btn btn-delete btn-sm" onclick="deleteProduct('${p._id}')">
                <i class="ri-delete-bin-line"></i> Eliminar
            </button>
        </div>
    `;
    return card;
}

function escape(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

DOM.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('nombre').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        categoria: document.getElementById('categoria').value,
        disponible: document.getElementById('disponible').checked,
    };

    if (!data.nombre || isNaN(data.precio) || data.precio < 0 || !data.categoria) {
        notify('Completa todos los campos', true);
        return;
    }

    try {
        DOM.submitBtn.disabled = true;
        setLoading(true);

        const id = DOM.productId.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API}/${id}` : API;

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error('Error al guardar');
        
        notify(`Producto ${id ? 'actualizado' : 'creado'} ✓`, false);
        DOM.form.reset();
        resetForm();
        loadProducts();

        if (isMobile) setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 300);
    } catch (e) {
        notify(e.message || 'Error al guardar', true);
    } finally {
        DOM.submitBtn.disabled = false;
        setLoading(false);
    }
});

async function editProduct(id) {
    try {
        const res = await fetch(API);
        const products = await res.json();
        const p = products.find(x => x._id === id);
        if (!p) throw new Error('Producto no encontrado');

        DOM.productId.value = p._id;
        document.getElementById('nombre').value = p.nombre;
        document.getElementById('precio').value = p.precio;
        document.getElementById('categoria').value = p.categoria;
        document.getElementById('disponible').checked = p.disponible ?? p.disponibilidad ?? false;

        isEdit = true;
        DOM.submitBtn.textContent = '💾 Guardar Cambios';
        DOM.badge.style.display = 'flex';
        DOM.cancelBtn.style.display = 'inline-flex';

        if (isMobile) {
            setTimeout(() => {
                DOM.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => window.scrollBy({ top: -60, behavior: 'smooth' }), 500);
            }, 300);
        } else {
            DOM.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (e) {
        notify('No se pudo cargar el producto', true);
    }
}

DOM.cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    DOM.form.reset();
    DOM.productId.value = '';
    DOM.submitBtn.textContent = '✅ Crear Producto';
    DOM.badge.style.display = 'none';
    DOM.cancelBtn.style.display = 'none';
    isEdit = false;
}

async function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto? No se puede deshacer.')) return;

    try {
        setLoading(true);
        const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar');
        
        notify('Producto eliminado ✓', false);
        loadProducts();
    } catch (e) {
        notify(e.message || 'Error al eliminar', true);
    } finally {
        setLoading(false);
    }
}

function notify(msg, isError = false, timeout = 3000) {
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = msg;
    
    DOM.toast.classList.remove('error', 'success', 'show');
    DOM.toast.classList.add('show', isError ? 'error' : 'success');
    
    const icon = DOM.toast.querySelector('i');
    icon.className = isError ? 'ri-close-circle-line' : 'ri-check-circle-line';
    
    clearTimeout(notify._timeout);
    notify._timeout = setTimeout(() => DOM.toast.classList.remove('show'), timeout);
}

function setLoading(on) {
    if (on) {
        DOM.loading.classList.add('show');
        document.querySelectorAll('button').forEach(b => b.disabled = true);
    } else {
        DOM.loading.classList.remove('show');
        document.querySelectorAll('button').forEach(b => b.disabled = false);
    }
}

function updateCount(count) {
    if (DOM.count) DOM.count.textContent = count;
}

function preventIOSZoom() {
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('focus', () => {
            setTimeout(() => { document.body.scrollTop = 0; document.documentElement.scrollTop = 0; }, 500);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    preventIOSZoom();
    startPolling();
    setTimeout(() => document.getElementById('nombre').focus(), 300);

    window.addEventListener('beforeunload', stopPolling);
});

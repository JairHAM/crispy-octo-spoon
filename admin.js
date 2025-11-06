const API = 'https://crispy-octo-spoon.onrender.com/api/productos';
const DOM = {
    form: document.getElementById('product-form'),
    submitBtn: document.getElementById('submit-button'),
    cancelBtn: document.getElementById('cancel-button'),
    container: document.getElementById('products-container'),
    productId: document.getElementById('product-id'),
    count: document.getElementById('product-count'),
    toast: document.getElementById('notification'),
};

let isEdit = false;
let pollInterval = null;

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
        const res = await fetch(API);
        if (!res.ok) throw new Error('Error al cargar');
        const products = await res.json();
        renderProducts(products);
        updateCount(products.length);
    } catch (e) {
        notify('No se pudieron cargar los productos', true);
    }
}

function renderProducts(products) {
    DOM.container.innerHTML = '';
    if (!products?.length) {
        DOM.container.innerHTML = `<div class="col-12">
            <div class="empty-state">
                <i class="ri-inbox-line"></i>
                <p>No hay productos</p>
                <small>Crea tu primer producto</small>
            </div>
        </div>`;
        return;
    }
    products.forEach(p => DOM.container.appendChild(createCard(p)));
}

function createCard(p) {
    const div = document.createElement('div');
    const available = p.disponible ?? p.disponibilidad ?? true;
    const emojis = { 'Entrada': '🥗', 'Plato Principal': '🍽️', 'Bebida': '🥤', 'Postre': '🍰', 'Otro': '📦' };
    
    div.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    div.innerHTML = `
        <div class="product-card">
            <div class="product-name">${escape(p.nombre)}</div>
            <div class="product-category">${emojis[p.categoria] || '📦'} ${p.categoria}</div>
            <div class="product-price">S/. ${p.precio.toFixed(2)}</div>
            <div class="mb-2">
                <span class="badge ${available ? 'bg-success' : 'bg-danger'}">
                    <i class="${available ? 'ri-check-circle-line' : 'ri-close-circle-line'}"></i>
                    ${available ? 'Disponible' : 'Agotado'}
                </span>
            </div>
            <div class="product-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${p._id}')">
                    <i class="ri-edit-line"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${p._id}')">
                    <i class="ri-delete-bin-line"></i> Eliminar
                </button>
            </div>
        </div>
    `;
    return div;
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
    } catch (e) {
        notify(e.message || 'Error al guardar', true);
    } finally {
        DOM.submitBtn.disabled = false;
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
        DOM.cancelBtn.style.display = 'inline-block';
        DOM.form.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
        notify('No se pudo cargar el producto', true);
    }
}

DOM.cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    DOM.form.reset();
    DOM.productId.value = '';
    DOM.submitBtn.textContent = '✅ Crear Producto';
    DOM.cancelBtn.style.display = 'none';
    isEdit = false;
}

async function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return;

    try {
        const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar');
        
        notify('Producto eliminado ✓', false);
        loadProducts();
    } catch (e) {
        notify(e.message || 'Error al eliminar', true);
    }
}

function notify(msg, isError = false) {
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = msg;
    
    DOM.toast.classList.remove('error', 'success');
    DOM.toast.classList.add(isError ? 'error' : 'success');
    DOM.toast.style.display = 'flex';
    
    setTimeout(() => DOM.toast.style.display = 'none', 3000);
}

function updateCount(count) {
    if (DOM.count) DOM.count.textContent = count;
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    startPolling();
    window.addEventListener('beforeunload', stopPolling);
});

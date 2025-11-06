// admin.js - Lógica mejorada para el panel administrativo

const API_PRODUCTOS = 'https://crispy-octo-spoon.onrender.com/api/productos';

// Elementos del DOM
const form = document.getElementById('product-form');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');
const productsContainer = document.getElementById('products-container');
const productIdInput = document.getElementById('product-id');
const productCountElement = document.getElementById('product-count');
const editModeBadge = document.getElementById('edit-mode-badge');
const loadingOverlay = document.getElementById('loading-overlay');
const notification = document.getElementById('notification');

let isEditMode = false;

// ============================================================
// FUNCIONES PRINCIPALES - CRUD
// ============================================================

/**
 * Carga y muestra todos los productos
 */
async function loadProducts() {
    try {
        setLoading(true);
        const response = await fetch(API_PRODUCTOS);
        
        if (!response.ok) {
            throw new Error('Error al obtener productos');
        }

        const products = await response.json();
        renderProducts(products);
        updateProductCount(products.length);

    } catch (error) {
        console.error('Error al cargar productos:', error);
        showNotification('No se pudieron cargar los productos.', true);
    } finally {
        setLoading(false);
    }
}

/**
 * Renderiza los productos en el DOM
 */
function renderProducts(products) {
    productsContainer.innerHTML = '';

    if (!products || products.length === 0) {
        productsContainer.innerHTML = `
            <div class="empty-state">
                <i class="ri-inbox-line"></i>
                <p>No hay productos aún</p>
                <small>Crea tu primer producto usando el formulario superior</small>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const card = createProductCard(product);
        productsContainer.appendChild(card);
    });
}

/**
 * Crea una tarjeta de producto
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Determinar disponibilidad
    const isAvailable = (product.disponible !== undefined)
        ? product.disponible
        : (product.disponibilidad !== undefined ? product.disponibilidad : true);

    const statusText = isAvailable ? 'Disponible' : 'Agotado';
    const statusClass = isAvailable ? '' : 'unavailable';
    const statusIcon = isAvailable ? 'ri-check-circle-line' : 'ri-close-circle-line';

    // Obtener emoji de categoría
    const categoryEmoji = {
        'Entrada': '🥗',
        'Plato Principal': '🍽️',
        'Bebida': '🥤',
        'Postre': '🍰',
        'Otro': '📦'
    };
    const emoji = categoryEmoji[product.categoria] || '📦';

    card.innerHTML = `
        <div class="product-header">
            <div>
                <h3 class="product-title">${escapeHtml(product.nombre)}</h3>
                <div class="product-category">${emoji} ${product.categoria}</div>
            </div>
        </div>
        
        <div class="product-price">
            <span class="product-price-value">S/. ${product.precio.toFixed(2)}</span>
        </div>
        
        <div class="product-status ${statusClass}">
            <i class="${statusIcon}"></i>
            <span>${statusText}</span>
        </div>
        
        <div class="product-actions">
            <button class="btn btn-edit btn-sm" onclick="fillFormForEdit(event, '${product._id}')">
                <i class="ri-edit-line"></i> Editar
            </button>
            <button class="btn btn-delete btn-sm" onclick="deleteProduct(event, '${product._id}')">
                <i class="ri-delete-bin-line"></i> Eliminar
            </button>
        </div>
    `;

    return card;
}

/**
 * Escapa caracteres HTML para evitar XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Maneja el envío del formulario (CREATE/UPDATE)
 */
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = productIdInput.value;
    const nombre = document.getElementById('nombre').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const categoria = document.getElementById('categoria').value;
    const disponible = document.getElementById('disponible').checked;

    // Validación básica
    if (!nombre || isNaN(precio) || precio < 0 || !categoria) {
        showNotification('Por favor completa todos los campos correctamente.', true);
        return;
    }

    const productData = { nombre, precio, categoria, disponible };

    try {
        let url = API_PRODUCTOS;
        let method = 'POST';
        let actionText = 'creado';

        if (id) {
            url = `${API_PRODUCTOS}/${id}`;
            method = 'PUT';
            actionText = 'actualizado';
        }

        submitButton.disabled = true;
        setLoading(true);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            let errorMsg = 'Error desconocido';
            try {
                const errorData = await response.json();
                errorMsg = errorData.mensaje || errorData.error || errorMsg;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        showNotification(`Producto ${actionText} exitosamente.`, false);
        form.reset();
        resetForm();
        loadProducts();

    } catch (error) {
        console.error('Error al guardar:', error);
        showNotification(error.message || 'Error al guardar el producto', true);
    } finally {
        submitButton.disabled = false;
        setLoading(false);
    }
});

/**
 * Llena el formulario para editar un producto
 */
function fillFormForEdit(e, productId) {
    if (e) e.preventDefault();

    // Obtener todos los productos para encontrar el que queremos editar
    fetch(API_PRODUCTOS)
        .then(r => r.json())
        .then(products => {
            const product = products.find(p => p._id === productId);
            if (!product) throw new Error('Producto no encontrado');

            // Llenar el formulario
            productIdInput.value = product._id;
            document.getElementById('nombre').value = product.nombre;
            document.getElementById('precio').value = product.precio;
            document.getElementById('categoria').value = product.categoria;
            
            const isAvailable = (product.disponible !== undefined)
                ? product.disponible
                : (product.disponibilidad !== undefined ? product.disponibilidad : false);
            document.getElementById('disponible').checked = isAvailable;

            // Cambiar modo edición
            isEditMode = true;
            submitButton.textContent = '💾 Guardar Cambios';
            editModeBadge.style.display = 'flex';
            cancelButton.style.display = 'inline-flex';
            
            // Scroll al formulario
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        })
        .catch(err => {
            console.error('Error:', err);
            showNotification('No se pudo cargar el producto para editar', true);
        });
}

/**
 * Cancela la edición
 */
cancelButton.addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    productIdInput.value = '';
    submitButton.textContent = '✅ Crear Producto';
    editModeBadge.style.display = 'none';
    cancelButton.style.display = 'none';
    isEditMode = false;
}

/**
 * Elimina un producto
 */
async function deleteProduct(e, id) {
    if (e) e.preventDefault();

    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    try {
        setLoading(true);

        const response = await fetch(`${API_PRODUCTOS}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            let errorMsg = 'Error al eliminar';
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        showNotification('Producto eliminado exitosamente.', false);
        loadProducts();

    } catch (error) {
        console.error('Error al eliminar:', error);
        showNotification(error.message || 'Error al eliminar el producto', true);
    } finally {
        setLoading(false);
    }
}

// ============================================================
// FUNCIONES AUXILIARES - UI/UX
// ============================================================

/**
 * Muestra una notificación toast
 */
function showNotification(message, isError = false, timeout = 3000) {
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    
    notification.classList.remove('error', 'success', 'show');
    notification.classList.add('show', isError ? 'error' : 'success');
    
    const icon = notification.querySelector('i');
    if (isError) {
        icon.className = 'ri-close-circle-line';
    } else {
        icon.className = 'ri-check-circle-line';
    }
    
    // Auto-dismiss
    clearTimeout(showNotification._timeout);
    showNotification._timeout = setTimeout(() => {
        notification.classList.remove('show');
    }, timeout);
}

/**
 * Muestra/oculta el overlay de carga
 */
function setLoading(on) {
    if (on) {
        loadingOverlay.classList.add('show');
        document.querySelectorAll('button').forEach(b => b.disabled = true);
    } else {
        loadingOverlay.classList.remove('show');
        document.querySelectorAll('button').forEach(b => {
            b.disabled = false;
        });
    }
}

/**
 * Actualiza el contador de productos
 */
function updateProductCount(count) {
    if (productCountElement) {
        productCountElement.textContent = count;
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

// Cargar productos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    
    // Agregar listener para enfocar en el nombre al cargar
    setTimeout(() => {
        document.getElementById('nombre').focus();
    }, 300);
});
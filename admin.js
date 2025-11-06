// admin.js

// 🚨 IMPORTANTE: Reemplaza esta URL con tu URL pública de Render
// La URL correcta es: https://crispy-octo-spoon.onrender.com/api/productos
const API_PRODUCTOS = 'https://crispy-octo-spoon.onrender.com/api/productos';

// Elementos del DOM
const form = document.getElementById('product-form');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');
const tableBody = document.querySelector('#products-table tbody');
const productIdInput = document.getElementById('product-id');

// --- 1. Cargar y Mostrar Productos (READ) ---
async function loadProducts() {
    try {
        setLoading(true);
        const response = await fetch(API_PRODUCTOS);
        if (!response.ok) throw new Error('Error al obtener productos');
        const products = await response.json();

        tableBody.innerHTML = ''; // Limpiar tabla

        if (!products || products.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 5;
            cell.textContent = 'No hay productos aún.';
            cell.style.textAlign = 'center';
        }

        products.forEach(product => {
            const row = tableBody.insertRow();
            
            // Celda de Nombre
            row.insertCell().textContent = product.nombre;
            
            // Celda de Precio
            row.insertCell().textContent = `S/. ${product.precio.toFixed(2)}`;
            
            // Celda de Categoría
            row.insertCell().textContent = product.categoria;
            
            // Celda de Disponibilidad
            const dispCell = row.insertCell();
            // Compatibilidad: algunos documentos antiguos pueden usar la propiedad
            // 'disponibilidad' en lugar de 'disponible'. Normalizamos aquí.
            const isAvailable = (product.disponible !== undefined)
                ? product.disponible
                : (product.disponibilidad !== undefined ? product.disponibilidad : true);
            dispCell.textContent = isAvailable ? 'Sí' : 'No';
            dispCell.style.color = isAvailable ? 'green' : 'red';
            
            // Celda de Acciones (Botones)
            const actionCell = row.insertCell();
            actionCell.classList.add('action-buttons');

            // Botón Editar
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.classList.add('edit-btn');
            editBtn.onclick = () => fillFormForEdit(product);
            actionCell.appendChild(editBtn);

            // Botón Eliminar
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.onclick = () => deleteProduct(product._id);
            actionCell.appendChild(deleteBtn);
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
        showNotification('No se pudieron cargar los productos.', true);
    } finally {
        setLoading(false);
    }
}

// --- 2. Manejar Envío del Formulario (CREATE / UPDATE) ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = productIdInput.value;
    const nombre = document.getElementById('nombre').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const categoria = document.getElementById('categoria').value;
    const disponible = document.getElementById('disponible').checked;

    const productData = { nombre, precio, categoria, disponible };

    try {
        let url = API_PRODUCTOS;
        let method = 'POST';

        if (id) {
            url = `${API_PRODUCTOS}/${id}`;
            method = 'PUT';
        }

        // UX: deshabilitar botón y mostrar loading
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
            let msg = 'Error desconocido al guardar el producto.';
            try { const error = await response.json(); msg = error.mensaje || msg; } catch(e){}
            throw new Error(msg);
        }

        const saved = await response.json().catch(()=>null);
        showNotification(`Producto ${id ? 'actualizado' : 'creado'} con éxito.`);
        form.reset(); 
        resetForm(); // Volver a modo creación si estábamos editando
        loadProducts(); // Recargar la lista
    } catch (error) {
        console.error('Error al guardar el producto:', error);
        showNotification(error.message, true);
    } finally {
        submitButton.disabled = false;
        setLoading(false);
    }
});

// --- 3. Llenar Formulario para Editar (PRE-UPDATE) ---
function fillFormForEdit(product) {
    productIdInput.value = product._id;
    document.getElementById('nombre').value = product.nombre;
    document.getElementById('precio').value = product.precio;
    document.getElementById('categoria').value = product.categoria;
    // Compatibilidad con campo antiguo 'disponibilidad'
    const isAvailable = (product.disponible !== undefined)
        ? product.disponible
        : (product.disponibilidad !== undefined ? product.disponibilidad : false);
    document.getElementById('disponible').checked = isAvailable;

    submitButton.textContent = 'Guardar Cambios';
    cancelButton.style.display = 'inline-block';

    // Mostrar ID en formulario (usuario puede verlo si quiere)
    let idLabel = document.getElementById('product-id-label');
    if (!idLabel) {
        idLabel = document.createElement('div');
        idLabel.id = 'product-id-label';
        idLabel.style.marginTop = '8px';
        document.getElementById('form-section').appendChild(idLabel);
    }
    idLabel.textContent = `ID: ${product._id}`;
}

// --- 4. Volver a Modo Creación ---
cancelButton.addEventListener('click', resetForm);
function resetForm() {
    form.reset();
    productIdInput.value = '';
    submitButton.textContent = 'Crear Producto';
    cancelButton.style.display = 'none';
}

// --- 5. Eliminar Producto (DELETE) ---
async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        return;
    }

    try {
        setLoading(true);
        const response = await fetch(`${API_PRODUCTOS}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            let msg = 'Error desconocido al eliminar el producto.';
            try { const error = await response.json(); msg = error.mensaje || msg; } catch(e){}
            throw new Error(msg);
        }

        showNotification('Producto eliminado con éxito.');
        loadProducts(); // Recargar la lista

    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        showNotification(error.message, true);
    }
    finally { setLoading(false); }
}

// --- Helpers: notifications & loading ---
function showNotification(message, isError = false, timeout = 3000) {
    const n = document.getElementById('notification');
    n.textContent = message;
    if (isError) n.classList.add('error'); else n.classList.remove('error');
    n.style.display = 'block';
    clearTimeout(showNotification._t);
    showNotification._t = setTimeout(() => { n.style.display = 'none'; }, timeout);
}

function setLoading(on) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = on ? 'flex' : 'none';
    // disable action buttons while loading
    document.querySelectorAll('button').forEach(b => b.disabled = on);
}

// Inicializar la carga de productos al cargar la página
document.addEventListener('DOMContentLoaded', loadProducts);
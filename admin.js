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
        const response = await fetch(API_PRODUCTOS);
        const products = await response.json();
        
        tableBody.innerHTML = ''; // Limpiar tabla
        
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
        alert('No se pudieron cargar los productos. Verifique la conexión a la API.');
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
            // Modo Edición (UPDATE)
            url = `${API_PRODUCTOS}/${id}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error desconocido al guardar el producto.');
        }

        alert(`Producto ${id ? 'actualizado' : 'creado'} con éxito.`);
        form.reset(); 
        loadProducts(); // Recargar la lista
        resetForm(); // Volver a modo creación si estábamos editando

    } catch (error) {
        console.error('Error al guardar el producto:', error);
        alert(error.message);
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
        const response = await fetch(`${API_PRODUCTOS}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error desconocido al eliminar el producto.');
        }

        alert('Producto eliminado con éxito.');
        loadProducts(); // Recargar la lista

    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        alert(error.message);
    }
}

// Inicializar la carga de productos al cargar la página
document.addEventListener('DOMContentLoaded', loadProducts);
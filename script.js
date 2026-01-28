// Initialize inventory array and counter
let inventory = [];
let editingId = null;
let nextId = 1;

// Load data from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    displayInventory();
    updateSummary();
});

// Form submission handler
document.getElementById('inventoryForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const productName = document.getElementById('productName').value.trim();
    const category = document.getElementById('category').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);

    if (editingId !== null) {
        // Update existing product
        const product = inventory.find(item => item.id === editingId);
        product.productName = productName;
        product.category = category;
        product.quantity = quantity;
        product.price = price;
        editingId = null;
        document.getElementById('submitBtn').textContent = 'Add Product';
        document.getElementById('cancelBtn').style.display = 'none';
    } else {
        // Add new product
        const newProduct = {
            id: nextId++,
            productName: productName,
            category: category,
            quantity: quantity,
            price: price
        };
        inventory.push(newProduct);
    }

    saveToLocalStorage();
    displayInventory();
    updateSummary();
    this.reset();
});

// Cancel edit button
document.getElementById('cancelBtn').addEventListener('click', function() {
    editingId = null;
    document.getElementById('submitBtn').textContent = 'Add Product';
    this.style.display = 'none';
    document.getElementById('inventoryForm').reset();
});

// Display inventory in table
function displayInventory() {
    const tbody = document.getElementById('inventoryBody');
    const emptyMessage = document.getElementById('emptyMessage');

    if (inventory.length === 0) {
        tbody.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';
    tbody.innerHTML = '';

    inventory.forEach(product => {
        const totalValue = (product.quantity * product.price).toFixed(2);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.productName}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>$${totalValue}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${product.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Edit product
function editProduct(id) {
    const product = inventory.find(item => item.id === id);
    if (!product) return;

    document.getElementById('productName').value = product.productName;
    document.getElementById('category').value = product.category;
    document.getElementById('quantity').value = product.quantity;
    document.getElementById('price').value = product.price;

    editingId = id;
    document.getElementById('submitBtn').textContent = 'Update Product';
    document.getElementById('cancelBtn').style.display = 'inline-block';

    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Delete product
function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        inventory = inventory.filter(item => item.id !== id);
        saveToLocalStorage();
        displayInventory();
        updateSummary();
    }
}

// Update summary section
function updateSummary() {
    const totalProducts = inventory.length;
    const totalValue = inventory.reduce((sum, product) => {
        return sum + (product.quantity * product.price);
    }, 0);

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalValue').textContent = totalValue.toFixed(2);
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('nextId', nextId.toString());
}

// Load from localStorage
function loadFromLocalStorage() {
    const savedInventory = localStorage.getItem('inventory');
    const savedNextId = localStorage.getItem('nextId');

    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
    }

    if (savedNextId) {
        nextId = parseInt(savedNextId);
    }
}
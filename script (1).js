// Initialize data structures
let inventory = [];
let movementHistory = [];
let editingId = null;
let nextItemNo = 1;

// Auto-calculate CBM when dimensions change
document.getElementById('lengthCm').addEventListener('input', calculateCBM);
document.getElementById('widthCm').addEventListener('input', calculateCBM);
document.getElementById('heightCm').addEventListener('input', calculateCBM);

function calculateCBM() {
    const l = parseFloat(document.getElementById('lengthCm').value) || 0;
    const w = parseFloat(document.getElementById('widthCm').value) || 0;
    const h = parseFloat(document.getElementById('heightCm').value) || 0;

    if (l > 0 && w > 0 && h > 0) {
        // CBM = (L × W × H) / 1,000,000 (convert cm³ to m³)
        const cbm = (l * w * h) / 1000000;
        document.getElementById('cbm').value = cbm.toFixed(3);
    } else {
        document.getElementById('cbm').value = '';
    }
}

// Load data on page load
window.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    displayInventory();
    displayHistory();
    updateSummary();
});

// Form submission handler
document.getElementById('inventoryForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const remark = document.getElementById('remark').value.trim();
    const itochu = document.getElementById('itochu').value.trim();
    const location = document.getElementById('location').value.trim();
    const newLocation = document.getElementById('newLocation').value.trim();
    const sku = document.getElementById('sku').value.trim();
    const description = document.getElementById('description').value.trim();
    const pcsInStorage = parseInt(document.getElementById('pcsInStorage').value) || 0;
    const lengthCm = parseFloat(document.getElementById('lengthCm').value) || 0;
    const widthCm = parseFloat(document.getElementById('widthCm').value) || 0;
    const heightCm = parseFloat(document.getElementById('heightCm').value) || 0;
    const cbm = parseFloat(document.getElementById('cbm').value) || 0;
    const balancePcs = parseInt(document.getElementById('balancePcs').value) || 0;
    const actualRec = document.getElementById('actualRec').value.trim();
    const purpose1 = document.getElementById('purpose1').value.trim();
    const purpose2 = document.getElementById('purpose2').value.trim();
    const project = document.getElementById('project').value.trim();
    const remarkByKerry = document.getElementById('remarkByKerry').value.trim();
    const remarkByItochu1 = document.getElementById('remarkByItochu1').value.trim();
    const remarkByItochu2 = document.getElementById('remarkByItochu2').value.trim();

    if (editingId !== null) {
        // Update existing product
        const product = inventory.find(item => item.itemNo === editingId);
        const oldPcs = product.pcsInStorage;

        product.remark = remark;
        product.itochu = itochu;
        product.location = location;
        product.newLocation = newLocation;
        product.sku = sku;
        product.description = description;
        product.pcsInStorage = pcsInStorage;
        product.lengthCm = lengthCm;
        product.widthCm = widthCm;
        product.heightCm = heightCm;
        product.cbm = cbm;
        product.balancePcs = balancePcs;
        product.actualRec = actualRec;
        product.purpose1 = purpose1;
        product.purpose2 = purpose2;
        product.project = project;
        product.remarkByKerry = remarkByKerry;
        product.remarkByItochu1 = remarkByItochu1;
        product.remarkByItochu2 = remarkByItochu2;
        product.lastUpdated = new Date().toISOString();

        // Log movement if quantity changed
        if (pcsInStorage !== oldPcs) {
            addMovement(product.itemNo, sku, description, location, pcsInStorage - oldPcs, 'Product Updated');
        }

        editingId = null;
        document.getElementById('submitBtn').textContent = 'Add Product';
        document.getElementById('formTitle').textContent = '➕ Add New Product';
        document.getElementById('cancelBtn').style.display = 'none';
    } else {
        // Add new product
        const newProduct = {
            itemNo: nextItemNo++,
            remark: remark,
            itochu: itochu,
            location: location,
            newLocation: newLocation,
            sku: sku,
            description: description,
            pcsInStorage: pcsInStorage,
            lengthCm: lengthCm,
            widthCm: widthCm,
            heightCm: heightCm,
            cbm: cbm,
            balancePcs: balancePcs,
            actualRec: actualRec,
            purpose1: purpose1,
            purpose2: purpose2,
            project: project,
            remarkByKerry: remarkByKerry,
            remarkByItochu1: remarkByItochu1,
            remarkByItochu2: remarkByItochu2,
            lastUpdated: new Date().toISOString()
        };
        inventory.push(newProduct);

        // Log movement
        addMovement(newProduct.itemNo, sku, description, location, pcsInStorage, 'Initial Stock');
    }

    saveToLocalStorage();
    displayInventory();
    displayHistory();
    updateSummary();
    this.reset();

    // Scroll to table
    document.querySelector('.table-section').scrollIntoView({ behavior: 'smooth' });
});

// Display inventory in table
function displayInventory() {
    const tbody = document.getElementById('inventoryBody');
    const emptyMessage = document.getElementById('emptyMessage');

    let displayData = [...inventory];

    // Apply search filter
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        displayData = displayData.filter(p => 
            p.itemNo.toString().includes(searchTerm) ||
            p.sku.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.location.toLowerCase().includes(searchTerm) ||
            p.newLocation.toLowerCase().includes(searchTerm) ||
            p.remark.toLowerCase().includes(searchTerm) ||
            p.itochu.toLowerCase().includes(searchTerm)
        );
    }

    // Apply low stock filter (items where Balance PCS is less than 10% of PCS in storage)
    if (document.getElementById('lowStockFilter').checked) {
        displayData = displayData.filter(p => 
            p.balancePcs < (p.pcsInStorage * 0.1)
        );
    }

    if (displayData.length === 0) {
        tbody.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';
    tbody.innerHTML = '';

    displayData.forEach(product => {
        const isLowStock = product.balancePcs < (product.pcsInStorage * 0.1);
        const rowClass = isLowStock ? 'low-stock' : '';

        const row = document.createElement('tr');
        row.className = rowClass;
        row.innerHTML = `
            <td><strong>${product.itemNo}</strong></td>
            <td>${product.remark || '-'}</td>
            <td>${product.itochu || '-'}</td>
            <td><strong>${product.location}</strong></td>
            <td>${product.newLocation || '-'}</td>
            <td><strong>${product.sku}</strong></td>
            <td>${product.description}</td>
            <td><strong>${product.pcsInStorage}</strong></td>
            <td>${product.lengthCm || '-'}</td>
            <td>${product.widthCm || '-'}</td>
            <td>${product.heightCm || '-'}</td>
            <td>${product.cbm ? product.cbm.toFixed(3) : '-'}</td>
            <td><strong>${product.balancePcs || '-'}</strong></td>
            <td>${product.actualRec || '-'}</td>
            <td>${product.purpose1 || '-'}</td>
            <td>${product.purpose2 || '-'}</td>
            <td>${product.project || '-'}</td>
            <td>${product.remarkByKerry || '-'}</td>
            <td>${product.remarkByItochu1 || '-'}</td>
            <td>${product.remarkByItochu2 || '-'}</td>
            <td class="action-cell">
                <button class="action-btn adjust-btn" onclick="openAdjustment(${product.itemNo})">Adjust</button>
                <button class="action-btn edit-btn" onclick="editProduct(${product.itemNo})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.itemNo})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Search inventory
function searchInventory() {
    displayInventory();
}

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('lowStockFilter').checked = false;
    displayInventory();
}

// Filter inventory
function filterInventory() {
    displayInventory();
}

// Edit product
function editProduct(itemNo) {
    const product = inventory.find(item => item.itemNo === itemNo);
    if (!product) return;

    document.getElementById('remark').value = product.remark;
    document.getElementById('itochu').value = product.itochu;
    document.getElementById('location').value = product.location;
    document.getElementById('newLocation').value = product.newLocation;
    document.getElementById('sku').value = product.sku;
    document.getElementById('description').value = product.description;
    document.getElementById('pcsInStorage').value = product.pcsInStorage;
    document.getElementById('lengthCm').value = product.lengthCm;
    document.getElementById('widthCm').value = product.widthCm;
    document.getElementById('heightCm').value = product.heightCm;
    document.getElementById('cbm').value = product.cbm;
    document.getElementById('balancePcs').value = product.balancePcs;
    document.getElementById('actualRec').value = product.actualRec;
    document.getElementById('purpose1').value = product.purpose1;
    document.getElementById('purpose2').value = product.purpose2;
    document.getElementById('project').value = product.project;
    document.getElementById('remarkByKerry').value = product.remarkByKerry;
    document.getElementById('remarkByItochu1').value = product.remarkByItochu1;
    document.getElementById('remarkByItochu2').value = product.remarkByItochu2;

    editingId = itemNo;
    document.getElementById('submitBtn').textContent = 'Update Product';
    document.getElementById('formTitle').textContent = '✏️ Edit Product';
    document.getElementById('cancelBtn').style.display = 'inline-block';

    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Cancel edit
function cancelEdit() {
    editingId = null;
    document.getElementById('submitBtn').textContent = 'Add Product';
    document.getElementById('formTitle').textContent = '➕ Add New Product';
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('inventoryForm').reset();
}

// Delete product
function deleteProduct(itemNo) {
    const product = inventory.find(item => item.itemNo === itemNo);
    if (!product) return;

    if (confirm(`Delete Item ${product.itemNo} - ${product.sku} (${product.description})?`)) {
        addMovement(product.itemNo, product.sku, product.description, product.location, -product.pcsInStorage, 'Product Deleted');
        inventory = inventory.filter(item => item.itemNo !== itemNo);
        saveToLocalStorage();
        displayInventory();
        displayHistory();
        updateSummary();
    }
}

// Open adjustment panel
function openAdjustment(itemNo) {
    const product = inventory.find(item => item.itemNo === itemNo);
    if (!product) return;

    document.getElementById('adjustItemNo').textContent = product.itemNo;
    document.getElementById('adjustSku').textContent = product.sku;
    document.getElementById('adjustDesc').textContent = product.description;
    document.getElementById('adjustLocation').textContent = product.location;
    document.getElementById('adjustCurrentStock').textContent = product.pcsInStorage;
    document.getElementById('adjustQuantity').value = '';
    document.getElementById('adjustmentSection').style.display = 'block';
    document.getElementById('adjustmentSection').dataset.itemNo = itemNo;

    document.getElementById('adjustmentSection').scrollIntoView({ behavior: 'smooth' });
}

// Close adjustment panel
function closeAdjustment() {
    document.getElementById('adjustmentSection').style.display = 'none';
    delete document.getElementById('adjustmentSection').dataset.itemNo;
}

// Apply adjustment
function applyAdjustment() {
    const itemNo = parseInt(document.getElementById('adjustmentSection').dataset.itemNo);
    const product = inventory.find(item => item.itemNo === itemNo);
    if (!product) return;

    const adjustQty = parseInt(document.getElementById('adjustQuantity').value);
    const reason = document.getElementById('adjustReason').value;

    if (!adjustQty || adjustQty === 0) {
        alert('Please enter a valid adjustment quantity (e.g., +10 or -5)');
        return;
    }

    const newQty = product.pcsInStorage + adjustQty;
    if (newQty < 0) {
        alert('Adjustment would result in negative stock. Please check the quantity.');
        return;
    }

    product.pcsInStorage = newQty;
    product.lastUpdated = new Date().toISOString();

    addMovement(product.itemNo, product.sku, product.description, product.location, adjustQty, reason);

    saveToLocalStorage();
    displayInventory();
    displayHistory();
    updateSummary();
    closeAdjustment();
}

// Add movement to history
function addMovement(itemNo, sku, description, location, change, reason) {
    const movement = {
        timestamp: new Date().toISOString(),
        itemNo: itemNo,
        sku: sku,
        description: description,
        location: location,
        change: change,
        reason: reason
    };

    movementHistory.unshift(movement);

    // Keep only last 100 movements
    if (movementHistory.length > 100) {
        movementHistory = movementHistory.slice(0, 100);
    }
}

// Display movement history
function displayHistory() {
    const tbody = document.getElementById('historyBody');

    if (movementHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No movements recorded yet</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    // Show last 20 movements
    const recentMovements = movementHistory.slice(0, 20);

    recentMovements.forEach(movement => {
        const timestamp = new Date(movement.timestamp).toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        const changeClass = movement.change >= 0 ? 'change-positive' : 'change-negative';
        const changeText = movement.change >= 0 ? `+${movement.change}` : movement.change;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${timestamp}</td>
            <td><strong>${movement.itemNo}</strong></td>
            <td><strong>${movement.sku}</strong></td>
            <td>${movement.description}</td>
            <td>${movement.location}</td>
            <td class="${changeClass}">${changeText}</td>
            <td>${movement.reason}</td>
        `;
        tbody.appendChild(row);
    });
}

// Update summary section
function updateSummary() {
    const totalItems = inventory.length;
    const totalPcs = inventory.reduce((sum, p) => sum + p.pcsInStorage, 0);
    const totalCbm = inventory.reduce((sum, p) => sum + (p.cbm || 0), 0);
    const lowStockCount = inventory.filter(p => 
        p.balancePcs < (p.pcsInStorage * 0.1)
    ).length;

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalPcs').textContent = totalPcs;
    document.getElementById('totalCbm').textContent = totalCbm.toFixed(3);
    document.getElementById('lowStockCount').textContent = lowStockCount;
}

// Sort table
let sortDirection = {};
function sortTable(columnIndex) {
    const table = document.getElementById('inventoryTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Toggle sort direction
    sortDirection[columnIndex] = !sortDirection[columnIndex];
    const isAscending = sortDirection[columnIndex];

    rows.sort((a, b) => {
        const aVal = a.cells[columnIndex].textContent.trim();
        const bVal = b.cells[columnIndex].textContent.trim();

        // Try to parse as number
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);

        if (!isNaN(aNum) && !isNaN(bNum)) {
            return isAscending ? aNum - bNum : bNum - aNum;
        }

        // String comparison
        return isAscending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    // Reattach sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Export to Excel (CSV format)
function exportToExcel() {
    if (inventory.length === 0) {
        alert('No data to export');
        return;
    }

    let csv = 'Item No.,Remark,ITOCHU,Location,New Location,SKU#,Description,PCS in storage,L,W,H,CBM,Balance (PCS),Actual Rec.,Purpose1,Purpose2,Project,Remark by Kerry,Remark by Itochu1,Remark by Itochu2\n';

    inventory.forEach(p => {
        csv += `${p.itemNo},"${p.remark}","${p.itochu}","${p.location}","${p.newLocation}","${p.sku}","${p.description}",${p.pcsInStorage},${p.lengthCm || ''},${p.widthCm || ''},${p.heightCm || ''},${p.cbm ? p.cbm.toFixed(3) : ''},${p.balancePcs || ''},"${p.actualRec}","${p.purpose1}","${p.purpose2}","${p.project}","${p.remarkByKerry}","${p.remarkByItochu1}","${p.remarkByItochu2}"\n`;
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('movementHistory', JSON.stringify(movementHistory));
    localStorage.setItem('nextItemNo', nextItemNo.toString());
}

// Load from localStorage
function loadFromLocalStorage() {
    const savedInventory = localStorage.getItem('inventory');
    const savedHistory = localStorage.getItem('movementHistory');
    const savedNextItemNo = localStorage.getItem('nextItemNo');

    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
    }

    if (savedHistory) {
        movementHistory = JSON.parse(savedHistory);
    }

    if (savedNextItemNo) {
        nextItemNo = parseInt(savedNextItemNo);
    }
}
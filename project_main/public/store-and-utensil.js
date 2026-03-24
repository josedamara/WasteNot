async function fetchAndDisplayStoreProjection() {
    const tableElement = document.getElementById('list-store-table');
    const tableHead = tableElement.querySelector('thead');
    const tableBody = tableElement.querySelector('tbody');
    const variableArray = [];

    if (document.getElementById("store-name-checkbox").checked) {
        variableArray.push("Name");
    }
    if (document.getElementById("store-address-checkbox").checked) {
        variableArray.push("Address");
    }
    if (document.getElementById("store-contact-checkbox").checked) {
        variableArray.push("Contact");
    }

    // Validate at least one checkbox is selected
    if (variableArray.length === 0) {
        showNotification('Please select at least one attribute to display', 'warning');
        return;
    }

    let url = "";

    if (variableArray.length === 3) {
        url = `get-all-store`;
    } else {
        url = `get-store-projection?vars=${encodeURIComponent(variableArray.join(","))}`;
    }

    try {
        const response = await fetch(url, {
            method: 'GET'
        });

        const responseData = await response.json();
        const demotableContent = responseData.data;

        tableHead.innerHTML = "";

        const headerRow = tableHead.insertRow();

        variableArray.forEach(col => {
            const th = document.createElement("th");
            th.textContent = col;
            headerRow.appendChild(th);
        });

        // Always clear old, already fetched data before new fetching process.
        if (tableBody) {
            tableBody.innerHTML = '';
        }

        if (demotableContent.length === 0) {
            showNotification('No stores found', 'info');
        } else {
            showNotification(`Displaying ${demotableContent.length} store(s)`, 'success', 2000);
        }

        demotableContent.forEach(store => {
            const row = tableBody.insertRow();
            store.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        showNotification('Error fetching store data', 'error');
        console.error('Error:', error);
    }
}

// Deletes a store from the database with validation
async function deleteStore(event) {
    event.preventDefault();

    const nameValue = document.getElementById('del-store-name').value;
    const addressValue = document.getElementById('del-store-address').value;

    // Validate inputs
    const validations = {
        'Store Name': {
            isValid: isNotEmpty(nameValue) && meetsMinLength(nameValue, 2),
            message: 'Store name must be at least 2 characters long'
        },
        'Store Address': {
            isValid: isNotEmpty(addressValue) && meetsMinLength(addressValue, 5),
            message: 'Store address must be at least 5 characters long'
        }
    };

    if (!validateForm(validations)) {
        return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the store "${nameValue}" at "${addressValue}"?`)) {
        return;
    }

    try {
        const response = await fetch('/delete-store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nameValue,
                address: addressValue
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('Store removed successfully!', 'success');
            fetchAndDisplayStoreProjection();
            
            // Clear form
            document.getElementById('del-store-name').value = '';
            document.getElementById('del-store-address').value = '';
        } else {
            showNotification('Error removing store. The store with that name and address may not exist.', 'error');
        }
    } catch (error) {
        showNotification('Network error while removing store', 'error');
        console.error('Error:', error);
    }
}

// Add a new store with validation
async function addStore(event) {
    event.preventDefault();

    const nameValue = document.getElementById('new-store-name').value;
    const addressValue = document.getElementById('new-store-address').value;
    const contactValue = document.getElementById('new-store-contact').value;

    // Validate inputs
    const validations = {
        'Store Name': {
            isValid: isNotEmpty(nameValue) && meetsMinLength(nameValue, 2),
            message: 'Store name must be at least 2 characters long'
        },
        'Store Address': {
            isValid: isNotEmpty(addressValue) && meetsMinLength(addressValue, 5),
            message: 'Store address must be at least 5 characters long'
        },
        'Store Contact': {
            isValid: isNotEmpty(contactValue) && /^[\d\s\-\+\(\)]+$/.test(contactValue),
            message: 'Contact must be a valid phone number (digits, spaces, dashes, plus, or parentheses)'
        }
    };

    if (!validateForm(validations)) {
        return;
    }

    try {
        const response = await fetch('/create-store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                storeName: nameValue,
                address: addressValue,
                contact: contactValue
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('Store added successfully!', 'success');
            fetchAndDisplayStoreProjection();
            
            // Clear form
            document.getElementById('new-store-name').value = '';
            document.getElementById('new-store-address').value = '';
            document.getElementById('new-store-contact').value = '';
        } else {
            showNotification('Error adding store. A store with this name and address may already exist.', 'error');
        }
    } catch (error) {
        showNotification('Network error while adding store', 'error');
        console.error('Error:', error);
    }
}

// Add a new utensil with validation
async function addUtensil(event) {
    event.preventDefault();

    const nameValue = document.getElementById('new-utensil-name').value;
    const materialValue = document.getElementById('new-utensil-material').value;
    const sustainableValue = document.getElementById('new-utensil-is-sustainable').value;

    // Validate inputs
    const validations = {
        'Utensil Name': {
            isValid: isNotEmpty(nameValue) && meetsMinLength(nameValue, 2),
            message: 'Utensil name must be at least 2 characters long'
        },
        'Material': {
            isValid: isNotEmpty(materialValue) && meetsMinLength(materialValue, 2),
            message: 'Material must be at least 2 characters long'
        },
        'Is Sustainable': {
            isValid: isYesOrNo(sustainableValue),
            message: 'Is Sustainable must be either "yes" or "no"'
        }
    };

    if (!validateForm(validations)) {
        return;
    }

    try {
        const response = await fetch('/create-utensil', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nameValue,
                material: materialValue,
                sustainable: sustainableValue.toLowerCase()
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('Utensil added successfully!', 'success');
            fetchAndDisplayUtensils();
            
            // Clear form
            document.getElementById('new-utensil-name').value = '';
            document.getElementById('new-utensil-material').value = '';
            document.getElementById('new-utensil-is-sustainable').value = '';
        } else {
            showNotification('Error adding utensil. A utensil with this name and material may already exist.', 'error');
        }
    } catch (error) {
        showNotification('Network error while adding utensil', 'error');
        console.error('Error:', error);
    }
}

// Remove a utensil with validation
async function removeUtensil(event) {
    event.preventDefault();

    const nameValue = document.getElementById('del-utensil-name').value;
    const materialValue = document.getElementById('del-utensil-material').value;

    // Validate inputs
    const validations = {
        'Utensil Name': {
            isValid: isNotEmpty(nameValue),
            message: 'Utensil name is required'
        },
        'Material': {
            isValid: isNotEmpty(materialValue),
            message: 'Material is required'
        }
    };

    if (!validateForm(validations)) {
        return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the utensil "${nameValue}" made of "${materialValue}"?`)) {
        return;
    }

    try {
        const response = await fetch('/delete-utensil', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nameValue,
                material: materialValue
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('Utensil removed successfully!', 'success');
            fetchAndDisplayUtensils();
            
            // Clear form
            document.getElementById('del-utensil-name').value = '';
            document.getElementById('del-utensil-material').value = '';
        } else {
            showNotification('Error removing utensil. The utensil with that name and material may not exist.', 'error');
        }
    } catch (error) {
        showNotification('Network error while removing utensil', 'error');
        console.error('Error:', error);
    }
}

// Fetch and display all utensils
async function fetchAndDisplayUtensils() {
    try {
        const response = await fetch('/get-all-utensil', {
            method: 'GET'
        });

        const responseData = await response.json();
        const utensils = responseData.data;

        const tableDiv = document.getElementById('list-utensil-table');
        
        if (utensils.length === 0) {
            tableDiv.innerHTML = '<p>No utensils found</p>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Material</th>
                        <th>Is Sustainable</th>
                    </tr>
                </thead>
                <tbody>
        `;

        utensils.forEach(utensil => {
            tableHTML += '<tr>';
            utensil.forEach(field => {
                tableHTML += `<td>${field}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table>';
        tableDiv.innerHTML = tableHTML;
    } catch (error) {
        showNotification('Error fetching utensil data', 'error');
        console.error('Error:', error);
    }
}

window.onload = () => {
    checkDbConnection();
    
    // Store form listeners
    const removeStoreForm = document.getElementById("remove-store-form");
    if (removeStoreForm) {
        removeStoreForm.addEventListener("submit", deleteStore);
    }
    
    const addStoreForm = document.querySelector(".add-store-form form");
    if (addStoreForm) {
        addStoreForm.addEventListener("submit", addStore);
    }
    
    // Utensil form listeners
    const addUtensilForm = document.querySelector(".add-utensil-form form");
    if (addUtensilForm) {
        addUtensilForm.addEventListener("submit", addUtensil);
    }
    
    const removeUtensilForm = document.querySelector(".remove-utensil-form form");
    if (removeUtensilForm) {
        removeUtensilForm.addEventListener("submit", removeUtensil);
    }
    
    // Load initial data
    fetchAndDisplayUtensils();
};
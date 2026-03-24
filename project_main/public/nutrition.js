
async function checkDbConnection() {
    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    response.text()
    .then((text) => {
        console.log(text);
        if (text === 'connected') {
            showNotification('Database connected successfully', 'success', 2000);
        } else {
            showNotification('Unable to connect to database', 'error');
        }
    })
    .catch((error) => {
        showNotification('Connection timed out', 'error');
        console.error('Connection error:', error);
    });
}

// Fetches data from the nutrition table and displays it.
async function fetchAndDisplayNutritions() {
    const tableElement = document.getElementById('list-nutrition-table');
    const tableBody = tableElement.querySelector('tbody');

    try {
        const response = await fetch('/get-all-nutrition-types', {
            method: 'GET'
        });

        const responseData = await response.json();
        const demotableContent = responseData.data;

        // Always clear old, already fetched data before new fetching process.
        if (tableBody) {
            tableBody.innerHTML = '';
        }

        demotableContent.forEach(user => {
            const row = tableBody.insertRow();
            user.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        showNotification('Error fetching nutrition data', 'error');
        console.error('Error:', error);
    }
}

function addCondition() {
    const conditions = document.getElementById("list-nutrition-selection-conditions");

    const div = document.createElement("div");
    div.className = "condition-div";

    div.innerHTML = `
        <select class="attribute">
            <option value="FatInMg">Fat (in mg)</option>
            <option value="ProteinInMg">Protein (in mg)</option>
            <option value="CarbohydrateInMg">Carbohydrate (in mg)</option>
            <option value="SodiumInMg">Sodium (in mg)</option>
            <option value="PotassiumInMg">Potassium (in mg)</option>
        </select>

        <select class="comparator">
            <option value="=">=</option>
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
            <option value=">=">&gt;=</option>
            <option value="<=">&lt;=</option>
        </select>

        <input type="text" class="value">

        <select class="logic">
            <option value="AND">AND</option>
            <option value="OR">OR</option>
        </select>
        
        <button type="button" class="remove-condition-btn" style="margin-left: 10px; padding: 5px 10px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Remove</button>
    `;

    // Add remove functionality
    const removeBtn = div.querySelector('.remove-condition-btn');
    removeBtn.addEventListener('click', () => {
        div.remove();
    });

    conditions.appendChild(div);
}

async function fetchAndDisplayNutritionsSelection() {
    const conditionsDivs = document.querySelectorAll(".condition-div");

    if (conditionsDivs.length === 0) {
        showNotification('Please add at least one condition', 'warning');
        return;
    }

    let conditions = [];
    let hasEmptyValues = false;

    conditionsDivs.forEach((row, index) => {
        const attribute = row.querySelector(".attribute").value;
        const comparator = row.querySelector(".comparator").value;
        const value = row.querySelector(".value").value;
        let logic = row.querySelector(".logic").value;

        // Check if value is empty
        if (!value || value.trim() === '') {
            hasEmptyValues = true;
            return;
        }

        // Validate that value is a number for nutritional values
        if (!isNonNegativeNumber(value)) {
            showNotification('All nutritional values must be non-negative numbers', 'error');
            hasEmptyValues = true;
            return;
        }

        if (index === conditionsDivs.length - 1) logic = "";

        conditions.push({
            attribute: attribute,
            comparator: comparator,
            value: value,
            logic: logic
        });
    });

    if (hasEmptyValues) {
        showNotification('Please fill in all condition values with valid numbers', 'error');
        return;
    }

    const tableElement = document.getElementById('list-nutrition-selection-table');
    const tableBody = tableElement.querySelector('tbody');

    try {
        const response = await fetch(`/get-selection-nutrition-types`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({conditions})
        });

        const responseData = await response.json();
        const demotableContent = responseData.data;

        // Always clear old, already fetched data before new fetching process.
        if (tableBody) {
            tableBody.innerHTML = '';
        }

        if (demotableContent.length === 0) {
            showNotification('No nutrition data matches your criteria', 'info');
        } else {
            showNotification(`Found ${demotableContent.length} nutrition record(s)`, 'success', 2000);
        }

        demotableContent.forEach(user => {
            const row = tableBody.insertRow();
            user.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        showNotification('Error fetching filtered nutrition data', 'error');
        console.error('Error:', error);
    }
}

// Insert new nutrition record with validation
async function insertNutrition(event) {
    event.preventDefault();

    const ingredientName = document.getElementById('new-nutrition-name').value;
    const fat = document.getElementById('new-nutrition-fat').value;
    const protein = document.getElementById('new-nutrition-protein').value;
    const carbohydrate = document.getElementById('new-nutrition-carbohydrate').value;
    const sodium = document.getElementById('new-nutrition-sodium').value;
    const potassium = document.getElementById('new-nutrition-potassium').value;

    // Validate all fields
    const validations = {
        'Ingredient Name': {
            isValid: isNotEmpty(ingredientName) && meetsMinLength(ingredientName, 2),
            message: 'Ingredient name must be at least 2 characters long'
        },
        'Fat': {
            isValid: isNonNegativeNumber(fat),
            message: 'Fat must be a non-negative number (in mg)'
        },
        'Protein': {
            isValid: isNonNegativeNumber(protein),
            message: 'Protein must be a non-negative number (in mg)'
        },
        'Carbohydrate': {
            isValid: isNonNegativeNumber(carbohydrate),
            message: 'Carbohydrate must be a non-negative number (in mg)'
        },
        'Sodium': {
            isValid: isNonNegativeNumber(sodium),
            message: 'Sodium must be a non-negative number (in mg)'
        },
        'Potassium': {
            isValid: isNonNegativeNumber(potassium),
            message: 'Potassium must be a non-negative number (in mg)'
        }
    };

    if (!validateForm(validations)) {
        return;
    }

    try {
        const response = await fetch('/create-nutrition-type', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ingredientName,
                fat,
                protein,
                carbohydrate,
                sodium,
                potassium
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('Nutrition information added successfully!', 'success');
            fetchTableData();
            
            // Clear form
            document.getElementById('new-nutrition-name').value = '';
            document.getElementById('new-nutrition-fat').value = '';
            document.getElementById('new-nutrition-protein').value = '';
            document.getElementById('new-nutrition-carbohydrate').value = '';
            document.getElementById('new-nutrition-sodium').value = '';
            document.getElementById('new-nutrition-potassium').value = '';
        } else {
            showNotification('Error adding nutrition. The ingredient may not exist or nutrition data already exists for this ingredient.', 'error');
        }
    } catch (error) {
        showNotification('Network error while adding nutrition', 'error');
        console.error('Error:', error);
    }
}

// Remove nutrition record with validation
async function removeNutrition(event) {
    event.preventDefault();

    const ingredientName = document.getElementById('del-nutrition-name').value;

    // Validate
    if (!isNotEmpty(ingredientName)) {
        showNotification('Please enter an ingredient name', 'error');
        return;
    }

    try {
        const response = await fetch('/delete-nutrition-type', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ingredientName })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('Nutrition information removed successfully!', 'success');
            fetchTableData();
            
            // Clear form
            document.getElementById('del-nutrition-name').value = '';
        } else {
            showNotification('Error removing nutrition. The ingredient may not exist.', 'error');
        }
    } catch (error) {
        showNotification('Network error while removing nutrition', 'error');
        console.error('Error:', error);
    }
}

window.onload = () => {
    checkDbConnection();
    
    // Add event listeners
    const addForm = document.getElementById('add-nutrition-form');
    if (addForm) {
        addForm.addEventListener('submit', insertNutrition);
    }
    
    const removeForm = document.getElementById('remove-nutrition-form');
    if (removeForm) {
        removeForm.addEventListener('submit', removeNutrition);
    }
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayNutritions();
    fetchAndDisplayNutritionsSelection();
}
const typeSelector = document.getElementById("typeSelector");
const addAidFacilityFormFields = document.getElementById("addAidFacilityFormFields");

typeSelector.addEventListener("change", () => {
    const type = typeSelector.value;
    updateForm(type);
})

function updateForm(type) {
    addAidFacilityFormFields.innerHTML = "";

    if (type === "homelessShelter") {
        addAidFacilityFormFields.innerHTML = `
            <p>Facility ID</p>
            <input type="text" id="new-homeless-shelter-id"> <br><br>

            <p>Name</p>
            <input type="text" id="new-homeless-shelter-name"> <br><br>

            <p>Capacity</p>
            <input type="text" id="new-homeless-shelter-capacity"> <br><br>

            <p>Contact</p>
            <input type="text" id="new-homeless-shelter-contact"> <br><br>

            <p>Address</p>
            <input type="text" id="new-homeless-shelter-address"> <br><br>

            <p>City</p>
            <input type="text" id="new-homeless-shelter-city"> <br><br>

            <p>Is rehabilitation provided? (yes/no)</p>
            <input type="text" id="new-homeless-shelter-is-rehabilitation-provided"> <br><br>

            <button type="submit" class="add-homeless-shelter-button">Add Homeless Shelter</button>
        `;
    }

    if (type === "orphanageFacility") {
        addAidFacilityFormFields.innerHTML = `
            <p>Facility ID</p>
            <input type="text" id="new-orphanage-facility-id"> <br><br>

            <p>Name</p>
            <input type="text" id="new-orphanage-facility-name"> <br><br>

            <p>Capacity</p>
            <input type="text" id="new-orphanage-facility-capacity"> <br><br>

            <p>Contact</p>
            <input type="text" id="new-orphanage-facility-contact"> <br><br>

            <p>Address</p>
            <input type="text" id="new-orphanage-facility-address"> <br><br>

            <p>City</p>
            <input type="text" id="new-orphanage-facility-city"> <br><br>

            <p>Minimum age</p>
            <input type="text" id="new-orphanage-facility-minimum-age"> <br><br>

            <p>Maximum age</p>
            <input type="text" id="new-orphanage-facility-maximum-age"> <br><br>

            <p>Is education provided? (yes/no)</p>
            <input type="text" id="new-orphanage-facility-is-education-provided"> <br><br>

            <p>Number of staff</p>
            <input type="text" id="new-orphanage-facility-number-of-staff"> <br><br>

            <button type="submit" class="add-orphanage-facility-button">Add Orphanage Facility</button>
        `;
    }

    if (type === "nursingHome") {
        addAidFacilityFormFields.innerHTML = `
            <p>Facility ID</p>
            <input type="text" id="new-nursing-home-id"> <br><br>

            <p>Name</p>
            <input type="text" id="new-nursing-home-name"> <br><br>

            <p>Capacity</p>
            <input type="text" id="new-nursing-home-capacity"> <br><br>

            <p>Contact</p>
            <input type="text" id="new-nursing-home-contact"> <br><br>

            <p>Address</p>
            <input type="text" id="new-nursing-home-address"> <br><br>

            <p>City</p>
            <input type="text" id="new-nursing-home-city"> <br><br>

            <p>Number of doctors</p>
            <input type="text" id="new-nursing-home-number-of-doctors"> <br><br>

            <p>Number of nurses</p>
            <input type="text" id="new-nursing-home-number-of-nurses"> <br><br>

            <p>Minimum age</p>
            <input type="text" id="new-nursing-home-minimum-age"> <br><br>

            <button type="submit" class="add-nursing-home-button">Add Nursing Home</button>
        `;
    }
}

// Fetches data from the user table and displays it.
async function fetchAndDisplayDonations() {
    const tableElement = document.getElementById('list-donate-to-table');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/get-all-donate-to', {
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
}

// Fetches data from the user table and displays it.
async function fetchAndDisplayCommunityServices() {
    const tableElement = document.getElementById('list-community-service-table');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/get-all-community-service', {
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
}

function addCondition() {
    const conditions = document.getElementById("list-nutrition-selection-conditions");

    const div = document.createElement("div");
    div.className = "condition-div";

    div.innerHTML = `
        <select class="attribute">
            <option value="d.UserEmail">Email</option>
            <option value="d.IngredientName">Ingredient name</option>
            <option value="d.Quantity">Quantity</option>
            <option value="d.Unit">Unit</option>
            <option value="s.ServiceID">Community Service ID</option>
            <option value="ServiceName">Community Service Name</option>
            <option value="ServiceAddress">Community Service Address</option>
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
    `;

    conditions.appendChild(div);
}

// Fetches data from the user table and displays it.
async function fetchAndDisplayJoinDonationsAndCommunityServices() {
    const conditionsDivs = document.querySelectorAll(".condition-div");

    let conditions = [];

    conditionsDivs.forEach((row, index) => {
        const attribute = row.querySelector(".attribute").value;
        const comparator = row.querySelector(".comparator").value;
        const value = row.querySelector(".value").value;
        let logic = row.querySelector(".logic").value;

        if (index === conditionsDivs.length - 1) logic = "";

        let formattedValue = value;

        if (isNaN(value)) {
            formattedValue = `'${value}'`;
        }

        conditions.push({
            attribute: attribute,
            comparator: comparator,
            value: value,
            logic: logic
        });
    })

    const tableElement = document.getElementById('list-join-donation-service-table');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/get-join-donation-and-community-service', {
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

    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

const checkID = document.getElementById("community-service-id-checkbox");
const checkName = document.getElementById("community-service-name-checkbox");
const checkAddress = document.getElementById("community-service-address-checkbox");

const updateCommunityServiceFormFields = document.getElementById("updateCommunityServiceFormFields");

checkID.addEventListener("change", updateComServFormFields);
checkName.addEventListener("change", updateComServFormFields);
checkAddress.addEventListener("change", updateComServFormFields);

function updateComServFormFields() {
    updateCommunityServiceFormFields.innerHTML = "";
    let html = '';
    html += `
    <form id="update-community-service-form">
    `

    if (checkID.checked) {
        html += `
        <p>Service ID</p>
        <input type="text" id="update-community-service-id">
        `
    }

    if (checkName.checked) {
        html += `
        <p>Name</p>
        <input type="text" id="update-community-service-name">
        `
    }

    if (checkAddress.checked) {
        html += `
        <p>Address</p>
        <input type="text" id="update-community-service-address">
        `
    }

    if (checkID.checked || checkName.checked || checkAddress.checked) {
        html += `
        <br><br> <button type="submit" id="update-community-service">Update community service</button>
        `
    }

    html += `
    </form>
    `

    updateCommunityServiceFormFields.innerHTML = html;

    const form = document.getElementById("update-community-service-form");
    if (form) {
        form.addEventListener("submit", updateCommunityService);
    }
}

async function updateCommunityService(event) {
    event.preventDefault();

    const oldIDValue = document.getElementById('community-service-id-to-be-updated').value;

    // Validate old ID
    if (!isNotEmpty(oldIDValue)) {
        showNotification('Please enter the Service ID to be updated', 'error');
        return;
    }

    let newIDValue = null;
    let newNameValue = null;
    let newAddressValue = null;

    const idElement = document.getElementById('update-community-service-id');
    const nameElement = document.getElementById('update-community-service-name');
    const addressElement = document.getElementById('update-community-service-address');

    if (idElement) newIDValue = idElement.value;
    if (nameElement) newNameValue = nameElement.value;
    if (addressElement) newAddressValue = addressElement.value;

    // Validate at least one field is being updated
    if (!newIDValue && !newNameValue && !newAddressValue) {
        showNotification('Please select at least one field to update and provide a value', 'error');
        return;
    }

    // Validate the fields that are being updated
    const validations = {};
    
    if (newIDValue) {
        validations['Service ID'] = {
            isValid: isNotEmpty(newIDValue),
            message: 'Service ID cannot be empty'
        };
    }
    
    if (newNameValue) {
        validations['Service Name'] = {
            isValid: isNotEmpty(newNameValue) && meetsMinLength(newNameValue, 2),
            message: 'Service Name must be at least 2 characters long'
        };
    }
    
    if (newAddressValue) {
        validations['Service Address'] = {
            isValid: isNotEmpty(newAddressValue) && meetsMinLength(newAddressValue, 5),
            message: 'Service Address must be at least 5 characters long'
        };
    }

    if (!validateForm(validations)) {
        return;
    }

    const requestBody = {
        oldID: oldIDValue, 
        newID: newIDValue,
        newName: newNameValue,
        newAddress: newAddressValue
    };

    try {
        const response = await fetch('/update-community-service', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('✓ Community Service updated successfully!', 'success');
            fetchAndDisplayCommunityServices();
            
            // Clear form
            document.getElementById('community-service-id-to-be-updated').value = '';
            if (idElement) idElement.value = '';
            if (nameElement) nameElement.value = '';
            if (addressElement) addressElement.value = '';
        } else {
            showNotification('Error updating Community Service. The service may not exist.', 'error');
        }
    } catch (error) {
        showNotification('Network error while updating Community Service', 'error');
        console.error('Error:', error);
    }
}

// Inserts new records into the DonateTo table with validation
async function insertDonateTo(event) {
    event.preventDefault();

    const emailValue = document.getElementById('new-donate-to-email').value;
    const ingredientNameValue = document.getElementById('new-donate-to-ingredient').value;
    const communityServiceIDValue = document.getElementById('new-donate-to-id').value;
    const dateValue = document.getElementById('new-donate-to-date').value;
    const quantityValue = document.getElementById('new-donate-to-quantity').value;
    const unitValue = document.getElementById('new-donate-to-unit').value;

    // Validate fields
    const validations = {
        'Email': {
            isValid: isValidEmail(emailValue),
            message: 'Please enter a valid email address (e.g., user@example.com)'
        },
        'Ingredient Name': {
            isValid: isNotEmpty(ingredientNameValue) && meetsMinLength(ingredientNameValue, 2),
            message: 'Ingredient name must be at least 2 characters long'
        },
        'Community Service ID': {
            isValid: isNotEmpty(communityServiceIDValue),
            message: 'Community Service ID is required'
        },
        'Date': {
            isValid: isValidDateFormat(dateValue),
            message: 'Date must be in DD-MMM-YYYY format (e.g., 03-OCT-2025)'
        },
        'Quantity': {
            isValid: isPositiveNumber(quantityValue),
            message: 'Quantity must be a positive number'
        },
        'Unit': {
            isValid: isNotEmpty(unitValue) && /^[a-zA-Z]+$/.test(unitValue),
            message: 'Unit must contain only letters (e.g., kg, lb, g)'
        }
    };

    if (!validateForm(validations)) {
        return;
    }

    try {
        const response = await fetch('/create-donate-to', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userEmail: emailValue,
                ingredientName: ingredientNameValue,
                serviceID: communityServiceIDValue,
                donationDate: dateValue,
                quantity: quantityValue,
                unit: unitValue
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('Donation added successfully!', 'success');
            fetchAndDisplayDonations();
            
            // Clear form
            document.getElementById('new-donate-to-email').value = '';
            document.getElementById('new-donate-to-ingredient').value = '';
            document.getElementById('new-donate-to-id').value = '';
            document.getElementById('new-donate-to-date').value = '';
            document.getElementById('new-donate-to-quantity').value = '';
            document.getElementById('new-donate-to-unit').value = '';
        } else {
            showNotification('Error adding donation. Please check that the user, ingredient, and community service exist.', 'error');
        }
    } catch (error) {
        showNotification('Network error while adding donation', 'error');
        console.error('Error:', error);
    }
}

window.onload = () => {
    checkDbConnection();
    document.getElementById("add-donate-to-form").addEventListener("submit", insertDonateTo);
};
// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    // const statusElem = document.getElementById('dbStatus');
    // const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    // loadingGifElem.style.display = 'none';
    // if (loadingGifElem) {
    //     loadingGifElem.style.display = "none";
    // }
    // // Display the statusElem's text in the placeholder.
    // if (statusElem) {
    //     statusElem.style.display = 'inline';
    // }

    response.text()
    .then((text) => {
        // statusElem.textContent = text;
        console.log(text);
    })
    .catch((error) => {
        if (statusElem) {
            statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
        }
    });
}

// Fetches data from the user table and displays it.
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('list-user-table');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/get-all-users', {
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

// Inserts new records into the user table.
async function insertUser(event) {
    event.preventDefault();

    const nameValue = document.getElementById('new-user-name').value;
    const addressValue = document.getElementById('new-user-address').value;
    const emailValue = document.getElementById('new-user-email').value;

    const validations = {
        Name: {
            isValid: isNotEmpty(nameValue),
            message: "Name cannot be empty"
        },
        Address: {
            isValid: isNotEmpty(addressValue),
            message: "Address cannot be empty"
        },
        Email: {
            isValid: isValidEmail(emailValue),
            message: "Invalid email format"
        }
    };


    if (!validateForm(validations)) {
        return;   
    }
    
    // SEND TO BACKEND
    const response = await fetch('/create-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: nameValue,
            address: addressValue,
            email: emailValue
        })
    });

    const responseData = await response.json();
    console.log("Server response:", responseData);

    // BACKEND ERROR
    if (!responseData.success) {
        let message = "Error inserting user.";

        if (responseData.error?.errorNum === 1) {
            message = "This email already exists. Please use another.";
        }

        showNotification(message, "error", 5000);
        return;
    }

    showNotification("User added successfully!", "success", 3000);
    fetchTableData();
}


// Updates names in the demotable.
async function updateUserName(event) {
    event.preventDefault();

    const emailValue = document.getElementById('user-email-to-be-updated').value;
    const newNameValue = document.getElementById('update-user-name').value;

    const response = await fetch('/update-user-name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: emailValue,
            newName: newNameValue
        })
    });

    const responseData = await response.json();
    // const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        // messageElement.textContent = "Name updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating name!";
    }
}

// Updates names in the demotable.
async function updateUserAddress(event) {
    event.preventDefault();

    const emailValue = document.getElementById('user-email-to-be-updated').value;
    const newAddressValue = document.getElementById('update-user-address').value;

    const response = await fetch('/update-user-address', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: emailValue,
            newAddress: newAddressValue
        })
    });

    const responseData = await response.json();
    // const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        // messageElement.textContent = "Name updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating address!";
    }
}

// Updates names in the demotable.
async function updateUserEmail(event) {
    event.preventDefault();

    const emailValue = document.getElementById('user-email-to-be-updated').value;
    const newEmailValue = document.getElementById('update-user-email').value;

    const response = await fetch('/update-user-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: emailValue,
            newEmail: newEmailValue
        })
    });

    const responseData = await response.json();
    // const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        // messageElement.textContent = "Name updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating name!";
    }
}

const userVariableSelector = document.getElementById("userVariableSelector");
const updateUserFormFields = document.getElementById("updateUserFormFields");

userVariableSelector.addEventListener("change", () => {
    const type = userVariableSelector.value;
    updateUserForm(type);
})

function updateUserForm(type) {
    updateUserFormFields.innerHTML = "";

    if (type === "nameVariable") {
        updateUserFormFields.innerHTML = `
            <form id="update-user-name-form">
                <p>Name</p>
                <input type="text" id="update-user-name"> <br><br>

                <button type="submit">Update name</button>
            </form>
        `;
        document.getElementById("update-user-name-form").addEventListener("submit", updateUserName);
    } 

    if (type === "addressVariable") {
        updateUserFormFields.innerHTML = `
            <form id="update-user-address-form">
                <p>Address</p>
                <input type="text" id="update-user-address"> <br><br>

                <button type="submit">Update address</button>
            </form>
        `;
        document.getElementById("update-user-address-form").addEventListener("submit", updateUserAddress);
    }

    if (type === "emailVariable") {
        updateUserFormFields.innerHTML = `
            <form id="update-user-email-form">
                <p>Email</p>
                <input type="text" id="update-user-email"> <br><br>

                <button type="submit">Update email</button>
            </form>
        `;
        document.getElementById("update-user-email-form").addEventListener("submit", updateUserEmail);
    }
}

window.onload = () => {
    checkDbConnection();
    document.getElementById("add-user-form").addEventListener("submit", insertUser);
    document.getElementById("remove-user-form").addEventListener("submit", deleteUser);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayUsers();
}


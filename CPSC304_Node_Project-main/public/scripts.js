// Check DB connection (works the same)
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', { method: "GET" });

    if (loadingGifElem) loadingGifElem.style.display = "none";
    if (statusElem) statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        if (statusElem) statusElem.textContent = text;
    })
    .catch(() => {
        if (statusElem) statusElem.textContent = 'connection timed out';
    });
}

async function loginUserHandler(event) {
    event.preventDefault();

    const emailValue = document.getElementById("new-user-email").value;

    // Frontend validation
    if (!isValidEmail(emailValue)) {
        showNotification("Invalid email format", "error");
        return;
    }

    try {
        const response = await fetch("/login-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailValue })
        });

        const data = await response.json();
        console.log("Login response:", data);

        if (data.success) {
            showNotification("Login successful!", "success");

            setTimeout(() => {
                window.location.href = "user.html";   // redirect to main room
            }, 800);

        } else {
            showNotification("Email not found. Please create an account.", "error");
        }
    } catch (err) {
        console.error(err);
        showNotification("Network error. Try again.", "error");
    }
}


async function createUserFormHandler(event) {
    event.preventDefault(); // Stop default form submit

    console.log("✔ createUserFormHandler triggered");

    const nameValue = document.getElementById('new-user-name')?.value || "";
    const addressValue = document.getElementById('new-user-address')?.value || "";
    const emailValue = document.getElementById('new-user-email')?.value || "";

    // ---------- 1. Frontend validation ----------
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
        console.log("❌ Validation failed. No request sent.");
        return;
    }

    // ---------- 2. Send request to backend ----------
    try {
        const response = await fetch('/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nameValue,
                address: addressValue,
                email: emailValue
            })
        });

        const responseData = await response.json();
        console.log("📩 Backend response:", responseData);

        if (!response.ok || !responseData.success) {
            let message = responseData.error || "Error creating user.";

            // Friendly ORA error
            if (responseData.error?.errorNum === 1) {
                message = "This email already exists. Please use another email.";
            }

            showNotification(message, "error");
            return;
        }

        // ---------- 3. Success ----------
        showNotification("User created successfully!", "success");

        setTimeout(() => {
            window.location.href = "ingredient-and-recipe.html";
        }, 1000);

    } catch (error) {
        console.error("❌ Network error:", error);
        showNotification("Network error. Please try again.", "error");
    }
}


// Page Initialization

window.onload = function() {
    checkDbConnection();

    const createUserForm = document.getElementById("createUserForm");
    if (createUserForm) {
        createUserForm.addEventListener("submit", createUserFormHandler);
    }

    const loginUserForm = document.getElementById("loginUserForm");
    if (loginUserForm) {
        loginUserForm.addEventListener("submit", loginUserHandler);
    }
};


// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
// function fetchTableData() {
//     fetchAndDisplayUsers();
// }



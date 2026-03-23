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
async function fetchAndDisplayQuerySeven() {
    const tableElement = document.getElementById('list-query-seven-table');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/query7', {
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

async function fetchAndDisplayQueryEight() {
    event.preventDefault();

    const tableElement = document.getElementById('list-query-eight-table');
    const tableBody = tableElement.querySelector('tbody');
    const threshold = document.getElementById('query-eight-threshold').value;

    const url = `/query8?threshold=${threshold}`

    const response = await fetch(url, {
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

async function fetchAndDisplayQueryNine() {
    const tableElement = document.getElementById('list-query-nine-table');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/query9', {
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

async function fetchAndDisplayQueryTen() {
    const tableElement = document.getElementById('list-query-ten-table');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/query10', {
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

window.onload = () => {
    checkDbConnection();
};


async function fetchAndDisplayIngredients() {
    try {
        const response = await fetch('/get-all-ingredients', {
            method: 'GET'
        });

        const responseData = await response.json();
        const ingredients = responseData.data;

        const tableDiv = document.getElementById('list-ingredient-table');
        
        if (ingredients.length === 0) {
            tableDiv.innerHTML = '<p>No ingredients found</p>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Shelf Life (days)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        ingredients.forEach(ingredient => {
            tableHTML += '<tr>';
            ingredient.forEach(field => {
                tableHTML += `<td>${field}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table>';
        tableDiv.innerHTML = tableHTML;
    } catch (error) {
        showNotification('✗ Error fetching ingredient data', 'error');
        console.error('Error:', error);
    }
}

async function addIngredient(event) {
    event.preventDefault();

    const nameValue = document.getElementById('new-ingredient-name').value;
    const shelfLifeValue = document.getElementById('new-ingredient-shelf-life').value;

    // Validate inputs
    const validations = {
        'Ingredient Name': {
            isValid: isNotEmpty(nameValue) && meetsMinLength(nameValue, 2) && /^[a-zA-Z\s]+$/.test(nameValue),
            message: 'Ingredient name must be at least 20 characters and contain only letters and spaces'
        },
        'Shelf Life': {
            isValid: isPositiveNumber(shelfLifeValue) && Number.isInteger(parseFloat(shelfLifeValue)),
            message: 'Shelf life must be a positive whole number (in days)'
        }
    };

    if (!validateForm(validations)) {
        return;
    }

    try {
        const response = await fetch('/create-ingredient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nameValue,
                shelfLife: shelfLifeValue
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('✓ Ingredient added successfully!', 'success');
            fetchAndDisplayIngredients();
            
            // Clear form
            document.getElementById('new-ingredient-name').value = '';
            document.getElementById('new-ingredient-shelf-life').value = '';
        } else {
            showNotification('✗ Error adding ingredient. An ingredient with this name may already exist.', 'error');
        }
    } catch (error) {
        showNotification('✗ Network error while adding ingredient', 'error');
        console.error('Error:', error);
    }
}

async function removeIngredient(event) {
    event.preventDefault();

    const nameValue = document.getElementById('del-ingredient-name').value;

    // Validate input
    if (!isNotEmpty(nameValue)) {
        showNotification('Please enter an ingredient name', 'error');
        return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the ingredient "${nameValue}"?`)) {
        return;
    }

    try {
        const response = await fetch('/delete-ingredient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nameValue
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('✓ Ingredient removed successfully!', 'success');
            fetchAndDisplayIngredients();
            
            // Clear form
            document.getElementById('del-ingredient-name').value = '';
        } else {
            showNotification('✗ Error removing ingredient. The ingredient may not exist or is being used in other records.', 'error');
        }
    } catch (error) {
        showNotification('✗ Network error while removing ingredient', 'error');
        console.error('Error:', error);
    }
}

// ============================================
// FOOD FUNCTIONS
// ============================================

async function fetchAndDisplayFoods() {
    try {
        const response = await fetch('/get-all-foods', {
            method: 'GET'
        });

        const responseData = await response.json();
        const foods = responseData.data;

        const tableDiv = document.getElementById('list-food-table');
        
        if (foods.length === 0) {
            tableDiv.innerHTML = '<p>No foods found</p>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Origin</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
        `;

        foods.forEach(food => {
            tableHTML += '<tr>';
            food.forEach(field => {
                tableHTML += `<td>${field}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table>';
        tableDiv.innerHTML = tableHTML;
    } catch (error) {
        showNotification('✗ Error fetching food data', 'error');
        console.error('Error:', error);
    }
}

async function addFood(event) {
    event.preventDefault();

    const nameValue = document.getElementById('new-food-name').value;
    const originValue = document.getElementById('new-food-origin').value;
    const descriptionValue = document.getElementById('new-food-description').value;

    // Validate inputs
    const validations = {
        'Food Name': {
            isValid: isNotEmpty(nameValue) && meetsMinLength(nameValue, 2),
            message: 'Food name must be at least 2 characters long'
        },
        'Origin': {
            isValid: isNotEmpty(originValue) && meetsMinLength(originValue, 2) && /^[a-zA-Z\s]+$/.test(originValue),
            message: 'Origin must be at least 2 characters and contain only letters and spaces'
        },
        'Description': {
            isValid: isNotEmpty(descriptionValue) && meetsMinLength(descriptionValue, 10) && descriptionValue.length <= 500,
            message: 'Description must be between 10 and 500 characters'
        }
    };

    if (!validateForm(validations)) {
        return;
    }

    try {
        const response = await fetch('/create-food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nameValue,
                origin: originValue,
                description: descriptionValue
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('✓ Food added successfully!', 'success');
            fetchAndDisplayFoods();
            
            // Clear form
            document.getElementById('new-food-name').value = '';
            document.getElementById('new-food-origin').value = '';
            document.getElementById('new-food-description').value = '';
        } else {
            showNotification('✗ Error adding food. A food with this name may already exist.', 'error');
        }
    } catch (error) {
        showNotification('✗ Network error while adding food', 'error');
        console.error('Error:', error);
    }
}

async function removeFood(event) {
    event.preventDefault();

    const nameValue = document.getElementById('del-food-name').value;

    // Validate input
    if (!isNotEmpty(nameValue)) {
        showNotification('Please enter a food name', 'error');
        return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the food "${nameValue}"?`)) {
        return;
    }

    try {
        const response = await fetch('/delete-food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nameValue
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('✓ Food removed successfully!', 'success');
            fetchAndDisplayFoods();
            
            // Clear form
            document.getElementById('del-food-name').value = '';
        } else {
            showNotification('✗ Error removing food. The food may not exist or has associated recipes.', 'error');
        }
    } catch (error) {
        showNotification('✗ Network error while removing food', 'error');
        console.error('Error:', error);
    }
}

// ============================================
// RECIPE FUNCTIONS
// ============================================

async function fetchAndDisplayRecipes() {
    try {
        const response = await fetch('/get-all-recipes', {
            method: 'GET'
        });

        const responseData = await response.json();
        const recipes = responseData.data;

        const tableDiv = document.getElementById('list-recipe-table');
        
        if (recipes.length === 0) {
            tableDiv.innerHTML = '<p>No recipes found</p>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Recipe ID</th>
                        <th>Food Name</th>
                        <th>Difficulty</th>
                        <th>Instructions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        recipes.forEach(recipe => {
            tableHTML += '<tr>';
            recipe.forEach((field, index) => {
                // Truncate instructions if too long
                if (index === 3 && field && field.length > 100) {
                    tableHTML += `<td title="${field}">${field.substring(0, 100)}...</td>`;
                } else {
                    tableHTML += `<td>${field}</td>`;
                }
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table>';
        tableDiv.innerHTML = tableHTML;
    } catch (error) {
        showNotification('✗ Error fetching recipe data', 'error');
        console.error('Error:', error);
    }
}

async function addRecipe(event) {
    event.preventDefault();

    const recipeIDValue = document.getElementById('new-recipe-id').value;
    const difficultyValue = document.getElementById('new-recipe-difficulty').value;
    const instructionsValue = document.getElementById('new-recipe-instructions').value;
    
    // For this implementation, you'd need to add a food name selector
    // For now, we'll assume there's a hidden field or you add a dropdown
    const foodNameValue = document.getElementById('new-recipe-food-name')?.value || '';

    // Validate inputs
    const validations = {
        'Recipe ID': {
            isValid: isNotEmpty(recipeIDValue) && /^[a-zA-Z0-9]+$/.test(recipeIDValue),
            message: 'Recipe ID must contain only letters and numbers (no spaces)'
        },
        'Difficulty': {
            isValid: isPositiveNumber(difficultyValue) && Number.isInteger(parseFloat(difficultyValue)) && 
                      parseFloat(difficultyValue) >= 1 && parseFloat(difficultyValue) <= 10,
            message: 'Difficulty must be a whole number between 1 and 10'
        },
        'Instructions': {
            isValid: isNotEmpty(instructionsValue) && meetsMinLength(instructionsValue, 20) && instructionsValue.length <= 2000,
            message: 'Instructions must be between 1 and 2000 characters'
        }
    };

    if (!validateForm(validations)) {
        return;
    }

    try {
        const response = await fetch('/create-recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipeID: recipeIDValue,
                foodName: foodNameValue,
                instructions: instructionsValue,
                difficulty: difficultyValue
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('✓ Recipe added successfully!', 'success');
            fetchAndDisplayRecipes();
            
            // Clear form
            document.getElementById('new-recipe-id').value = '';
            document.getElementById('new-recipe-difficulty').value = '';
            document.getElementById('new-recipe-instructions').value = '';
            if (document.getElementById('new-recipe-food-name')) {
                document.getElementById('new-recipe-food-name').value = '';
            }
        } else {
            showNotification('✗ Error adding recipe. Check that the Recipe ID is unique and Food Name exists.', 'error');
        }
    } catch (error) {
        showNotification('✗ Network error while adding recipe', 'error');
        console.error('Error:', error);
    }
}

async function removeRecipe(event) {
    event.preventDefault();

    const recipeIDValue = document.getElementById('del-recipe-id').value;
    
    // You'd need to add a food name field for deletion as well since it's a composite key
    const foodNameValue = document.getElementById('del-recipe-food-name')?.value || '';

    // Validate inputs
    const validations = {
        'Recipe ID': {
            isValid: isNotEmpty(recipeIDValue),
            message: 'Recipe ID is required'
        }
    };

    if (!validateForm(validations)) {
        return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete recipe "${recipeIDValue}"?`)) {
        return;
    }

    try {
        const response = await fetch('/delete-recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipeID: recipeIDValue,
                foodName: foodNameValue
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            showNotification('✓ Recipe removed successfully!', 'success');
            fetchAndDisplayRecipes();
            
            // Clear form
            document.getElementById('del-recipe-id').value = '';
            if (document.getElementById('del-recipe-food-name')) {
                document.getElementById('del-recipe-food-name').value = '';
            }
        } else {
            showNotification('✗ Error removing recipe. The recipe may not exist.', 'error');
        }
    } catch (error) {
        showNotification('✗ Network error while removing recipe', 'error');
        console.error('Error:', error);
    }
}

window.onload = () => {
    checkDbConnection();
    
    // Ingredient form listeners
    const addIngredientForm = document.querySelector('.add-ingredient-form form');
    if (addIngredientForm) {
        addIngredientForm.addEventListener('submit', addIngredient);
    }
    
    const removeIngredientForm = document.querySelector('.remove-ingredient-form form');
    if (removeIngredientForm) {
        removeIngredientForm.addEventListener('submit', removeIngredient);
    }
    
    // Food form listeners
    const addFoodForm = document.querySelector('.add-food-form form');
    if (addFoodForm) {
        addFoodForm.addEventListener('submit', addFood);
    }
    
    const removeFoodForm = document.querySelector('.remove-food-form form');
    if (removeFoodForm) {
        removeFoodForm.addEventListener('submit', removeFood);
    }
    
    // Recipe form listeners
    const addRecipeForm = document.querySelector('.add-recipe-form form');
    if (addRecipeForm) {
        addRecipeForm.addEventListener('submit', addRecipe);
    }
    
    const removeRecipeForm = document.querySelector('.remove-recipe-form form');
    if (removeRecipeForm) {
        removeRecipeForm.addEventListener('submit', removeRecipe);
    }
    
    // Load initial data
    fetchAndDisplayIngredients();
    fetchAndDisplayFoods();
    fetchAndDisplayRecipes();
};
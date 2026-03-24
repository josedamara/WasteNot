// ================================================================
// STATE
// ================================================================
const state = {
    users: [],
    favourites: [],
    ingredients: [],
    foods: [],
    recipes: [],
    nutrition: [],
    services: [],
    facilities: [],
    donations: [],
    stores: [],
    utensils: [],
    nextId: 1,
};
function nextId() { return state.nextId++; }

// ================================================================
// NAVIGATION
// ================================================================
const pageMap = {
    start: { title: 'Dashboard', subtitle: 'Welcome back — let\'s reduce waste today' },
    users: { title: 'Users', subtitle: 'Manage users and favourite recipes' },
    ingredients: { title: 'Ingredients & Recipes', subtitle: 'Browse, add, and filter kitchen data' },
    nutrition: { title: 'Nutrition', subtitle: 'Track nutritional data per ingredient' },
    donation: { title: 'Donations', subtitle: 'Community services, aid facilities & donations' },
    'store-utensil': { title: 'Stores & Utensils', subtitle: 'Manage stores and kitchen utensils' },
};

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.dataset.page;
        navigateTo(page);
    });
});

function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');
    const meta = pageMap[page] || {};
    document.getElementById('topbar-title').textContent = meta.title || page;
    document.getElementById('topbar-subtitle').textContent = meta.subtitle || '';
    updateDashboard();
}

// ================================================================
// TAB SYSTEM (generic)
// ================================================================
document.querySelectorAll('.tab-bar').forEach(bar => {
    bar.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.tab;
            const parentPage = bar.closest('.page');
            parentPage.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById('tab-' + target);
            if (panel) panel.classList.add('active');
            // Refresh selects when opening fav tab
            if (target === 'fav-recipes') refreshFavSelects();
            if (target === 'don-list') refreshDonSelects();
        });
    });
});

// ================================================================
// MODALS
// ================================================================
function openModal(id) {
    // Refresh selects as needed
    if (id === 'modal-add-fav') refreshFavSelects();
    if (id === 'modal-add-donation') refreshDonSelects();
    document.getElementById(id).classList.add('open');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}
// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

// ================================================================
// TOAST
// ================================================================
function toast(msg, type = 'success') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || '✅'}</span>${msg}`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => el.remove(), 3200);
}

// ================================================================
// CONFIRM DELETE
// ================================================================
function confirmDelete(msg, callback) {
    document.getElementById('confirm-msg').textContent = msg;
    openModal('modal-confirm');
    const btn = document.getElementById('confirm-ok-btn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => { callback(); closeModal('modal-confirm'); });
}

// ================================================================
// FILTER TABLE (search by text)
// ================================================================
function filterTable(tableId, query) {
    const q = query.toLowerCase();
    document.getElementById(tableId).querySelectorAll('tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

// ================================================================
// CHIP FILTER (category in table rows)
// ================================================================
function setChip(chip, tableId, val) {
    chip.closest('.filter-chips').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    document.getElementById(tableId).querySelectorAll('tr').forEach(tr => {
        if (!val) { tr.style.display = ''; return; }
        tr.style.display = tr.dataset.cat === val ? '' : 'none';
    });
}

// ================================================================
// FILTER CARDS (service / facility grids)
// ================================================================
function filterCards(containerId, query) {
    const q = query.toLowerCase();
    document.getElementById(containerId).querySelectorAll('[data-searchable]').forEach(el => {
        el.style.display = el.dataset.searchable.toLowerCase().includes(q) ? '' : 'none';
    });
}

// ================================================================
// DASHBOARD UPDATE
// ================================================================
function updateDashboard() {
    document.getElementById('st-users').textContent = state.users.length;
    document.getElementById('st-ingredients').textContent = state.ingredients.length;
    document.getElementById('st-recipes').textContent = state.recipes.length;
    document.getElementById('st-donations').textContent = state.donations.length;
    document.getElementById('badge-users').textContent = state.users.length;
    document.getElementById('badge-recipes').textContent = state.recipes.length;

    // Recent recipes
    const rl = document.getElementById('recent-recipes-list');
    if (state.recipes.length === 0) {
        rl.innerHTML = `<div class="empty-state"><div class="es-icon">📖</div><div class="es-title">No recipes yet</div><div class="es-sub">Add your first recipe to see it here</div></div>`;
    } else {
        const recent = [...state.recipes].reverse().slice(0, 5);
        rl.innerHTML = recent.map(r => `
        <div class="recent-item">
          <div class="ri-icon">${mealIcon(r.meal)}</div>
          <div class="ri-info">
            <div class="ri-name">${r.name}</div>
            <div class="ri-meta">${r.time} min · ${r.servings} servings</div>
          </div>
          <div class="ri-right"><span class="badge badge-green">${r.meal}</span></div>
        </div>`).join('');
    }

    // Nutrition overview on dashboard
    const dn = document.getElementById('dash-nutrition');
    if (state.nutrition.length === 0) {
        dn.innerHTML = `<p style="font-size:13px;color:var(--light)">Add ingredients with nutrition data to see a summary here.</p>`;
    } else {
        const totals = state.nutrition.reduce((a, n) => {
            a.fat += +n.fat; a.prot += +n.prot; a.carb += +n.carb; return a;
        }, { fat: 0, prot: 0, carb: 0 });
        const total = totals.fat + totals.prot + totals.carb || 1;
        dn.innerHTML = `
        <div class="nut-bar-wrap nut-fat"><div class="nut-bar-label"><span>Fat</span><span>${totals.fat.toFixed(1)}g</span></div><div class="nut-bar"><div class="nut-bar-fill" style="width:${(totals.fat / total * 100).toFixed(0)}%"></div></div></div>
        <div class="nut-bar-wrap nut-protein"><div class="nut-bar-label"><span>Protein</span><span>${totals.prot.toFixed(1)}g</span></div><div class="nut-bar"><div class="nut-bar-fill" style="width:${(totals.prot / total * 100).toFixed(0)}%"></div></div></div>
        <div class="nut-bar-wrap nut-carb"><div class="nut-bar-label"><span>Carbs</span><span>${totals.carb.toFixed(1)}g</span></div><div class="nut-bar"><div class="nut-bar-fill" style="width:${(totals.carb / total * 100).toFixed(0)}%"></div></div></div>`;
    }
}

function mealIcon(meal) {
    const map = { breakfast: '🍳', lunch: '🥗', dinner: '🍽️', dessert: '🍰', snack: '🍿' };
    return map[meal] || '🍽️';
}

// ================================================================
// USERS
// ================================================================
async function addUser() {
    const fn = document.getElementById('u-fname').value.trim();
    const ln = document.getElementById('u-lname').value.trim();
    const email = document.getElementById('u-email').value.trim();
    // const role = document.getElementById('u-role').value;
    const loc = document.getElementById('u-loc').value.trim();
    if (!fn || !email || !loc) { toast('Name and email are required', 'error'); return; }
    const user = { id: nextId(), name: `${fn} ${ln}`, email, loc, joined: today() };
    // UPDATED!!!

    // SEND TO BACKEND
    const response = await fetch('/create-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: fn + " " + ln,
            address: loc,
            email: email
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

        toast(message, "error");
        return;
    }

    // state.users.push(user);
    renderUsers();
    closeModal('modal-add-user');
    clearInputs(['u-fname', 'u-lname', 'u-email', 'u-loc']);
    toast(`User "${user.name}" added!`);
    updateDashboard();
}

function renderUsers() {
    const tbody = document.getElementById('users-table');
    if (state.users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="es-icon">👤</div><div class="es-title">No users yet</div><div class="es-sub">Click "Add User" to get started</div></div></td></tr>`;
        return;
    }
    tbody.innerHTML = state.users.map(u => `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${u.joined}</td>
        <td class="td-actions">
          <button class="action-btn edit" data-user-id="${u.id}">✏️</button>
          <button class="action-btn del"  data-user-email="${u.email.replace(/"/g, '&quot;')}">🗑️</button>
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', () => editUser(+btn.dataset.userId));
    });
    tbody.querySelectorAll('.action-btn.del').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.dataset.userEmail));
    });
}

function editUser(id) {
    const u = state.users.find(x => x.id === id);
    if (!u) return;
    const [fn, ...rest] = u.name.split(' ');
    document.getElementById('eu-fname').value = fn;
    document.getElementById('eu-lname').value = rest.join(' ');
    document.getElementById('eu-email').value = u.email;
    document.getElementById('eu-loc').value = u.loc;
    document.getElementById('eu-id').value = u.email;
    openModal('modal-edit-user');
}

async function saveEditUser() {
    const originalEmail = document.getElementById('eu-id').value;
    const newName = `${document.getElementById('eu-fname').value.trim()} ${document.getElementById('eu-lname').value.trim()}`;
    const newEmail = document.getElementById('eu-email').value.trim();
    const newAddress = document.getElementById('eu-loc').value.trim();

    const u = state.users.find(x => x.email === originalEmail);
    if (!u) return;

    try {
        // Update name
        const r1 = await fetch('/update-user-name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: originalEmail, newName })
        });
        const d1 = await r1.json();
        if (!d1.success) { toast('Error updating name', 'error'); return; }

        // Update address
        const r2 = await fetch('/update-user-address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: originalEmail, newAddress })
        });
        const d2 = await r2.json();
        if (!d2.success) { toast('Error updating address', 'error'); return; }

        // Update email (do this last since it changes the key)
        if (newEmail !== originalEmail) {
            const r3 = await fetch('/update-user-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: originalEmail, newEmail })
            });
            const d3 = await r3.json();
            if (!d3.success) { toast('Error updating email', 'error'); return; }
        }

        // Update local state only after all backend calls succeed
        u.name = newName;
        u.loc = newAddress;
        u.email = newEmail;

        closeModal('modal-edit-user');
        renderUsers();
        toast('User updated!');

    } catch (error) {
        toast('Network error while updating user', 'error');
        console.error('Error:', error);
    }
}

async function deleteUser(email) {
    const u = state.users.find(x => x.email === email);
    confirmDelete(`Delete user "${u.name}"? This will also remove their favourites.`, async () => {
        try {
            const response = await fetch('/delete-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email
                })
            });

            const responseData = await response.json();

            if (responseData.success) {
                toast('User removed successfully!', 'success');
                fetchAndDisplayUsers();
            } else {
                toast('Error removing user. The user with that name and material may not exist.', 'error');
            }
        } catch (error) {
            toast('Network error while removing user', 'error');
            console.error('Error:', error);
        }

        state.users = state.users.filter(x => x.email !== email);
        state.favourites = state.favourites.filter(x => x.userEmail !== email);
        renderUsers(); renderFavourites(); updateDashboard();
        toast('User deleted', 'info');
    });
}

// ================================================================
// FAVOURITES
// ================================================================
function refreshFavSelects() {
    const usel = document.getElementById('fav-user-sel');
    const rsel = document.getElementById('fav-recipe-sel');
    usel.innerHTML = state.users.length ? state.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('') : '<option disabled>No users yet</option>';
    rsel.innerHTML = state.recipes.length ? state.recipes.map(r => `<option value="${r.id}">${r.name}</option>`).join('') : '<option disabled>No recipes yet</option>';
}

function addFav() {
    const uId = +document.getElementById('fav-user-sel').value;
    const rId = +document.getElementById('fav-recipe-sel').value;
    if (!uId || !rId) { toast('Select a user and recipe', 'error'); return; }
    if (state.favourites.find(f => f.userId === uId && f.recipeId === rId)) { toast('Already a favourite!', 'error'); return; }
    const user = state.users.find(u => u.id === uId);
    const recipe = state.recipes.find(r => r.id === rId);
    state.favourites.push({ id: nextId(), userId: uId, recipeId: rId, userName: user.name, recipeName: recipe.name, added: today() });
    closeModal('modal-add-fav');
    renderFavourites();
    toast('Favourite added! ❤️');
}

function renderFavourites() {
    const tbody = document.getElementById('fav-table');
    if (state.favourites.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="es-icon">❤️</div><div class="es-title">No favourites yet</div><div class="es-sub">Add user–recipe pairs to track favourites</div></div></td></tr>`;
        return;
    }
    tbody.innerHTML = state.favourites.map(f => `
      <tr>
        <td>${f.user}</td>
        <td><strong>${f.recipe}</strong></td>
        <!-- <td>${f.added}</td> -->
        <td class="td-actions">
          <button class="action-btn del" onclick="deleteFav(${f.id})" title="Remove">🗑️</button>
        </td>
      </tr>`).join('');
}

function deleteFav(id) {
    confirmDelete('Remove this favourite?', () => {
        state.favourites = state.favourites.filter(x => x.id !== id);
        renderFavourites();
        toast('Favourite removed', 'info');
    });
}

// ================================================================
// INGREDIENTS
// ================================================================
const catEmoji = { vegetable: '🥦', fruit: '🍎', dairy: '🥛', protein: '🥩', grain: '🌾', other: '📦' };

async function addIngredient() {
    const name = document.getElementById('ing-name').value.trim();
    if (!name) { toast('Name is required', 'error'); return; }
    const item = {
        id: nextId(), name,
        //   cat: document.getElementById('ing-cat').value,
        //   qty: document.getElementById('ing-qty').value || '—',
        //   unit: document.getElementById('ing-unit').value,
        shelf: document.getElementById('ing-shelf-life').value || '—'
    };

    try {
        const response = await fetch('/create-ingredient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                shelfLife: item.shelf
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            toast('Ingredient added successfully!', 'success');
            fetchAndDisplayIngredients();
        } else {
            toast('Error adding ingredient. An ingredient with this name may already exist.', 'error');
        }
    } catch (error) {
        toast('Network error while adding ingredient', 'error');
        console.error('Error:', error);
    }

    state.ingredients.push(item);
    renderIngredients();
    closeModal('modal-add-ingredient');
    clearInputs(['ing-name', 'ing-qty', 'ing-shelf-life']);
    toast(`"${name}" added to ingredients!`);
    updateDashboard();
}

function renderIngredients() {
    const tbody = document.getElementById('ing-table');
    if (state.ingredients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="es-icon">🥦</div><div class="es-title">No ingredients yet</div><div class="es-sub">Add your pantry items to get started</div></div></td></tr>`;
        return;
    }
    tbody.innerHTML = state.ingredients.map(i => `
      <tr data-cat="${i.cat}">
        <td><strong>${catEmoji[i.cat] || '📦'} ${i.name}</strong></td>
        <!-- <td><span class="badge badge-green">${i.cat}</span></td>
        <td>${i.qty}</td>
        <td>${i.unit}</td> -->
        <td>${i.shelf}</td> 
        <td class="td-actions">
          <button class="action-btn edit" onclick="editIngredient(${i.id})">✏️</button>
          <button class="action-btn del" onclick="deleteIngredient(${i.id})">🗑️</button>
        </td>
      </tr>`).join('');
}

function editIngredient(id) {
    const i = state.ingredients.find(x => x.id === id);
    if (!i) return;
    document.getElementById('ei-name').value = i.name;
    document.getElementById('ei-cat').value = i.cat;
    document.getElementById('ei-qty').value = i.qty;
    document.getElementById('ei-unit').value = i.unit;
    document.getElementById('ei-shelf-life').value = i.shelf === '—' ? '' : i.shelf;
    document.getElementById('ei-id').value = id;
    openModal('modal-edit-ingredient');
}

function saveEditIngredient() {
    const id = +document.getElementById('ei-id').value;
    const i = state.ingredients.find(x => x.id === id);
    if (!i) return;
    i.name = document.getElementById('ei-name').value.trim();
    i.cat = document.getElementById('ei-cat').value;
    i.qty = document.getElementById('ei-qty').value || '—';
    i.unit = document.getElementById('ei-unit').value;
    i.shelf = document.getElementById('ei-shelf-life').value || '—';
    closeModal('modal-edit-ingredient');
    renderIngredients();
    toast('Ingredient updated!');
}

function deleteIngredient(id) {
    const i = state.ingredients.find(x => x.id === id);
    confirmDelete(`Delete ingredient "${i.name}"?`, () => {
        state.ingredients = state.ingredients.filter(x => x.id !== id);
        renderIngredients(); updateDashboard();
        toast('Ingredient deleted', 'info');
    });
}

// ================================================================
// FOODS
// ================================================================
async function addFood() {
    const name = document.getElementById('food-name').value.trim();
    if (!name) { toast('Name is required', 'error'); return; }
    const item = {
        id: nextId(), name,
        type: document.getElementById('food-type').value,
        cal: document.getElementById('food-cal').value || '—',
        season: document.getElementById('food-season').value,
        origin: '',
        description: ''
    };

    try {
        const response = await fetch('/create-food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                origin: item.origin,
                description: item.description
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            toast('Food added successfully!', 'success');
            fetchAndDisplayFoods();
        } else {
            toast('Error adding food. A food with this name may already exist.', 'error');
        }
    } catch (error) {
        toast('Network error while adding food', 'error');
        console.error('Error:', error);
    }

    state.foods.push(item);
    renderFoods();
    closeModal('modal-add-food');
    clearInputs(['food-name', 'food-cal']);
    toast(`Food "${name}" added!`);
}

function renderFoods() {
    const tbody = document.getElementById('food-table');
    if (state.foods.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="es-icon">🍽️</div><div class="es-title">No foods yet</div></div></td></tr>`;
        return;
    }
    tbody.innerHTML = state.foods.map(f => `
      <tr>
        <td><strong>${f.name}</strong></td>
        <td>${f.origin}</td>
        <td>${f.description}</td>
        <!-- <td>${f.season}</td> -->
        <td class="td-actions">
          <button class="action-btn del" onclick="deleteFood(${f.id})">🗑️</button>
        </td>
      </tr>`).join('');
}

function deleteFood(id) {
    const f = state.foods.find(x => x.id === id);
    confirmDelete(`Delete food "${f.name}"?`, () => {
        state.foods = state.foods.filter(x => x.id !== id);
        renderFoods();
        toast('Food deleted', 'info');
    });
}

// ================================================================
// RECIPES
// ================================================================
async function addRecipe() {
    const name = document.getElementById('rec-name').value.trim();
    if (!name) { toast('Recipe name is required', 'error'); return; }
    const item = {
        id: nextId(), name,
        meal: document.getElementById('rec-meal').value,
        time: document.getElementById('rec-time').value || '—',
        servings: document.getElementById('rec-serv').value || '—',
        ings: document.getElementById('rec-ings').value.trim(),
        instructions: document.getElementById('rec-inst').value.trim(),
        difficulty: 0,
    };

    try {
        const response = await fetch('/create-recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipeID: 100,
                foodName: name,
                instructions: item.instructions,
                difficulty: "Medium"
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            toast('Recipe added successfully!', 'success');
            fetchAndDisplayRecipes();
        } else {
            toast('Error adding recipe. Check that the Recipe ID is unique and Food Name exists.', 'error');
        }
    } catch (error) {
        toast('Network error while adding recipe', 'error');
        console.error('Error:', error);

        return;
    }

    state.recipes.push(item);
    renderRecipes();
    closeModal('modal-add-recipe');
    clearInputs(['rec-name', 'rec-time', 'rec-serv', 'rec-ings', 'rec-inst']);
    toast(`Recipe "${name}" added!`);
    updateDashboard();
}

function renderRecipes() {
    const tbody = document.getElementById('recipe-table');
    if (state.recipes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="es-icon">📖</div><div class="es-title">No recipes yet</div></div></td></tr>`;
        return;
    }
    tbody.innerHTML = state.recipes.map(r => `
      <tr data-cat="${r.meal}">
        <td><strong>${r.name}</strong></td>
        <!--<td><span class="badge badge-green">${r.meal}</span></td>
        <td>${r.time} min</td> -->
        <td>${r.instructions}</td>
        <td>${r.difficulty}</td>
        <!-- <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.ings || '—'}</td> -->
        <td class="td-actions">
          <button class="action-btn del" onclick="deleteRecipe(${r.id})">🗑️</button>
        </td>
      </tr>`).join('');

    const recNames = document.getElementById('rec-name');
    state.recipes.forEach(recipe => {
        const option = document.createElement("option");
        option.value = recipe.name;
        option.textContent = recipe.name;
        recNames.appendChild(option);
    });
}

function deleteRecipe(id) {
    const r = state.recipes.find(x => x.id === id);
    confirmDelete(`Delete recipe "${r.name}"?`, () => {
        state.recipes = state.recipes.filter(x => x.id !== id);
        state.favourites = state.favourites.filter(x => x.recipeId !== id);
        renderRecipes(); renderFavourites(); updateDashboard();
        toast('Recipe deleted', 'info');
    });
}

// ================================================================
// NUTRITION
// ================================================================
async function addNutrition() {
    const name = document.getElementById('nut-name').value.trim();
    if (!name) { toast('Ingredient name is required', 'error'); return; }
    const item = {
        id: nextId(), name,
        fat: document.getElementById('nut-fat').value || 0,
        prot: document.getElementById('nut-prot').value || 0,
        carb: document.getElementById('nut-carb').value || 0,
        sodium: document.getElementById('nut-sodium').value || 0,
        pot: document.getElementById('nut-pot').value || 0,
    };

    try {
        console.log(name)

        const response = await fetch('/create-nutrition-type', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ingredientName: name,
                fat: item.fat * 1000,
                protein: item.prot * 1000,
                carbohydrate: item.carb * 1000,
                sodium: item.sodium,
                potassium: item.pot
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            toast('Nutrition information added successfully!', 'success');
        } else {
            toast('Error adding nutrition. The ingredient may not exist or nutrition data already exists for this ingredient.', 'error');
        }
    } catch (error) {
        toast('Network error while adding nutrition', 'error');
        console.error('Error:', error);

        return;
    }

    state.nutrition.push(item);
    renderNutrition();
    closeModal('modal-add-nutrition');
    clearInputs(['nut-name', 'nut-fat', 'nut-prot', 'nut-carb', 'nut-sodium', 'nut-pot']);
    toast(`Nutrition for "${name}" added!`);
    updateDashboard();
}

// Track which nutrition id is currently selected in the chart
let selectedNutName = null;

function renderNutrition() {
    const tbody = document.getElementById('nut-table');
    if (state.nutrition.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="es-icon">📊</div><div class="es-title">No nutrition data yet</div></div></td></tr>`;
        selectedNutName = null;
    } else {
        tbody.innerHTML = state.nutrition.map(n => `
        <tr style="cursor:pointer;" data-nut-name="${n.name.replace(/"/g, '&quot;')}" id="nut-row-${n.name.replace(/\s+/g, '_')}">
          <td><strong>${n.name}</strong></td>
          <td>${n.fat}g</td>
          <td>${n.prot}g</td>
          <td>${n.carb}g</td>
          <td>${n.sodium}mg</td>
          <td>${n.pot}mg</td>
          <td class="td-actions">
            <button class="action-btn edit" data-nut-name="${n.name.replace(/"/g, '&quot;')}">✏️</button>
            <button class="action-btn del"  data-nut-name="${n.name.replace(/"/g, '&quot;')}">🗑️</button>
          </td>
        </tr>`).join('');

        // Row click → select
        tbody.querySelectorAll('tr[data-nut-name]').forEach(tr => {
            tr.addEventListener('click', () => {
                selectNutritionIngredient(tr.dataset.nutName);
            });
        });

        // Edit button
        tbody.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                editNutrition(btn.dataset.nutName);
            });
        });

        // Delete button
        tbody.querySelectorAll('.action-btn.del').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                deleteNutrition(btn.dataset.nutName);
            });
        });

        if (selectedNutName && !state.nutrition.find(n => n.name === selectedNutName)) {
            selectedNutName = null;
        }
        if (!selectedNutName && state.nutrition.length > 0) {
            selectedNutName = state.nutrition[0].name;
        }
        highlightSelectedRow();
    }
    // renderNutPills();
    renderMacroChart();
    renderTopNutritionList();
}

function renderNutPills() {
    const container = document.getElementById('nut-pill-container');
    if (state.nutrition.length === 0) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = state.nutrition.map(n => `
      <div class="nut-pill${selectedNutName === n.name ? ' selected' : ''}"
           data-nut-name="${n.name.replace(/"/g, '&quot;')}">`
        + n.name + `</div>`).join('');

    container.querySelectorAll('.nut-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            selectNutritionIngredient(pill.dataset.nutName);
        });
    });
}

function selectNutritionIngredient(name) {
    selectedNutName = name;
    // renderNutPills();
    renderMacroChart();
    highlightSelectedRow();
}

function highlightSelectedRow() {
    document.querySelectorAll('#nut-table tr').forEach(tr => {
        tr.style.background = '';
    });
    if (selectedNutName) {
        const row = document.getElementById(`nut-row-${selectedNutName.replace(/\s+/g, '_')}`);
        if (row) row.style.background = 'rgba(79,115,84,0.07)';
    }
}

function renderMacroChart() {
    const area = document.getElementById('macro-chart-area');
    const label = document.getElementById('nut-selected-label');
    const nameEl = document.getElementById('nut-selected-name');

    if (state.nutrition.length === 0) {
        area.innerHTML = `<p style="font-size:13px;color:var(--light)">Add nutrition data, then click an ingredient to see its breakdown.</p>`;
        label.style.display = 'none';
        return;
    }

    const n = state.nutrition.find(x => x.name === selectedNutName);
    if (!n) { area.innerHTML = ''; label.style.display = 'none'; return; }

    label.style.display = 'flex';
    nameEl.textContent = n.name;

    // For fat/protein/carbs bars: percentage relative to their sum (shows macronutrient ratio)
    const macroTotal = (+n.fat) + (+n.prot) + (+n.carb) || 1;
    // For sodium/potassium: percentage of recommended daily intake
    const sodiumRDI = 2300;  // mg
    const potassiumRDI = 3500;  // mg

    area.innerHTML = `
      <div class="nut-bar-wrap nut-fat">
        <div class="nut-bar-label">
          <span>Fat</span>
          <span>${(+n.fat).toFixed(1)}g &nbsp;<small style="color:var(--light);font-size:10px">${(+n.fat / macroTotal * 100).toFixed(0)}% of macros</small></span>
        </div>
        <div class="nut-bar"><div class="nut-bar-fill" style="width:${(+n.fat / macroTotal * 100).toFixed(1)}%"></div></div>
      </div>
      <div class="nut-bar-wrap nut-protein">
        <div class="nut-bar-label">
          <span>Protein</span>
          <span>${(+n.prot).toFixed(1)}g &nbsp;<small style="color:var(--light);font-size:10px">${(+n.prot / macroTotal * 100).toFixed(0)}% of macros</small></span>
        </div>
        <div class="nut-bar"><div class="nut-bar-fill" style="width:${(+n.prot / macroTotal * 100).toFixed(1)}%"></div></div>
      </div>
      <div class="nut-bar-wrap nut-carb">
        <div class="nut-bar-label">
          <span>Carbs</span>
          <span>${(+n.carb).toFixed(1)}g &nbsp;<small style="color:var(--light);font-size:10px">${(+n.carb / macroTotal * 100).toFixed(0)}% of macros</small></span>
        </div>
        <div class="nut-bar"><div class="nut-bar-fill" style="width:${(+n.carb / macroTotal * 100).toFixed(1)}%"></div></div>
      </div>
      <div style="height:10px"></div>
      <div class="nut-bar-wrap nut-sodium">
        <div class="nut-bar-label">
          <span>Sodium</span>
          <span>${(+n.sodium).toFixed(0)}mg &nbsp;<small style="color:var(--light);font-size:10px">${Math.min(100, (+n.sodium / sodiumRDI * 100)).toFixed(0)}% RDI</small></span>
        </div>
        <div class="nut-bar"><div class="nut-bar-fill" style="width:${Math.min(100, +n.sodium / sodiumRDI * 100).toFixed(1)}%"></div></div>
      </div>
      <div class="nut-bar-wrap nut-potassium">
        <div class="nut-bar-label">
          <span>Potassium</span>
          <span>${(+n.pot).toFixed(0)}mg &nbsp;<small style="color:var(--light);font-size:10px">${Math.min(100, (+n.pot / potassiumRDI * 100)).toFixed(0)}% RDI</small></span>
        </div>
        <div class="nut-bar"><div class="nut-bar-fill" style="width:${Math.min(100, +n.pot / potassiumRDI * 100).toFixed(1)}%"></div></div>
      </div>`;
}

function renderTopNutritionList() {
    const container = document.getElementById('top-nutrition-list');
    if (state.nutrition.length === 0) {
        container.innerHTML = `<p style="font-size:13px;color:var(--light)">No data yet.</p>`;
        return;
    }
    const sorted = [...state.nutrition].sort((a, b) => (+b.prot) - (+a.prot)).slice(0, 5);
    container.innerHTML = sorted.map(n => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--parchment);cursor:pointer;"
           data-nut-name="${n.name.replace(/"/g, '&quot;')}">
        <div style="font-size:20px">🌿</div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:600;color:var(--forest)">${n.name}</div>
          <div style="font-size:11px;color:var(--light)">${n.prot}g protein · ${n.carb}g carbs · ${n.fat}g fat</div>
        </div>
        ${selectedNutName === n.name ? '<span style="font-size:11px;color:var(--sage-dark);font-weight:700;"></span>' : ''}
        </div>`).join('');

    container.querySelectorAll('[data-nut-name]').forEach(el => {
        el.addEventListener('click', () => {
            selectNutritionIngredient(el.dataset.nutName);
        });
    });
}

function editNutrition(name) {
    const n = state.nutrition.find(x => x.name === name);
    if (!n) return;
    document.getElementById('en-name').value = n.name;
    document.getElementById('en-fat').value = n.fat;
    document.getElementById('en-prot').value = n.prot;
    document.getElementById('en-carb').value = n.carb;
    document.getElementById('en-sodium').value = n.sodium;
    document.getElementById('en-pot').value = n.pot;
    document.getElementById('en-id').value = id;
    openModal('modal-edit-nutrition');
}

function saveEditNutrition() {
    const name = document.getElementById('en-id').value;
    const n = state.nutrition.find(x => x.name === name);
    if (!n) return;
    n.name = document.getElementById('en-name').value.trim();
    n.fat = document.getElementById('en-fat').value;
    n.prot = document.getElementById('en-prot').value;
    n.carb = document.getElementById('en-carb').value;
    n.sodium = document.getElementById('en-sodium').value;
    n.pot = document.getElementById('en-pot').value;
    if (selectedNutName === name) selectedNutName = n.name;
    closeModal('modal-edit-nutrition');
    renderNutrition();
    toast('Nutrition updated!');
}

function deleteNutrition(name) {
    const n = state.nutrition.find(x => x.name === name);
    if (!n) return;
    confirmDelete(`Delete nutrition data for "${n.name}"?`, () => {
        state.nutrition = state.nutrition.filter(x => x.name !== name);
        if (selectedNutName === name) selectedNutName = null;
        renderNutrition(); updateDashboard();
        toast('Nutrition data deleted', 'info');
    });
}

// ================================================================
// COMMUNITY SERVICES
// ================================================================
const svcIcons = { 'Soup Kitchen': '🍲', 'Food Bank': '🏦', 'Meal Delivery': '🚐', 'Community Garden': '🌻', 'Other': '🤲' };

async function addService() {
    const name = document.getElementById('svc-name').value.trim();
    if (!name) { toast('Service name is required', 'error'); return; }
    const item = {
        id: nextId(), name,
        type: document.getElementById('svc-type').value,
        freq: document.getElementById('svc-freq').value,
        contact: document.getElementById('svc-contact').value.trim(),
    };

    try {
        // SEND TO BACKEND
        const response = await fetch('/create-community-service', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                serviceID: 7,
                name: name,
                address: 'Vancouver'
            })
        });

        const responseData = await response.json();

        if (responseData.success) {
            toast('Community service added successfully!', 'success');
        } else {
            toast('Error adding community service.', 'error');
        }
    } catch (error) {
        toast('Network error while adding ingredient', 'error');
        console.error('Error:', error);
    }

    state.services.push(item);
    renderServices();
    closeModal('modal-add-service');
    clearInputs(['svc-name', 'svc-contact']);
    toast(`Service "${name}" added!`);
}

function renderServices() {
    const container = document.getElementById('svc-list');
    if (state.services.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">🤲</div><div class="es-title">No services yet</div><div class="es-sub">Add community services to the list</div></div>`;
        return;
    }
    container.innerHTML = state.services.map(s => `
      <div class="facility-card" data-searchable="${s.name} ${s.type}">
        <div class="facility-icon">${svcIcons[s.type] || '🤲'}</div>
        <div class="facility-info">
          <div class="fname">${s.name}</div>
          <div class="fmeta"><span class="badge badge-green">${s.type}</span> · ${s.freq}</div>
          <div class="faddr">${s.contact || '—'}</div>
        </div>
        <div class="facility-actions">
          <button class="action-btn del" onclick="deleteService(${s.id})">🗑️</button>
        </div>
      </div>`).join('');
}

function deleteService(id) {
    const s = state.services.find(x => x.id === id);
    confirmDelete(`Delete service "${s.name}"?`, () => {
        state.services = state.services.filter(x => x.id !== id);
        renderServices();
        toast('Service deleted', 'info');
    });
}

// ================================================================
// FACILITIES
// ================================================================
const facIcons = { 'Food Pantry': '🥫', 'Shelter': '🏠', 'Community Centre': '🏛️', 'Hospital': '🏥', 'Other': '🏢' };

function addFacility() {
    const name = document.getElementById('fac-name').value.trim();
    if (!name) { toast('Facility name is required', 'error'); return; }
    const item = {
        id: nextId(), name,
        type: document.getElementById('fac-type').value,
        cap: document.getElementById('fac-cap').value || '—',
        addr: document.getElementById('fac-addr').value.trim(),
        contact: document.getElementById('fac-contact').value.trim(),
    };
    state.facilities.push(item);
    renderFacilities();
    closeModal('modal-add-facility');
    clearInputs(['fac-name', 'fac-cap', 'fac-addr', 'fac-contact']);
    toast(`Facility "${name}" added!`);
}

function renderFacilities() {
    const container = document.getElementById('fac-list');
    if (state.facilities.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="es-icon">🏥</div><div class="es-title">No facilities yet</div></div>`;
        return;
    }
    container.innerHTML = state.facilities.map(f => `
      <div class="facility-card" data-searchable="${f.name} ${f.type} ${f.addr}">
        <div class="facility-icon">${facIcons[f.type] || '🏢'}</div>
        <div class="facility-info">
          <div class="fname">${f.name}</div>
          <div class="fmeta"><span class="badge badge-blue">${f.type}</span> · Capacity: ${f.cap}/day</div>
          <div class="faddr">📍 ${f.addr || '—'} · 📞 ${f.contact || '—'}</div>
        </div>
        <div class="facility-actions">
          <button class="action-btn del" onclick="deleteFacility(${f.id})">🗑️</button>
        </div>
      </div>`).join('');
}

function deleteFacility(id) {
    const f = state.facilities.find(x => x.id === id);
    confirmDelete(`Delete facility "${f.name}"?`, () => {
        state.facilities = state.facilities.filter(x => x.id !== id);
        renderFacilities();
        toast('Facility deleted', 'info');
    });
}

// ================================================================
// DONATIONS
// ================================================================
const donStatusBadge = { pending: 'badge-amber', delivered: 'badge-blue', received: 'badge-green' };

function refreshDonSelects() {
    const sel = document.getElementById('don-fac-sel');
    sel.innerHTML = state.facilities.length
        ? state.services.map(f => `<option value="${f.id}">${f.name}</option>`).join('')
        : '<option disabled>No facilities yet</option>';
}

async function addDonation() {
    const donor = document.getElementById('don-donor').value.trim();
    const item = document.getElementById('don-item').value.trim();
    if (!donor || !item) { toast('Donor and item are required', 'error'); return; }
    const facId = +document.getElementById('don-fac-sel').value;
    const fac = state.facilities.find(f => f.id === facId);
    const don = {
        id: nextId(), donor, item,
        qty: document.getElementById('don-qty').value.trim() || '—',
        facility: fac ? fac.name : '—',
        date: document.getElementById('don-date').value || today(),
        status: document.getElementById('don-status').value,
    };

    console.log(don.date)

    try {
        const response = await fetch('/create-donate-to', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userEmail: donor,
                ingredientName: item,
                serviceID: facId,
                donationDate: don.date,
                quantity: don.qty,
                unit: 'kg'
            })
        });

        const responseData = await response.json();

        // if (responseData.success) {
        //     toast('Donation added successfully!', 'success');
        // } else {
        //     toast('Error adding donation. Please check that the user, ingredient, and community service exist.', 'error');
        // }
    } catch (error) {
        toast('Network error while adding donation', 'error');
        console.error('Error:', error);
    }

    state.donations.push(don);
    renderDonations();
    closeModal('modal-add-donation');
    clearInputs(['don-donor', 'don-item', 'don-qty', 'don-date']);
    toast(`Donation by "${donor}" logged!`);
    updateDashboard();
}

function renderDonations() {
    const tbody = document.getElementById('don-table');
    if (state.donations.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="es-icon">🎁</div><div class="es-title">No donations yet</div></div></td></tr>`;
        return;
    }
    tbody.innerHTML = state.donations.map(d => `
      <tr>
        <td><strong>${d.donor}</strong></td>
        <td>${d.item}</td>
        <td>${d.qty}</td>
        <td>${d.facility}</td>
        <td>${d.date}</td>
        <!-- <td><span class="badge ${donStatusBadge[d.status] || 'badge-gray'}">${d.status}</span></td> -->
        <td class="td-actions">
          <!-- <button class="action-btn edit" onclick="toggleDonStatus(${d.id})" title="Toggle Status">🔄</button> -->
          <button class="action-btn del" onclick="deleteDonation(${d.id})">🗑️</button>
        </td>
      </tr>`).join('');
}

function toggleDonStatus(id) {
    const d = state.donations.find(x => x.id === id);
    const cycle = ['pending', 'delivered', 'received'];
    d.status = cycle[(cycle.indexOf(d.status) + 1) % cycle.length];
    renderDonations(); updateDashboard();
    toast(`Status → ${d.status}`, 'info');
}

function deleteDonation(id) {
    const d = state.donations.find(x => x.id === id);
    confirmDelete(`Delete donation by "${d.donor}"?`, () => {
        state.donations = state.donations.filter(x => x.id !== id);
        renderDonations(); updateDashboard();
        toast('Donation deleted', 'info');
    });
}

// ================================================================
// STORES
// ================================================================
async function addStore() {
    const name = document.getElementById('store-name').value.trim();
    if (!name) { toast('Store name is required', 'error'); return; }
    const item = {
        id: nextId(), name,
        type: document.getElementById('store-type').value,
        hours: document.getElementById('store-hours').value.trim() || '—',
        loc: document.getElementById('store-loc').value.trim() || '—',
    };

    try {
        const response = await fetch('/create-store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                storeName: name,
                address: item.loc,
                contact: '999-999-999'
            })
        });

        const responseData = await response.json();

        // if (responseData.success) {
        //     showNotification('Store added successfully!', 'success');
        //     fetchAndDisplayStoreProjection();

        //     // Clear form
        //     document.getElementById('new-store-name').value = '';
        //     document.getElementById('new-store-address').value = '';
        //     document.getElementById('new-store-contact').value = '';
        // } else {
        //     showNotification('Error adding store. A store with this name and address may already exist.', 'error');
        // }
    } catch (error) {
        toast('Network error while adding store', 'error');
        console.error('Error:', error);
    }

    state.stores.push(item);
    renderStores();
    closeModal('modal-add-store');
    clearInputs(['store-name', 'store-hours', 'store-loc']);
    toast(`Store "${name}" added!`);
}

function renderStores() {
    const tbody = document.getElementById('store-table');
    if (state.stores.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="es-icon">🏪</div><div class="es-title">No stores yet</div></div></td></tr>`;
        return;
    }
    tbody.innerHTML = state.stores.map(s => `
      <tr data-cat="${s.type}">
        <td><strong>${s.name}</strong></td>
        <!-- <td><span class="badge badge-gray">${s.type}</span></td> -->
        <td>${s.loc}</td>
        <!-- <td>${s.hours}</td> -->
        <td class="td-actions">
          <button class="action-btn del" onclick="deleteStore(${s.id})">🗑️</button>
        </td>
      </tr>`).join('');
}

function deleteStore(id) {
    const s = state.stores.find(x => x.id === id);
    confirmDelete(`Delete store "${s.name}"?`, () => {
        state.stores = state.stores.filter(x => x.id !== id);
        renderStores();
        toast('Store deleted', 'info');
    });
}

// ================================================================
// UTENSILS
// ================================================================
const utensIcons = { cutting: '🔪', cooking: '🍳', baking: '🥄', storage: '📦', other: '📌' };
let utensilCatFilter = '';

function addUtensil() {
    const name = document.getElementById('ut-name').value.trim();
    if (!name) { toast('Utensil name is required', 'error'); return; }
    const item = {
        id: nextId(), name,
        cat: document.getElementById('ut-cat').value,
        mat: document.getElementById('ut-mat').value.trim() || '—',
        notes: document.getElementById('ut-notes').value.trim(),
    };
    state.utensils.push(item);
    renderUtensils();
    closeModal('modal-add-utensil');
    clearInputs(['ut-name', 'ut-mat', 'ut-notes']);
    toast(`Utensil "${name}" added!`);
}

function renderUtensils() {
    const grid = document.getElementById('utensil-grid');
    const items = utensilCatFilter ? state.utensils.filter(u => u.cat === utensilCatFilter) : state.utensils;
    if (items.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">🥄</div><div class="es-title">No utensils yet</div></div>`;
        return;
    }
    grid.innerHTML = items.map(u => `
      <div class="item-card" data-searchable="${u.name} ${u.cat}">
        <div class="ic-icon">${utensIcons[u.cat] || '📌'}</div>
        <div class="ic-name">${u.name}</div>
        <!-- <div class="ic-meta">${u.mat} · <span class="badge badge-gray">${u.cat}</span></div> -->
        <!-- ${u.notes ? `<div style="font-size:11px;color:var(--light);margin-top:4px;">${u.notes}</div>` : ''} -->
        <div class="ic-actions">
          <button class="action-btn del" onclick="deleteUtensil(${u.id})">🗑️</button>
        </div>
      </div>`).join('');
}

function filterUtensilCategory(chip, cat) {
    chip.closest('.filter-chips').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    utensilCatFilter = cat;
    renderUtensils();
}

function deleteUtensil(id) {
    const u = state.utensils.find(x => x.id === id);
    confirmDelete(`Delete utensil "${u.name}"?`, () => {
        state.utensils = state.utensils.filter(x => x.id !== id);
        renderUtensils();
        toast('Utensil deleted', 'info');
    });
}

// ================================================================
// UTILS
// ================================================================
function today() {
    return new Date().toISOString().split('T')[0];
}
function clearInputs(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

// ================================================================
// SEED DEMO DATA
// ================================================================
async function seedData() {
    // Users
    await fetchAndDisplayUsers();

    // Ingredients
    await fetchAndDisplayIngredients();

    // Foods
    await fetchAndDisplayFoods();

    // Recipes
    await fetchAndDisplayRecipes();

    // Nutrition
    await fetchAndDisplayNutritions();

    // Facilities
    await fetchAndDisplayAidFacilities();

    // Services
    await fetchAndDisplayCommunityServices();

    // Donations
    await fetchAndDisplayDonations();

    // Stores
    await fetchAndDisplayStores();

    // Utensils
    await fetchAndDisplayUtensils();

    // Favourites
    // state.favourites.push(
    //   { id: nextId(), userId: state.users[0].id, recipeId: state.recipes[0].id, userName: state.users[0].name, recipeName: state.recipes[0].name, added:'2025-03-10' },
    //   { id: nextId(), userId: state.users[1].id, recipeId: state.recipes[2].id, userName: state.users[1].name, recipeName: state.recipes[2].name, added:'2025-03-12' },
    // );

    await fetchAndDisplayFavorites();

    renderAll();
    updateDashboard();
}

function renderAll() {
    renderUsers(); renderFavourites();
    renderIngredients(); renderFoods(); renderRecipes();
    renderNutrition();
    renderServices(); renderFacilities(); renderDonations();
    renderStores(); renderUtensils();
}

// ================================================================
// INIT
// ================================================================
seedData();

// My Functions

async function checkDbConnection() {
    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    response.text()
        .then((text) => {
            console.log(text);
            if (text === 'connected') {
                toast('Database connected successfully', 'success', 2000);
            } else {
                toast('Unable to connect to database', 'error');
            }
        })
        .catch((error) => {
            toast('Connection timed out', 'error');
            console.error('Connection error:', error);
        });
}

// Fetches data from the user table and displays it.
async function fetchAndDisplayUsers() {
    const response = await fetch('/get-all-users', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    demotableContent.forEach(user => {
        state.users.push({ id: 1, name: user[0], email: user[2], loc: user[1], joined: '2025-01-10' });
    });
}

async function fetchAndDisplayFavorites() {
    const response = await fetch('/get-all-favorites', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    demotableContent.forEach(fav => {
        state.favourites.push({ user: fav[0], recipe: fav[2] });
    });
}

async function fetchAndDisplayIngredients() {
    try {
        const response = await fetch('/get-all-ingredients', {
            method: 'GET'
        });

        const responseData = await response.json();
        const ingredients = responseData.data;

        if (ingredients.length === 0) {
            return;
        }

        ingredients.forEach(ingredient => {
            state.ingredients.push({ id: 1, name: ingredient[0], shelf: ingredient[1] });
        });
    } catch (error) {
        toast('Error fetching ingredient data', 'error');
        console.error('Error:', error);
    }
}

async function fetchAndDisplayFoods() {
    try {
        const response = await fetch('/get-all-foods', {
            method: 'GET'
        });

        const responseData = await response.json();
        const foods = responseData.data;

        if (foods.length === 0) {
            return;
        }

        foods.forEach(food => {
            state.foods.push({ id: 1, name: food[0], type: 'Soup', cal: '320', season: 'All Year', origin: food[1], description: food[2] });
        });
    } catch (error) {
        toast('Error fetching food data', 'error');
        console.error('Error:', error);
    }
}

async function fetchAndDisplayRecipes() {
    try {
        const response = await fetch('/get-all-recipes', {
            method: 'GET'
        });

        const responseData = await response.json();
        const recipes = responseData.data;

        if (recipes.length === 0) {
            return;
        }

        recipes.forEach(recipe => {
            state.recipes.push({ id: recipe[0], name: recipe[1], meal: 'lunch', time: '25', servings: '4', instructions: recipe[2], difficulty: recipe[3] });
        });
    } catch (error) {
        toast('Error fetching recipe data', 'error');
        console.error('Error:', error);
    }
}

async function fetchAndDisplayNutritions() {
    try {
        const response = await fetch('/get-all-nutrition-types', {
            method: 'GET'
        });

        const responseData = await response.json();
        const demotableContent = responseData.data;

        demotableContent.forEach(nutrition => {
            state.nutrition.push({ id: 1, name: nutrition[0], fat: nutrition[1] / 1000, prot: nutrition[2] / 1000, carb: nutrition[3] / 1000, sodium: nutrition[4], pot: nutrition[5] });
        });
    } catch (error) {
        toast('Error fetching nutrition data', 'error');
        console.error('Error:', error);
    }
}

async function fetchAndDisplayAidFacilities() {
    try {
        const response = await fetch('/get-all-aid-facility', {
            method: 'GET'
        });

        const responseData = await response.json();
        const demotableContent = responseData.data;

        demotableContent.forEach(facility => {
            state.facilities.push({ id: facility[0], name: facility[1], type: 'Homeless Shelter', cap: facility[2], addr: facility[4] + ", " + facility[5], contact: facility[3] });
        });
    } catch (error) {
        toast('Error fetching nutrition data', 'error');
        console.error('Error:', error);
    }
}

async function fetchAndDisplayCommunityServices() {
    const response = await fetch('/get-all-community-service', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    demotableContent.forEach(comserv => {
        state.services.push({ id: comserv[0], name: comserv[1], type: '-', freq: '-', contact: '-' });
    });
}

async function fetchAndDisplayDonations() {
    const response = await fetch('/get-join-donation-and-community-service', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    demotableContent.forEach(donation => {
        state.donations.push({ id: 1, donor: donation[0], item: donation[1], qty: donation[2], facility: donation[5], date: '2025-03-15', status: 'delivered' });
    });
}

async function fetchAndDisplayStores() {
    try {
        const response = await fetch('get-all-store', {
            method: 'GET'
        });

        const responseData = await response.json();
        const demotableContent = responseData.data;

        demotableContent.forEach(store => {
            state.stores.push({ id: 1, name: store[0], type: 'market', hours: 'Tue–Sun 9am–7pm', loc: store[1] });
        });

    } catch (error) {
        toast('Error fetching store data', 'error');
        console.error('Error:', error);
    }
}

async function fetchAndDisplayUtensils() {
    try {
        const response = await fetch('/get-all-utensil', {
            method: 'GET'
        });

        const responseData = await response.json();
        const utensils = responseData.data;

        if (utensils.length === 0) {
            return;
        }

        utensils.forEach(utensil => {
            state.utensils.push({ id: 1, name: utensil[0], cat: 'cutting', mat: utensil[2], notes: '8-inch blade' })
        });
    } catch (error) {
        toast('Error fetching utensil data', 'error');
        console.error('Error:', error);
    }
}

window.onload = () => {
    checkDbConnection();
}
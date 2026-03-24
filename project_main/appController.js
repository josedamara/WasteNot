const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/get-all-users', async (req, res) => {
    const tableContent = await appService.getAllUsers();
    res.json({data: tableContent});
});

router.get('/get-all-community-service', async (req, res) => {
    const tableContent = await appService.getAllCommunityServices();
    res.json({data: tableContent});
});

router.get('/get-all-donate-to', async (req, res) => {
    const tableContent = await appService.getAllDonateTo();
    res.json({data: tableContent});
});

router.get('/get-all-store', async (req, res) => {
    const tableContent = await appService.getAllStores();
    res.json({data: tableContent});
});

router.get('/get-all-nutrition-types', async (req, res) => {
    const tableContent = await appService.getAllNutritionTypes();
    res.json({data: tableContent});
});

router.post("/login-user", async (req, res) => {
    const { email } = req.body;

    const result = await appService.checkUserExists(email);

    if (result.exists) {
        return res.json({ success: true });
    } else {
        return res.json({ success: false });
    }
});

router.post('/get-selection-nutrition-types', async (req, res) => {
    const { conditions } = req.body;
    const tableContent = await appService.getSelectionNutritionTypes(conditions);
    res.json({data: tableContent});
});

router.post("/create-user", async (req, res) => {
    const { name, address, email } = req.body;
    const insertResult = await appService.createUser(name, address, email);

    if (insertResult.success !== false) {
        // Insert succeeded
        return res.json({ success: true });
    }

    // Insert failed
    return res.status(500).json({
        success: false,
        error: insertResult.error
    });
});

router.post("/create-donate-to", async (req, res) => {
    const { userEmail, ingredientName, serviceID, donationDate, quantity, unit } = req.body;

    const insertResult = await appService.createDonateTo(
        userEmail,
        ingredientName,
        serviceID,
        donationDate,
        quantity,
        unit
    );

    // SUCCESS
    if (insertResult.success) {
        return res.json({ success: true });
    }

    // FAILURE
    return res.status(500).json({
        success: false,
        error: insertResult.error
    });
});

router.post("/update-user-name", async (req, res) => {
    const { email, newName } = req.body;
    const updateResult = await appService.updateUserName(email, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-user-address", async (req, res) => {
    const { email, newAddress } = req.body;
    const updateResult = await appService.updateUserAddress(email, newAddress);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-user-email", async (req, res) => {
    const { email, newEmail } = req.body;
    const updateResult = await appService.updateUserEmail(email, newEmail);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-community-service", async (req, res) => {
    const { oldID, newID, newName, newAddress } = req.body;
    const updateResult = await appService.updateCommunityService(oldID, newID, newName, newAddress);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/delete-user", async (req, res) => {
    const { email } = req.body;
    const updateResult = await appService.deleteUser(email);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/delete-store", async (req, res) => {
    const { name, address } = req.body;
    const updateResult = await appService.deleteStore(name, address);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get("/get-store-projection", async (req, res) => {
    const rawVariables = req.query.vars || "";
    const variableArray = rawVariables.split(",").filter(v => v.trim() !== "");
    const projectionResult = await appService.getStoreProjection(variableArray);
    res.json({data: projectionResult});
})

router.post("/get-join-donation-and-community-service", async (req, res) => {
    // const { query } = req.body;
    const conditions = Array.isArray(req.body.conditions) ? req.body.conditions : [];
    const tableContent = await appService.getJoinDonationService(conditions);
    res.json({data: tableContent});
})

// NUTRITION TYPES endpoints
router.post("/create-nutrition-type", async (req, res) => {
    const { ingredientName, fat, protein, carbohydrate, sodium, potassium } = req.body;
    const insertResult = await appService.createNutritionType(
        ingredientName, fat, protein, carbohydrate, sodium, potassium
    );
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/delete-nutrition-type", async (req, res) => {
    const { ingredientName } = req.body;
    const deleteResult = await appService.deleteNutritionType(ingredientName);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// UTENSIL endpoints
router.post("/create-utensil", async (req, res) => {
    const { name, material, sustainable } = req.body;
    const insertResult = await appService.createUtensil(name, material, sustainable);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/delete-utensil", async (req, res) => {
    const { name, material } = req.body;
    const deleteResult = await appService.deleteUtensil(name, material);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/get-all-utensil', async (req, res) => {
    const tableContent = await appService.getAllUtensil();
    res.json({data: tableContent});
});

// STORE endpoints  
router.post("/create-store", async (req, res) => {
    const { storeName, address, contact } = req.body;
    const insertResult = await appService.createStore(storeName, address, contact);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// INGREDIENT endpoints
router.post("/create-ingredient", async (req, res) => {
    const { name, shelfLife } = req.body;
    const insertResult = await appService.createIngredient(name, shelfLife);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/delete-ingredient", async (req, res) => {
    const { name } = req.body;
    const deleteResult = await appService.deleteIngredient(name);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// FOOD endpoints
router.post("/create-food", async (req, res) => {
    const { name, origin, description } = req.body;
    const insertResult = await appService.createFood(name, origin, description);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/delete-food", async (req, res) => {
    const { name } = req.body;
    const deleteResult = await appService.deleteFood(name);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// RECIPE endpoints
router.post("/create-recipe", async (req, res) => {
    const { recipeID, foodName, instructions, difficulty } = req.body;
    const insertResult = await appService.createRecipe(recipeID, foodName, instructions, difficulty);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/delete-recipe", async (req, res) => {
    const { recipeID, foodName } = req.body;
    const deleteResult = await appService.deleteRecipe(recipeID, foodName);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// COMMUNITY SERVICE endpoints
router.post("/create-community-service", async (req, res) => {
    const { serviceID, name, address } = req.body;
    const insertResult = await appService.createCommunityService(serviceID, name, address);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/delete-community-service", async (req, res) => {
    const { serviceID } = req.body;
    const deleteResult = await appService.deleteCommunityService(serviceID);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/get-all-ingredients', async (req, res) => {
    try {
        const tableContent = await appService.getAllIngredients();
        res.json({ data: tableContent });
    } catch (err) {
        console.error("Error in /get-all-ingredients:", err);
        res.status(500).json({ data: [], error: err.message });
    }
});

router.get('/get-all-foods', async (req, res) => {
    try {
        const tableContent = await appService.getAllFoods();
        res.json({ data: tableContent });
    } catch (err) {
        console.error("Error in /get-all-foods:", err);
        res.status(500).json({ data: [], error: err.message });
    }
});

router.get('/get-all-recipes', async (req, res) => {
    try {
        const tableContent = await appService.getAllRecipes();
        res.json({ data: tableContent });
    } catch (err) {
        console.error("Error in /get-all-recipes:", err);
        res.status(500).json({ data: [], error: err.message });
    }
});


// CPSC304 REQUIRED Grading Queries


// 1️. INSERT
router.post("/insert-donation", async (req, res) => {
    try {
        const result = await appService.insertDonation(req.body);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2️. UPDATE
router.post("/update-user-address", async (req, res) => {
    const { email, newAddress } = req.body;
    const result = await appService.updateUserAddress(email, newAddress);
    res.json(result);
});

// 3️. DELETE
router.post("/delete-donation", async (req, res) => {
    const { userEmail, ingredientName, serviceID } = req.body;
    const result = await appService.deleteDonation(userEmail, ingredientName, serviceID);
    res.json(result);
});

// 4️. SELECTION
router.get("/select-ingredients", async (req, res) => {
    const min = req.query.min || 0;
    const unit = req.query.unit || "kg";
    res.json(await appService.selectIngredientsWithFilter(min, unit));
});

// 5️. PROJECTION
router.get("/project-stores", async (req, res) => {
    res.json(await appService.projectStoresBasic());
});

// 6️. JOIN
router.get("/join-donations-services", async (req, res) => {
    res.json(await appService.joinDonationsWithService());
});

// 7️. AGGREGATION GROUP BY
router.get("/query7", async (req, res) => {
    const tableContent = await appService.query7();
    res.json({data: tableContent});
});

// 8️. HAVING
router.get("/query8", async (req, res) => {
    const tableContent = await appService.query8(req.query.threshold || 1);
    res.json({data: tableContent});
});

// 9️. NESTED AGGREGATION
router.get("/query9", async (req, res) => {
    const tableContent = await appService.query9();
    res.json({data: tableContent});
});

// 10. DIVISION
router.get("/query10", async (req, res) => {
    const tableContent = await appService.query10();
    res.json({data: tableContent});
});

module.exports = router;
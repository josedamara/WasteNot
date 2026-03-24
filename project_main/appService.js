const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DEMOTABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE DEMOTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertDemotable(id, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
            [id, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

// ----------------------------------------------------------
// Main Project


// Get/Return all (Selection)
async function getAllUsers() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM USERS');
        return result.rows;
    }).catch(() => {
        return [];
    }).catch(() => {
        return [];
    });
}

async function getAllIngredients() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM INGREDIENT');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllFoods() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM FOOD');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllUtensil() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM UTENSIL');
        return result.rows;
    }).catch(() => {
        return [];
    });
}


async function getAllRecipes() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM RECIPE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllStores() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM STORE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllCommunityServices() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM COMMUNITYSERVICE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllAidFacilities() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM AIDFACILITY');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllHomelessShelter() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM HOMELESSSHELTER');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllOrphanageFacility() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM ORPHANAGEFACILITY');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllNursingHome() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM NURSINGHOME');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllDonateTo() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DONATETO');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllNutritionTypes() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM NUTRITIONTYPES');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllIngredientNutrition() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM INGREDIENTNUTRITION');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllDistributeTo() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DISTRIBUTETO');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllSoldAt() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM SOLDAT');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllSells() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM SELLS');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllUses() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM USES');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllUsedIn() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM USEDIN');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getAllFavorites() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM FAVORITES');
        return result.rows;
    }).catch(() => {
        return [];
    });
}


// ----------------------------------------------------------
// INSERT HELPERS (create function)
async function createUser(name, address, email) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO USERS(Name, Address, Email)
            VALUES (:name, :address, :email)
        `;
        return await connection.execute(sql, { name, address, email }, { autoCommit: true });
    }).catch((err) => {
        return { error: err, success: false };
    });
}

async function createIngredient(name, shelfLife) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO INGREDIENT(Name, ShelfLife)
            VALUES (:name, :shelfLife)
        `;
        return await connection.execute(sql, { name, shelfLife }, { autoCommit: true });
    }).catch((err) => {
        return { error: err, success: false };
    });
}

async function createFood(name, origin, description) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO FOOD(Name, Origin, Description)
            VALUES (:name, :origin, :description)
        `;
        return await connection.execute(sql, { name, origin, description }, { autoCommit: true });
    }).catch(() => {
        return { error: err, success: false };
    });
}

async function createRecipe(recipeID, foodName, instructions, difficulty) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO RECIPE(RecipeID, FoodName, Instructions, Difficulty)
            VALUES (:recipeID, :foodName, :instructions, :difficulty)
        `;
        return await connection.execute(
            sql,
            { recipeID, foodName, instructions, difficulty },
            { autoCommit: true }
        );
    }).catch(() => {
        return { error: err, success: false };
    });
}

async function createUtensil(name, material, sustainable) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO UTENSIL(Name, Material, IsSustainable) 
            VALUES (:name, :material, :sustainable)
        `;
        return await connection.execute(
            sql,
            { name, material, sustainable},
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createStore(storeName, address, contact) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO STORE(Name, Address, Contact)
            VALUES (:storeName, :address, :contact)
        `;
        return await connection.execute(
            sql,
            { storeName, address, contact},
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createCommunityService(serviceID, name, address) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO COMMUNITYSERVICE(ServiceID, Name, Address)
            VALUES (:serviceID, :name, :address)
        `;
        return await connection.execute(sql, { serviceID, name, address }, { autoCommit: true });
    }).catch(() => {
        return false;
    });
}

async function createAidFacility(facilityID, name, capacity, contact, address, city) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO AIDFACILITY(FacilityID, Name, Capacity, Contact, Address, City)
            VALUES (:facilityID, :name, :capacity, :contact, :address, :city)
        `;
        return await connection.execute(
            sql,
            { facilityID, name, capacity, contact, address, city },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createDonateTo(userEmail, ingredientName, serviceID, donationDate, quantity, unit) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO DONATETO(UserEmail, IngredientName, ServiceID, DonationDate, Quantity, Unit)
            VALUES (:userEmail, :ingredientName, :serviceID, :donationDate, :quantity, :unit)
        `;
        return await connection.execute(
            sql,
            { userEmail, ingredientName, serviceID, donationDate, quantity, unit },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createHomelessShelter(facilityID, isRehabilitationProvided) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO HOMELESSSHELTER(FacilityID, IsRehabilitationProvided)
            VALUES (:facilityID, :isRehabilitationProvided)
        `;
        return await connection.execute(
            sql,
            { facilityID, isRehabilitationProvided },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createOrphanageFacility(facilityID, minimumAge, maximumAge, isEducationProvided, numberOfStaff) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO ORPHANAGEFACILITY(FacilityID, MinimumAge, MaximumAge, IsEducationProvided, NumberOfStaff)
            VALUES (:facilityID, :minimumAge, :maximumAge, :isEducationProvided, :numberOfStaff)
        `;
        return await connection.execute(
            sql,
            { facilityID, minimumAge, maximumAge, isEducationProvided, numberOfStaff },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createNursingHome(facilityID, numberOfDoctors, numberOfNurses, minimumAge) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO NURSINGHOME(FacilityID, NumberOfDoctors, NumberOfNurses, MinimumAge)
            VALUES (:facilityID, :numberOfDoctors, :numberOfNurses, :minimumAge)
        `;
        return await connection.execute(
            sql,
            { facilityID, numberOfDoctors, numberOfNurses, minimumAge },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createNutritionType(ingredientName, fat, protein, carbs, sodium, potassium) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO NUTRITIONTYPES(IngredientName, FatInMg, ProteinInMg, CarbohydrateInMg, SodiumInMg, PotassiumInMg)
            VALUES (:ingredientName, :fat, :protein, :carbs, :sodium, :potassium)
        `;
        return await connection.execute(
            sql,
            { ingredientName, fat, protein, carbs, sodium, potassium },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createIngredientNutrition(ingredientName, quantity, unit) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO INGREDIENTNUTRITION(IngredientName, Quantity, Unit)
            VALUES (:ingredientName, :quantity, :unit)
        `;
        return await connection.execute(
            sql,
            { ingredientName, quantity, unit },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createDistributeTo(serviceID, facilityID) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO DISTRIBUTETO(ServiceID, FacilityID)
            VALUES (:serviceID, :facilityID)
        `;
        return await connection.execute(sql, { serviceID, facilityID }, { autoCommit: true });
    }).catch(() => {
        return false;
    });
}

async function createSoldAt(ingredientName, storeName, storeAddress, price, availability) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO SOLDAT(IngredientName, StoreName, StoreAddress, Price, Availability)
            VALUES (:ingredientName, :storeName, :storeAddress, :price, :availability)
        `;
        return await connection.execute(
            sql,
            { ingredientName, storeName, storeAddress, price, availability },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createSells(storeName, storeAddress, utensilName, utensilMaterial) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO SELLS(StoreName, StoreAddress, UtensilName, UtensilMaterial)
            VALUES (:storeName, :storeAddress, :utensilName, :utensilMaterial)
        `;
        return await connection.execute(
            sql,
            { storeName, storeAddress, utensilName, utensilMaterial },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createUses(foodName, utensilName, utensilMaterial) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO USES(FoodName, UtensilName, UtensilMaterial)
            VALUES (:foodName, :utensilName, :utensilMaterial)
        `;
        return await connection.execute(
            sql,
            { foodName, utensilName, utensilMaterial },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createUsedIn(ingredientName, recipeID, foodName, unit, quantity) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO USEDIN(IngredientName, RecipeID, FoodName, Unit, Quantity)
            VALUES (:ingredientName, :recipeID, :foodName, :unit, :quantity)
        `;
        return await connection.execute(
            sql,
            { ingredientName, recipeID, foodName, unit, quantity },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function createFavorite(userEmail, recipeID, foodName) {
    return await withOracleDB(async (connection) => {
        const sql = `
            INSERT INTO FAVORITES(UserEmail, RecipeID, FoodName)
            VALUES (:userEmail, :recipeID, :foodName)
        `;
        return await connection.execute(
            sql,
            { userEmail, recipeID, foodName },
            { autoCommit: true }
        );
    }).catch(() => {
        return false;
    });
}

async function updateUserName(email, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE USERS SET Name=:newName WHERE Email=:email`,
            [newName, email],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateUserAddress(email, newAddress) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE USERS SET Address=:newAddress WHERE Email=:email`,
            [newAddress, email],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateUserEmail(email, newEmail) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE USERS SET Email=:newEmail WHERE Email=:email`,
            [newEmail, email],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateCommunityService(oldID, newID, newName, newAddress) {
    return await withOracleDB(async (connection) => {
        let updates = [];
        let binds = { oldID };

        if (newID) {
            updates.push("ServiceID = :newID");
            binds.newID = newID;
        }
        if (newName) {
            updates.push("Name = :newName");
            binds.newName = newName;
        }
        if (newAddress) {
            updates.push("Address = :newAddress");
            binds.newAddress = newAddress;
        }

        if (updates.length === 0) {
            return false;
        }

        const sql = `
            UPDATE CommunityService
            SET ${updates.join(", ")}
            WHERE ServiceID = :oldID
        `;

        const result = await connection.execute(
            sql,
            binds,
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function getStoreProjection(variables) {
    return await withOracleDB(async (connection) => {
        const projectionVariables = variables.join(",");
        const result = await connection.execute(`SELECT ${projectionVariables} FROM STORE`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteUser(email) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM USERS WHERE Email=:email`,
            [email],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function deleteStore(name, address) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM STORE WHERE Name=:name AND Address=:address`,
            [name, address],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function getSelectionNutritionTypes(conditions) {
    return await withOracleDB(async (connection) => {
        let whereClauses = [];
        let binds = {};
        let bindIndex = 0;

        for (let cond of conditions) {
            const attribute = cond.attribute;
            const comparator = cond.comparator;
            const value = cond.value;
            const logic = cond.logic;

            const bindName = "v" + bindIndex++;
            whereClauses.push(`${attribute} ${comparator} :${bindName} ${logic}`);
            binds[bindName] = value;
        }

        if (whereClauses.length === 0) return [];

        const url = `
            SELECT IngredientName, FatInMg, ProteinInMg,
                   SodiumInMg, CarbohydrateInMg, PotassiumInMg
            FROM NutritionTypes
            WHERE ${whereClauses.join(" ")}
        `;

        const result = await connection.execute(
            url,
            binds,
            { autoCommit: true }
        )

        return result.rows;
    }).catch(() => {
        return []
    })
}

async function getJoinDonationService(conditions) {
    return await withOracleDB(async (connection) => {
        let whereClauses = [];
        let binds = {};
        let bindIndex = 0;

        for (let cond of conditions) {
            const attribute = cond.attribute;
            const comparator = cond.comparator;
            const value = cond.value;
            const logic = cond.logic;

            const bindName = "v" + bindIndex++;
            whereClauses.push(`${attribute} ${comparator} :${bindName} ${logic}`);
            binds[bindName] = value;
        }

        let whereSQL = ""

        if (whereClauses.length > 0) {
            whereSQL = "WHERE " + whereClauses.join(" ");
        }

        const url = `
            SELECT d.UserEmail, d.IngredientName, d.Quantity, d.Unit,
                   s.ServiceID, s.Name AS ServiceName, s.Address AS ServiceAddress
            FROM DonateTo d
            JOIN CommunityService s ON d.ServiceID = s.ServiceID
            ${whereSQL}
        `
        const result = await connection.execute(
            url,
            binds,
            { autocommit: true }
        )

        return result.rows;
    }).catch(() => {
        return []
    })
}

// DELETE FUNCTIONS

async function deleteNutritionType(ingredientName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM NUTRITIONTYPES WHERE IngredientName=:ingredientName`,
            [ingredientName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function deleteUtensil(name, material) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM UTENSIL WHERE Name=:name AND Material=:material`,
            [name, material],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function deleteIngredient(name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM INGREDIENT WHERE Name=:name`,
            [name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function deleteFood(name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM FOOD WHERE Name=:name`,
            [name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function deleteRecipe(recipeID, foodName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM RECIPE WHERE RecipeID=:recipeID AND FoodName=:foodName`,
            [recipeID, foodName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function deleteCommunityService(serviceID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM COMMUNITYSERVICE WHERE ServiceID=:serviceID`,
            [serviceID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function deleteDonation(userEmail, ingredientName, serviceID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM DONATETO 
             WHERE UserEmail=:userEmail 
             AND IngredientName=:ingredientName 
             AND ServiceID=:serviceID`,
            [userEmail, ingredientName, serviceID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function checkUserExists(email) {
    try {
        return await withOracleDB(async (connection) => {
            const sql = `
                SELECT COUNT(*) AS count
                FROM Users
                WHERE Email = :email
            `;
            const result = await connection.execute(sql, { email });
            const exists = result.rows[0][0] > 0;
            return { success: true, exists };
        });
    } catch (err) {
        return { success: false, exists: false, error: err };
    }
}



// QUERIES for grading 

// 1. INSERT – using DonateTo (relation with FKs)
async function insertDonation(data) {
    // data: { UserEmail, IngredientName, ServiceID, Date, Quantity, Unit }
    return createDonateTo(
        data.UserEmail,
        data.IngredientName,
        data.ServiceID,
        data.Date,
        data.Quantity,
        data.Unit
    );
}

// 2. UPDATE – update CommunityService address (non-PK attribute)
async function updateCommunityAddressQuery(id, newName) {
    return await withOracleDB(async (connection) => {
        const sql = `
            UPDATE COMMUNITYSERVICE
            SET Name = :newName
            WHERE ServiceID = :id
        `;
        return await connection.execute(sql, { id, newName }, { autoCommit: true });
    });
}

// 3. DELETE – delete one store (composite PK)
async function deleteStoreQuery(storeName, storeAddress) {
    return await withOracleDB(async (connection) => {
        const sql = `
            DELETE FROM STORE
            WHERE Name = :storeName AND Address = :storeAddress
        `;
        return await connection.execute(
            sql,
            { storeName, storeAddress },
            { autoCommit: true }
        );
    });
}

// 4️. SELECTION – example: NutritionTypes with complex WHERE
async function selectIngredientsWithNutrition(fatInMg, sodiumInMg) {
    return await withOracleDB(async (connection) => {
        const sql = `
            SELECT IngredientName, FatInMg, ProteinInMg, CarbohydrateInMg, SodiumInMg, PottasiumInMg
            FROM NUTRITIONTYPES
            WHERE FatInMg > :fatinMg
              AND SodiumInMg = :sodiumInMg
        `;
        const result = await connection.execute(sql, { fatInMg, sodiumInMg });
        return result.rows;
    });
}

// 5️. PROJECTION – select chosen columns from Store
async function projectStoresBasic() {
    return await withOracleDB(async (connection) => {
        const sql = `
            SELECT Name, Address
            FROM Store
        `;
        const result = await connection.execute(sql);
        return result.rows;
    });
}

// 6️. JOIN – donations joined with community service info
async function joinDonationsWithService() {
    return await withOracleDB(async (connection) => {
        const sql = `
            SELECT d.UserEmail,
                   d.IngredientName,
                   d.Quantity,
                   d.Unit,
                   s.ServiceID,
                   s.Name AS ServiceName,
                   s.Address AS ServiceAddress
            FROM DonateTo d
            JOIN CommunityService s ON d.ServiceID = s.ServiceID
        `;
        const result = await connection.execute(sql);
        return result.rows;
    });
}

// 7️. Aggregation with GROUP BY
async function query7() {
    return await withOracleDB(async (connection) => {
        const sql = `
            SELECT ServiceID,
                   COUNT(*) AS DonationCount,
                   SUM(Quantity) AS TotalQuantity
            FROM DonateTo
            GROUP BY ServiceID
            ORDER BY DonationCount DESC
        `;
        const result = await connection.execute(sql);
        return result.rows;
    });
}

// 8️. Aggregation with HAVING
async function query8(threshold) {
    return await withOracleDB(async (connection) => {
        const sql = `
            SELECT IngredientName,
                   SUM(Quantity) AS TotalDonated
            FROM DonateTo
            GROUP BY IngredientName
            HAVING SUM(Quantity) >= :threshold
            ORDER BY TotalDonated DESC
        `;
        const result = await connection.execute(sql, { threshold });
        return result.rows;
    });
}

// 9️. Nested aggregation with GROUP BY
async function query9() {
    return await withOracleDB(async (connection) => {
        const sql = `
            SELECT ServiceID,
                   SUM(Quantity) AS TotalQuantity
            FROM DonateTo
            GROUP BY ServiceID
            HAVING SUM(Quantity) > (
                SELECT AVG(totalq)
                FROM (
                    SELECT SUM(Quantity) AS totalq
                    FROM DonateTo
                    GROUP BY ServiceID
                )
            )
            ORDER BY TotalQuantity DESC
        `;
        const result = await connection.execute(sql);
        return result.rows;
    });
}

// 10. Division – users who have donated to ALL community services
async function query10() {
    return await withOracleDB(async (connection) => {
        const sql = `
            SELECT UserEmail
            FROM DonateTo
            GROUP BY UserEmail
            HAVING COUNT(DISTINCT ServiceID) = (SELECT COUNT(*) FROM CommunityService)
        `;
        const result = await connection.execute(sql);
        return result.rows;
    });
}


// ----------------------------------------------------------
// EXPORT ALL FUNCTIONS
// ----------------------------------------------------------
module.exports = {
    // demo
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable,
    insertDemotable,
    updateNameDemotable,
    countDemotable,

    // extra helpers
    getAllUsers,
    getAllIngredients,
    getAllFoods,
    getAllUtensil,
    getAllRecipes,
    getAllStores,
    getAllCommunityServices,
    getAllAidFacilities,
    getAllHomelessShelter,
    getAllOrphanageFacility,
    getAllNursingHome,
    getAllDonateTo,
    getAllNutritionTypes,
    getAllIngredientNutrition,
    getAllDistributeTo,
    getAllSoldAt,
    getAllSells,
    getAllUses,
    getAllUsedIn,
    getAllFavorites,
    createUser,
    createIngredient,
    createFood,
    createRecipe,
    createUtensil,
    createStore,
    createCommunityService,
    createAidFacility,
    createDonateTo,
    createHomelessShelter,
    createOrphanageFacility,
    createNursingHome,
    createNutritionType,
    createIngredientNutrition,
    createDistributeTo,
    createSoldAt,
    createSells,
    createUses,
    createUsedIn,
    createFavorite,
    updateUserName,
    updateUserAddress,
    updateUserEmail,
    updateCommunityService,
    deleteUser,
    getStoreProjection,
    deleteStore,
    getSelectionNutritionTypes,
    getJoinDonationService,
    deleteNutritionType,
    deleteUtensil,
    deleteIngredient,
    deleteFood,
    deleteRecipe,
    deleteCommunityService,
    deleteDonation,
    checkUserExists,
    // rubric 1–6
    insertDonation,
    updateCommunityAddressQuery,
    deleteStoreQuery,
    selectIngredientsWithNutrition,
    projectStoresBasic,
    joinDonationsWithService,

    // rubric 7–10
    query7,
    query8,
    query9,
    query10
};
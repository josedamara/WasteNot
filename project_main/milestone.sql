-- Drop dependent tables first
DROP TABLE Favorites CASCADE CONSTRAINTS;
DROP TABLE UsedIn CASCADE CONSTRAINTS;
DROP TABLE Uses CASCADE CONSTRAINTS;
DROP TABLE Sells CASCADE CONSTRAINTS;
DROP TABLE SoldAt CASCADE CONSTRAINTS;
DROP TABLE DistributeTo CASCADE CONSTRAINTS;
DROP TABLE DonateTo CASCADE CONSTRAINTS;
DROP TABLE Recipe CASCADE CONSTRAINTS;
DROP TABLE IngredientNutrition CASCADE CONSTRAINTS;
DROP TABLE NutritionTypes CASCADE CONSTRAINTS;
DROP TABLE NursingHome CASCADE CONSTRAINTS;
DROP TABLE OrphanageFacility CASCADE CONSTRAINTS;
DROP TABLE HomelessShelter CASCADE CONSTRAINTS;

-- Drop base / parent tables last
DROP TABLE AidFacility CASCADE CONSTRAINTS;
DROP TABLE CommunityService CASCADE CONSTRAINTS;
DROP TABLE Food CASCADE CONSTRAINTS;
DROP TABLE Ingredient CASCADE CONSTRAINTS;
DROP TABLE Utensil CASCADE CONSTRAINTS;
DROP TABLE Store CASCADE CONSTRAINTS;
DROP TABLE Users CASCADE CONSTRAINTS;


-- 1) Users
CREATE TABLE Users (
    Name    VARCHAR2(50)  NOT NULL,
    Address VARCHAR2(100) NOT NULL,
    Email   VARCHAR2(50),
    PRIMARY KEY (Email)
);

-- 2) Store
CREATE TABLE Store (
    Name    VARCHAR2(50),
    Address VARCHAR2(100),
    Contact VARCHAR2(50)  NOT NULL,
    PRIMARY KEY (Name, Address)
);

-- 3) Utensil
CREATE TABLE Utensil (
    Name          VARCHAR2(50),
    Material      VARCHAR2(30),
    IsSustainable NUMBER(1), -- 0 = FALSE, 1 = TRUE
    PRIMARY KEY (Name, Material)
);

-- 4) Ingredient
CREATE TABLE Ingredient (
    Name      VARCHAR2(50),
    ShelfLife NUMBER,
    PRIMARY KEY (Name)
);

-- 5) Food
CREATE TABLE Food (
    Name        VARCHAR2(50),
    Origin      VARCHAR2(30),
    Description VARCHAR2(200),
    PRIMARY KEY (Name)
);

-- 6) CommunityService
CREATE TABLE CommunityService (
    ServiceID NUMBER,
    Name      VARCHAR2(50) NOT NULL,
    Address   VARCHAR2(100) NOT NULL,
    PRIMARY KEY (ServiceID),
    UNIQUE (Name, Address)  -- optional
);

-- 7) AidFacility (supertype)
CREATE TABLE AidFacility (
    FacilityID NUMBER,
    Name       VARCHAR2(50) NOT NULL,
    Capacity   NUMBER,
    Contact    VARCHAR2(50) NOT NULL,
    Address    VARCHAR2(100) NOT NULL,
    City       VARCHAR2(50),
    PRIMARY KEY (FacilityID),
    UNIQUE (Name, Address)  -- optional
);

-- 8) HomelessShelter (subtype) -- cascade delete on supertype removal
CREATE TABLE HomelessShelter (
    FacilityID NUMBER PRIMARY KEY REFERENCES AidFacility(FacilityID) ON DELETE CASCADE,
    IsRehabilitationProvided NUMBER(1)
);

-- 9) OrphanageFacility (subtype) -- cascade delete on supertype removal
CREATE TABLE OrphanageFacility (
    FacilityID NUMBER PRIMARY KEY REFERENCES AidFacility(FacilityID) ON DELETE CASCADE,
    MinimumAge NUMBER,
    MaximumAge NUMBER,
    IsEducationProvided NUMBER(1),
    NumberOfStaff NUMBER
);

-- 10) NursingHome (subtype) -- cascade delete on supertype removal
CREATE TABLE NursingHome (
    FacilityID NUMBER PRIMARY KEY REFERENCES AidFacility(FacilityID) ON DELETE CASCADE,
    NumberOfDoctors NUMBER,
    NumberOfNurses  NUMBER,
    MinimumAge      NUMBER
);

-- 11) NutritionTypes
-- Deletes when the Ingredient is deleted 
CREATE TABLE NutritionTypes (
    IngredientName VARCHAR2(50) REFERENCES Ingredient(Name) ON DELETE CASCADE, 
    FatInMg        FLOAT,
    ProteinInMg    FLOAT,
    CarbohydrateInMg FLOAT,
    SodiumInMg     FLOAT,
    PotassiumInMg  FLOAT,
    PRIMARY KEY (IngredientName)
);

-- 12) IngredientNutrition
-- Measurement rows dependent on Ingredient; remove if ingredient removed
CREATE TABLE IngredientNutrition (
    IngredientName VARCHAR2(50) REFERENCES Ingredient(Name) ON DELETE CASCADE,
    Quantity       FLOAT,
    Unit           VARCHAR2(10),
    PRIMARY KEY (IngredientName, Quantity, Unit)
);

-- 13) Recipe (weak entity of Food)
-- Deleting Food is restricted (NO ACTION) to protect weak entity relationship with recipes
CREATE TABLE Recipe (
    RecipeID    NUMBER,
    FoodName    VARCHAR2(50) REFERENCES Food(Name), -- ON DELETE NO ACTION  -- (Oracle does not support it),
    Instructions VARCHAR2(500),
    Difficulty  VARCHAR2(20),
    PRIMARY KEY (RecipeID, FoodName)
);

-- 14) DonateTo (ternary: Users × Ingredient × CommunityService)
-- Preserve donation history: NO CASCADE
CREATE TABLE DonateTo (
    UserEmail      VARCHAR2(50) REFERENCES Users(Email),   
        -- ON UPDATE CASCADE, -- (Oracle does not support it).
        -- ON DELETE NO ACTION  -- (Oracle does not support it),
    IngredientName VARCHAR2(50) REFERENCES Ingredient(Name), -- ON DELETE NO ACTION  -- (Oracle does not support it),
    ServiceID      NUMBER REFERENCES CommunityService(ServiceID), -- ON DELETE NO ACTION  -- (Oracle does not support it),
    DonationDate   DATE,
    Quantity       FLOAT,
    Unit           VARCHAR2(20),
    PRIMARY KEY (UserEmail, IngredientName, ServiceID)
);

-- 15) DistributeTo (many-to-many: Service × Facility)
-- Keep records; no DELETE cascade
CREATE TABLE DistributeTo (
    ServiceID  NUMBER REFERENCES CommunityService(ServiceID), -- ON DELETE NO ACTION  -- (Oracle does not support it),
    FacilityID NUMBER REFERENCES AidFacility(FacilityID), -- ON DELETE NO ACTION  -- (Oracle does not support it),
    PRIMARY KEY (ServiceID, FacilityID)
);

-- 16) SoldAt (Ingredient sold at a Store)
CREATE TABLE SoldAt (
    IngredientName VARCHAR2(50) REFERENCES Ingredient(Name), -- ON DELETE NO ACTION  -- (Oracle does not support it),
    StoreName      VARCHAR2(50),
    StoreAddress   VARCHAR2(100),
    Price          FLOAT,
    Availability   NUMBER(1),
    PRIMARY KEY (IngredientName, StoreName, StoreAddress),
    FOREIGN KEY (StoreName, StoreAddress) REFERENCES Store(Name, Address) ON DELETE CASCADE 
        --  ON UPDATE CASCADE -- (Oracle does not support it)
);

-- 17) Sells (Store sells Utensil)
-- If a Store is deleted, remove its Sells rows using DELETE CASCADE
CREATE TABLE Sells (
    StoreName        VARCHAR2(50),
    StoreAddress     VARCHAR2(100),
    UtensilName      VARCHAR2(50),
    UtensilMaterial  VARCHAR2(50),
    PRIMARY KEY (StoreName, StoreAddress, UtensilName, UtensilMaterial),
    FOREIGN KEY (StoreName, StoreAddress) REFERENCES Store(Name, Address) ON DELETE CASCADE,  
        --  ON UPDATE CASCADE, -- (Oracle does not support it)
    FOREIGN KEY (UtensilName, UtensilMaterial) REFERENCES Utensil(Name, Material) -- ON DELETE NO ACTION  -- (Oracle does not support it),
);

-- 18) Uses (Food needs Utensil)
CREATE TABLE Uses (
    FoodName        VARCHAR2(50) REFERENCES Food(Name) ON DELETE CASCADE,
    UtensilName     VARCHAR2(50),
    UtensilMaterial VARCHAR2(50),
    PRIMARY KEY (FoodName, UtensilName, UtensilMaterial),
    FOREIGN KEY (UtensilName, UtensilMaterial) REFERENCES Utensil(Name, Material) -- ON DELETE NO ACTION  -- (Oracle does not support it),
);

-- 19) UsedIn (Ingredient used in Recipe)
-- If Recipe deleted, remove UsedIn rows (dependent on recipe)
-- If Ingredient deleted, keep UsedIn (NO ACTION) to preserve references
CREATE TABLE UsedIn (
    IngredientName VARCHAR2(50) REFERENCES Ingredient(Name), -- ON DELETE NO ACTION  -- (Oracle does not support it),
    RecipeID       NUMBER,
    FoodName       VARCHAR2(50),
    Unit           VARCHAR2(20),
    Quantity       FLOAT,
    PRIMARY KEY (IngredientName, RecipeID, FoodName),
    FOREIGN KEY (RecipeID, FoodName) REFERENCES Recipe(RecipeID, FoodName) ON DELETE CASCADE
);

-- 20) Favorites (Users favorites a Recipe)
-- Remove favorites when user or recipe is removed
CREATE TABLE Favorites (
    UserEmail VARCHAR2(50) REFERENCES Users(Email) ON DELETE CASCADE,
         --  ON UPDATE CASCADE, -- (Oracle does not support it)
    RecipeID  NUMBER,
    FoodName  VARCHAR2(50),
    PRIMARY KEY (UserEmail, RecipeID, FoodName),
    FOREIGN KEY (RecipeID, FoodName) REFERENCES Recipe(RecipeID, FoodName) ON DELETE CASCADE
);


-- Users
INSERT INTO Users(Name, Address, Email) VALUES ('Alice Johnson', '1234 Maple Street, Vancouver', 'alice.johnson@gmail.com');
INSERT INTO Users(Name, Address, Email) VALUES ('Brian Lee', '22 King Edward Ave, Toronto', 'brian.lee@hotmail.com');
INSERT INTO Users(Name, Address, Email) VALUES ('Catherine Smith', '89 Broadway Road, New York', 'catherine.smith@yahoo.com');
INSERT INTO Users(Name, Address, Email) VALUES ('David Kim', '45 Granville St, Vancouver', 'david.kim@gmail.com');
INSERT INTO Users(Name, Address, Email) VALUES ('Emma Brown', '300 Sunset Blvd, Los Angeles', 'emma.brown@outlook.com');
INSERT INTO Users(Name, Address, Email) VALUES ('Extra', '300 Sunset Blvd, Los Angeles', 'extra@mail.com');

-- Store
INSERT INTO Store(Name, Address, Contact) VALUES ('GreenGrocer', '101 Market Street, Seattle', '+12065551234');
INSERT INTO Store(Name, Address, Contact) VALUES ('FreshMart', '505 Granville St, Vancouver', '+16045552345');
INSERT INTO Store(Name, Address, Contact) VALUES ('UrbanEats', '88 Robson St, Vancouver', '+16045559876');
INSERT INTO Store(Name, Address, Contact) VALUES ('DailyHarvest', '77 Queen St, Toronto', '+14165553456');
INSERT INTO Store(Name, Address, Contact) VALUES ('Nature''s Basket', '42 Orchard Rd, San Francisco', '+14155556789');


-- Utensil
INSERT INTO Utensil(Name, Material, IsSustainable) VALUES ('Spoon', 'Stainless Steel', 1);
INSERT INTO Utensil(Name, Material, IsSustainable) VALUES ('Fork', 'Plastic', 0);
INSERT INTO Utensil(Name, Material, IsSustainable) VALUES ('Knife', 'Bamboo', 1);
INSERT INTO Utensil(Name, Material, IsSustainable) VALUES ('Chopsticks', 'Wood', 1);
INSERT INTO Utensil(Name, Material, IsSustainable) VALUES ('Plate', 'Ceramic', 1);


-- Ingredient
INSERT INTO Ingredient(Name, ShelfLife) VALUES ('Spinach', 5);
INSERT INTO Ingredient(Name, ShelfLife) VALUES ('Chicken Breast', 7);
INSERT INTO Ingredient(Name, ShelfLife) VALUES ('Beef', 10);
INSERT INTO Ingredient(Name, ShelfLife) VALUES ('Tomato', 6);
INSERT INTO Ingredient(Name, ShelfLife) VALUES ('Carrot', 12);


-- Food
INSERT INTO Food(Name, Origin, Description) VALUES ('Spaghetti Bolognese', 'Italy', 'A classic pasta dish with minced beef and tomato sauce.');
INSERT INTO Food(Name, Origin, Description) VALUES ('Chicken Stir Fry', 'China', 'Chicken and vegetables quickly fried with soy sauce.');
INSERT INTO Food(Name, Origin, Description) VALUES ('Beef Stew', 'England', 'Slow-cooked beef with carrots and potatoes.');
INSERT INTO Food(Name, Origin, Description) VALUES ('Caesar Salad', 'USA', 'Salad with romaine lettuce, croutons, and Caesar dressing.');
INSERT INTO Food(Name, Origin, Description) VALUES ('Vegetable Soup', 'France', 'A light broth with seasonal vegetables.');

-- CommunityService
INSERT INTO CommunityService(ServiceID, Name, Address) VALUES (1, 'Food for All', '200 Main St, Vancouver');
INSERT INTO CommunityService(ServiceID, Name, Address) VALUES (2, 'Helping Hands', '45 Oak St, Toronto');
INSERT INTO CommunityService(ServiceID, Name, Address) VALUES (3, 'Kind Kitchen', '99 Elm St, Seattle');
INSERT INTO CommunityService(ServiceID, Name, Address) VALUES (4, 'Harvest Aid', '10 Park Ave, New York');
INSERT INTO CommunityService(ServiceID, Name, Address) VALUES (5, 'Meals of Hope', '33 Sunset Rd, Los Angeles');

-- AidFacility
INSERT INTO AidFacility(FacilityID, Name, Capacity, Contact, Address, City) VALUES (1, 'Hope Shelter', 100, '+16045554321', '400 East 5th Ave', 'Vancouver');
INSERT INTO AidFacility(FacilityID, Name, Capacity, Contact, Address, City) VALUES (2, 'Safe Haven', 80, '+14165557890', '55 King St', 'Toronto');
INSERT INTO AidFacility(FacilityID, Name, Capacity, Contact, Address, City) VALUES (3, 'Comfort Home', 60, '+12065556789', '300 Pine St', 'Seattle');
INSERT INTO AidFacility(FacilityID, Name, Capacity, Contact, Address, City) VALUES (4, 'Starlight Orphanage', 120, '+12125559876', '200 Broadway', 'New York');
INSERT INTO AidFacility(FacilityID, Name, Capacity, Contact, Address, City) VALUES (5, 'Sunrise Nursing Home', 90, '+13105556789', '50 Sunset Blvd', 'Los Angeles');

-- HomelessShelter
INSERT INTO HomelessShelter(FacilityID, IsRehabilitationProvided) VALUES (1, 1);
INSERT INTO HomelessShelter(FacilityID, IsRehabilitationProvided) VALUES (2, 0);
INSERT INTO HomelessShelter(FacilityID, IsRehabilitationProvided) VALUES (3, 1);
INSERT INTO HomelessShelter(FacilityID, IsRehabilitationProvided) VALUES (4, 0);
INSERT INTO HomelessShelter(FacilityID, IsRehabilitationProvided) VALUES (5, 1);

-- OrphanageFacility
INSERT INTO OrphanageFacility(FacilityID, MinimumAge, MaximumAge, IsEducationProvided, NumberOfStaff) VALUES (4, 3, 18, 1, 25);
INSERT INTO OrphanageFacility(FacilityID, MinimumAge, MaximumAge, IsEducationProvided, NumberOfStaff) VALUES (5, 2, 17, 1, 30);
INSERT INTO OrphanageFacility(FacilityID, MinimumAge, MaximumAge, IsEducationProvided, NumberOfStaff) VALUES (3, 1, 15, 0, 20);
INSERT INTO OrphanageFacility(FacilityID, MinimumAge, MaximumAge, IsEducationProvided, NumberOfStaff) VALUES (2, 4, 16, 1, 22);
INSERT INTO OrphanageFacility(FacilityID, MinimumAge, MaximumAge, IsEducationProvided, NumberOfStaff) VALUES (1, 5, 18, 1, 18);

-- NursingHome
INSERT INTO NursingHome(FacilityID, NumberOfDoctors, NumberOfNurses, MinimumAge) VALUES (5, 4, 10, 60);
INSERT INTO NursingHome(FacilityID, NumberOfDoctors, NumberOfNurses, MinimumAge) VALUES (4, 3, 8, 65);
INSERT INTO NursingHome(FacilityID, NumberOfDoctors, NumberOfNurses, MinimumAge) VALUES (3, 2, 6, 70);
INSERT INTO NursingHome(FacilityID, NumberOfDoctors, NumberOfNurses, MinimumAge) VALUES (2, 5, 12, 55);
INSERT INTO NursingHome(FacilityID, NumberOfDoctors, NumberOfNurses, MinimumAge) VALUES (1, 4, 9, 60);

-- NutritionTypes
INSERT INTO NutritionTypes(IngredientName, FatInMg, ProteinInMg, CarbohydrateInMg, SodiumInMg, PotassiumInMg) VALUES ('Spinach', 400, 2900, 3600, 80, 560);
INSERT INTO NutritionTypes(IngredientName, FatInMg, ProteinInMg, CarbohydrateInMg, SodiumInMg, PotassiumInMg) VALUES ('Chicken Breast', 3600, 31000, 0, 70, 256);
INSERT INTO NutritionTypes(IngredientName, FatInMg, ProteinInMg, CarbohydrateInMg, SodiumInMg, PotassiumInMg) VALUES ('Beef', 15000, 26000, 0, 75, 318);
INSERT INTO NutritionTypes(IngredientName, FatInMg, ProteinInMg, CarbohydrateInMg, SodiumInMg, PotassiumInMg) VALUES ('Tomato', 200, 900, 3900, 5, 290);
INSERT INTO NutritionTypes(IngredientName, FatInMg, ProteinInMg, CarbohydrateInMg, SodiumInMg, PotassiumInMg) VALUES ('Carrot', 120, 900, 10000, 69, 320);

-- IngredientNutrition
INSERT INTO IngredientNutrition(IngredientName, Quantity, Unit) VALUES ('Spinach', 100, 'g');
INSERT INTO IngredientNutrition(IngredientName, Quantity, Unit) VALUES ('Chicken Breast', 150, 'g');
INSERT INTO IngredientNutrition(IngredientName, Quantity, Unit) VALUES ('Beef', 200, 'g');
INSERT INTO IngredientNutrition(IngredientName, Quantity, Unit) VALUES ('Tomato', 100, 'g');
INSERT INTO IngredientNutrition(IngredientName, Quantity, Unit) VALUES ('Carrot', 80, 'g');

-- Recipe
INSERT INTO Recipe(RecipeID, FoodName, Instructions, Difficulty) VALUES (1, 'Spaghetti Bolognese', 'Boil pasta, cook minced beef with tomato sauce, and mix together.', 'Medium');
INSERT INTO Recipe(RecipeID, FoodName, Instructions, Difficulty) VALUES (2, 'Chicken Stir Fry', 'Fry chicken, add vegetables, and toss with soy sauce.', 'Easy');
INSERT INTO Recipe(RecipeID, FoodName, Instructions, Difficulty) VALUES (3, 'Beef Stew', 'Simmer beef with vegetables and broth for 2 hours.', 'Hard');
INSERT INTO Recipe(RecipeID, FoodName, Instructions, Difficulty) VALUES (4, 'Caesar Salad', 'Combine lettuce, croutons, and dressing, top with cheese.', 'Easy');
INSERT INTO Recipe(RecipeID, FoodName, Instructions, Difficulty) VALUES (5, 'Vegetable Soup', 'Boil chopped vegetables with broth for 30 minutes.', 'Easy');

-- DonateTo
INSERT INTO DonateTo(UserEmail, IngredientName, ServiceID, DonationDate, Quantity, Unit) VALUES ('alice.johnson@gmail.com', 'Spinach', 1, '01-OCT-2025', 2.5, 'kg');
INSERT INTO DonateTo(UserEmail, IngredientName, ServiceID, DonationDate, Quantity, Unit) VALUES ('brian.lee@hotmail.com', 'Chicken Breast', 2, '03-OCT-2025', 3, 'kg');
INSERT INTO DonateTo(UserEmail, IngredientName, ServiceID, DonationDate, Quantity, Unit) VALUES ('catherine.smith@yahoo.com', 'Tomato', 3, '05-OCT-2025', 4, 'kg');
INSERT INTO DonateTo(UserEmail, IngredientName, ServiceID, DonationDate, Quantity, Unit) VALUES ('david.kim@gmail.com', 'Beef', 4, '07-OCT-2025', 2, 'kg');
INSERT INTO DonateTo(UserEmail, IngredientName, ServiceID, DonationDate, Quantity, Unit) VALUES ('emma.brown@outlook.com', 'Carrot', 5, '09-OCT-2025', 5, 'kg');
INSERT INTO DonateTo(UserEmail, IngredientName, ServiceID, DonationDate, Quantity, Unit) VALUES ('extra@mail.com', 'Tomato', 3, '11-OCT-2025', 6, 'kg');

-- DistributeTo
INSERT INTO DistributeTo(ServiceID, FacilityID) VALUES (1, 1);
INSERT INTO DistributeTo(ServiceID, FacilityID) VALUES (2, 2);
INSERT INTO DistributeTo(ServiceID, FacilityID) VALUES (3, 3);
INSERT INTO DistributeTo(ServiceID, FacilityID) VALUES (4, 4);
INSERT INTO DistributeTo(ServiceID, FacilityID) VALUES (5, 5);

-- SoldAt
INSERT INTO SoldAt(IngredientName, StoreName, StoreAddress, Price, Availability) VALUES ('Spinach', 'GreenGrocer', '101 Market Street, Seattle', 3.49, 1);
INSERT INTO SoldAt(IngredientName, StoreName, StoreAddress, Price, Availability) VALUES ('Chicken Breast', 'FreshMart', '505 Granville St, Vancouver', 8.99, 1);
INSERT INTO SoldAt(IngredientName, StoreName, StoreAddress, Price, Availability) VALUES ('Beef', 'UrbanEats', '88 Robson St, Vancouver', 12.50, 1);
INSERT INTO SoldAt(IngredientName, StoreName, StoreAddress, Price, Availability) VALUES ('Tomato', 'DailyHarvest', '77 Queen St, Toronto', 2.20, 1);
INSERT INTO SoldAt(IngredientName, StoreName, StoreAddress, Price, Availability) VALUES ('Carrot', 'Nature''s Basket', '42 Orchard Rd, San Francisco', 2.00, 1);

-- Sells
INSERT INTO Sells(StoreName, StoreAddress, UtensilName, UtensilMaterial) VALUES ('GreenGrocer', '101 Market Street, Seattle', 'Spoon', 'Stainless Steel');
INSERT INTO Sells(StoreName, StoreAddress, UtensilName, UtensilMaterial) VALUES ('FreshMart', '505 Granville St, Vancouver', 'Fork', 'Plastic');
INSERT INTO Sells(StoreName, StoreAddress, UtensilName, UtensilMaterial) VALUES ('UrbanEats', '88 Robson St, Vancouver', 'Knife', 'Bamboo');
INSERT INTO Sells(StoreName, StoreAddress, UtensilName, UtensilMaterial) VALUES ('DailyHarvest', '77 Queen St, Toronto', 'Chopsticks', 'Wood');
INSERT INTO Sells(StoreName, StoreAddress, UtensilName, UtensilMaterial) VALUES ('Nature''s Basket', '42 Orchard Rd, San Francisco', 'Plate', 'Ceramic');

-- Uses
INSERT INTO Uses(FoodName, UtensilName, UtensilMaterial) VALUES ('Spaghetti Bolognese', 'Fork', 'Plastic');
INSERT INTO Uses(FoodName, UtensilName, UtensilMaterial) VALUES ('Chicken Stir Fry', 'Chopsticks', 'Wood');
INSERT INTO Uses(FoodName, UtensilName, UtensilMaterial) VALUES ('Beef Stew', 'Spoon', 'Stainless Steel');
INSERT INTO Uses(FoodName, UtensilName, UtensilMaterial) VALUES ('Caesar Salad', 'Fork', 'Plastic');
INSERT INTO Uses(FoodName, UtensilName, UtensilMaterial) VALUES ('Vegetable Soup', 'Spoon', 'Stainless Steel');

-- UsedIn
INSERT INTO UsedIn(IngredientName, RecipeID, FoodName, Unit, Quantity) VALUES ('Beef', 3, 'Beef Stew', 'g', 300);
INSERT INTO UsedIn(IngredientName, RecipeID, FoodName, Unit, Quantity) VALUES ('Tomato', 1, 'Spaghetti Bolognese', 'g', 200);
INSERT INTO UsedIn(IngredientName, RecipeID, FoodName, Unit, Quantity) VALUES ('Chicken Breast', 2, 'Chicken Stir Fry', 'g', 250);
INSERT INTO UsedIn(IngredientName, RecipeID, FoodName, Unit, Quantity) VALUES ('Spinach', 4, 'Caesar Salad', 'g', 50);
INSERT INTO UsedIn(IngredientName, RecipeID, FoodName, Unit, Quantity) VALUES ('Carrot', 5, 'Vegetable Soup', 'g', 80);

-- Favorites
INSERT INTO Favorites(UserEmail, RecipeID, FoodName) VALUES ('alice.johnson@gmail.com', 1, 'Spaghetti Bolognese');
INSERT INTO Favorites(UserEmail, RecipeID, FoodName) VALUES ('brian.lee@hotmail.com', 2, 'Chicken Stir Fry');
INSERT INTO Favorites(UserEmail, RecipeID, FoodName) VALUES ('catherine.smith@yahoo.com', 3, 'Beef Stew');
INSERT INTO Favorites(UserEmail, RecipeID, FoodName) VALUES ('david.kim@gmail.com', 4, 'Caesar Salad');
INSERT INTO Favorites(UserEmail, RecipeID, FoodName) VALUES ('emma.brown@outlook.com', 5, 'Vegetable Soup');

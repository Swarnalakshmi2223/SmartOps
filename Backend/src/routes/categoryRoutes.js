const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    updateCategoryStatus,
    getActiveCategories
} = require("../controllers/categoryController");


// Get active categories
// Used by User Create Request form
router.get(
    "/active",
    authMiddleware,
    roleMiddleware("user", "staff", "admin"),
    getActiveCategories
);


// Admin creates category
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createCategory
);


// Admin gets all categories
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllCategories
);


// Admin gets category by ID
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getCategoryById
);


// Admin updates category
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateCategory
);


// Admin activates/deactivates category
router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateCategoryStatus
);


module.exports = router;
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    updateCategoryStatus
} = require("../controllers/categoryController");


router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createCategory
);


router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllCategories
);


router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getCategoryById
);


router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateCategory
);


router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateCategoryStatus
);


module.exports = router;
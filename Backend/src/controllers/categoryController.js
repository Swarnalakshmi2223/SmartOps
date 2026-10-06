const Category = require("../models/Category");

// Create Category
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({
            name: name.trim()
        });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        const category = await Category.create({
            name: name.trim(),
            description
        });

        res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create category",
            error: error.message
        });
    }
};


// Get All Categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Categories fetched successfully",
            count: categories.length,
            categories
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch categories",
            error: error.message
        });
    }
};


// Get Category By ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json({
            message: "Category fetched successfully",
            category
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch category",
            error: error.message
        });
    }
};


// Update Category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        if (name) {
            const existingCategory = await Category.findOne({
                name: name.trim(),
                _id: { $ne: id }
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: "Category name already exists"
                });
            }

            category.name = name.trim();
        }

        if (description !== undefined) {
            category.description = description;
        }

        await category.save();

        res.status(200).json({
            message: "Category updated successfully",
            category
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update category",
            error: error.message
        });
    }
};


// Activate / Deactivate Category
const updateCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be true or false"
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        category.isActive = isActive;

        await category.save();

        res.status(200).json({
            message: isActive
                ? "Category activated successfully"
                : "Category deactivated successfully",
            category
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update category status",
            error: error.message
        });
    }
};


module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    updateCategoryStatus
};
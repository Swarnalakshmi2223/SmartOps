const Department = require("../models/Department");

// Create Department
const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Department name is required"
            });
        }

        const existingDepartment = await Department.findOne({
            name: name.trim()
        });

        if (existingDepartment) {
            return res.status(400).json({
                message: "Department already exists"
            });
        }

        const department = await Department.create({
            name: name.trim(),
            description
        });

        res.status(201).json({
            message: "Department created successfully",
            department
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create department",
            error: error.message
        });
    }
};


// Get All Departments
const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Departments fetched successfully",
            count: departments.length,
            departments
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch departments",
            error: error.message
        });
    }
};


// Public registration only needs the names of active departments.
const getActiveDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: { $ne: false } })
            .select("name")
            .sort({ name: 1 });

        return res.status(200).json({
            message: "Active departments fetched successfully",
            departments
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch active departments"
        });
    }
};

// Get Department By ID
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.status(200).json({
            message: "Department fetched successfully",
            department
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch department",
            error: error.message
        });
    }
};


// Update Department
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        if (name) {
            const existingDepartment = await Department.findOne({
                name: name.trim(),
                _id: { $ne: id }
            });

            if (existingDepartment) {
                return res.status(400).json({
                    message: "Department name already exists"
                });
            }

            department.name = name.trim();
        }

        if (description !== undefined) {
            department.description = description;
        }

        await department.save();

        res.status(200).json({
            message: "Department updated successfully",
            department
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update department",
            error: error.message
        });
    }
};


// Activate / Deactivate Department
const updateDepartmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be true or false"
            });
        }

        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        department.isActive = isActive;

        await department.save();

        res.status(200).json({
            message: isActive
                ? "Department activated successfully"
                : "Department deactivated successfully",
            department
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update department status",
            error: error.message
        });
    }
};


module.exports = {
    createDepartment,
    getAllDepartments,
    getActiveDepartments,
    getDepartmentById,
    updateDepartment,
    updateDepartmentStatus
};

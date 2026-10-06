const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const user = require("../models/User");
const createAuditLog = require("../utils/auditLogger");

const getAllUsers = async (req, res) => {
    try{
        const users = await User.find().select("-password");

        res.status(200).json({
            message: "User fetched successfully",
            count: users.length,
            users
        });
    }catch (error) {
        res.status(500).json ({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};


const getUserById = async (req, res) => {
    try {
        const {id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User fetched successfully",
            user
        });
        
    }catch (error) {
        res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
};


const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (!name && !email) {
            return res.status(400).json ({
                message: "Please provide name or eamil to update"
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(400).json({
                   message: "User not found"
            });
        }

        if (name) {
            user.name = name;
        }

        if(email) {
            user.email = email.toLowerCase().trim();
        }

        await user.save();
   

        res.status(200).json({
            message : "User upadted successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error){

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        res. status(500).json({
            message: "Failed to update user",
            error: error.message
        });
    }
};



const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const allowedRoles = ["user", "staff", "admin"];

        if (!allowedRoles.includes(role)){
            return res.status(400).json({
                message: "Invalid role. Allowed roles are user, staff, and admin."
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        const oldRole = user.role; 

        user.role = role;

        await user.save();

        await createAuditLog({
            action: "UPDATE_USER_ROLE",
            user: req.user.id,
            module: "User Management",
            description: `User role changed from ${oldRole} to ${role}`
         });

        res.status(200).json({
            message: "user role updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update user role",
            error: error.message
        });
    }
};


const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be true or false"
            });
        }
       
        const user = await User.findById(id);

        if(!user) {
            return res.status(404).json({
                message: "user not found"
            });
        }
      
        user.isActive = isActive;

        await user.save();

         await createAuditLog({
             user: req.user.id,
             action: isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
             module: "User Management",
             description: isActive
                 ? `User ${user.name} was activated`
                 : `User ${user.name} was deactivated`
         });


        res.status(200).json({
            message: isActive
            ? "user activated successfullly"
            : "user deactivated successfully",

        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        }
      });
    
    }catch (error) {
        res.status(500).json({
            message : "Failed to update user status",
            error: error.message
        });
    }
};


const deleteUser = async (req,res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({
                    message: "Invalid user ID"
                });
        }

        const user = await User.findById(id);

        if(!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const deletedUser = {
            name: user.name,
            email: user.email,
            role: user.role
            };

        await User.findByIdAndDelete(id);

        await createAuditLog({
              user: req.user.id,
              action: "DELETE_USER",
              module: "User Management",
              description: `User ${deletedUser.name} was deleted`
          });
          
        res.status(200).json({
            message: "User deleted successfully"
        });
        
    }catch (error) {
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
};


const getAllStaff = async (req, res) => {
    try {
        const staff = await User.find({
            role: "staff"
        }).select("-password");

        res.status(200).json({
            message: "Staff fetched successfully",
            count: staff.length,
            staff
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch staff",
            error: error.message
        });
    }
};

const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await User.findOne({
            _id: id,
            role: "staff"
        }).select("-password");

        if (!staff) {
            return res.status(404).json({
                message: "Staff member not found"
            });
        }

        res.status(200).json({
            message: "Staff fetched successfully",
            staff
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch staff",
            error: error.message
        });
    }
};


const createStaff = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create staff account
        const staff = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "staff",
            isActive: true
        });

        await staff.save();

        // Do not return password
        const staffResponse = staff.toObject();
        delete staffResponse.password;

        res.status(201).json({
            message: "Staff created successfully",
            staff: staffResponse
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create staff",
            error: error.message
        });
    }
};


const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const staff = await User.findOne({
            _id: id,
            role: "staff"
        });

        if (!staff) {
            return res.status(404).json({
                message: "Staff member not found"
            });
        }

        if (name) {
            staff.name = name;
        }

        if (email) {
            const existingUser = await User.findOne({
                email: email.toLowerCase(),
                _id: { $ne: id }
            });

            if (existingUser) {
                return res.status(400).json({
                    message: "Email already registered"
                });
            }

            staff.email = email.toLowerCase();
        }

        await staff.save();

        const staffResponse = staff.toObject();
        delete staffResponse.password;

        res.status(200).json({
            message: "Staff updated successfully",
            staff: staffResponse
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update staff",
            error: error.message
        });
    }
};
const updateStaffStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be true or false"
            });
        }

        const staff = await User.findOne({
            _id: id,
            role: "staff"
        });

        if (!staff) {
            return res.status(404).json({
                message: "Staff member not found"
            });
        }

        staff.isActive = isActive;

        await staff.save();

        const staffResponse = staff.toObject();
        delete staffResponse.password;

        res.status(200).json({
            message: isActive
                ? "Staff activated successfully"
                : "Staff deactivated successfully",
            staff: staffResponse
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update staff status",
            error: error.message
        });
    }
};




module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    updateStaffStatus
};
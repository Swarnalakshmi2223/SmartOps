const mongoose = require("mongoose");
const User = require("../models/User");

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

        user.role = role;

        await user.save();

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

        await User.findByIdAndDelete(id);

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


module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserRole,
    updateUserStatus,
    deleteUser
};
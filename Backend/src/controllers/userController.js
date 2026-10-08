const mongoose = require("mongoose");
const User = require("../models/User");
const Department = require("../models/Department");
const bcrypt = require("bcryptjs");
const user = require("../models/User");
const createAuditLog = require("../utils/auditLogger");

const isStrongPassword = (password) => (
    typeof password === "string" &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
);

const isValidEmail = (email) => (
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
);

const isValidPhone = (phone) => (
    !phone || /^[+()\-\s\d]{7,20}$/.test(phone)
);

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
        const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
        const department = typeof req.body.department === "string" ? req.body.department.trim() : "";
        const { password, confirmPassword } = req.body;

        // Validate required fields
        if (!name || !email || !password || !department) {
            return res.status(400).json({
                message: "Name, email, password, and department are required"
            });
        }

        if (name.length < 2 || name.length > 100 || !isValidEmail(email)) {
            return res.status(400).json({
                message: "A valid name and email are required"
            });
        }

        if (confirmPassword !== undefined && password !== confirmPassword) {
            return res.status(400).json({
                message: "Password and confirmation do not match"
            });
        }

        if (!isValidPhone(phone)) {
            return res.status(400).json({
                message: "Please provide a valid phone number"
            });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            });
        }

        const activeDepartment = await Department.findOne({
            name: department,
            isActive: { $ne: false }
        });

        if (!activeDepartment) {
            return res.status(400).json({
                message: "Please select an active department"
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
            email,
            phone: phone || null,
            department,
            password: hashedPassword,
            role: "staff",
            isActive: true
        });

        await staff.save();

        // Do not return password
        const staffResponse = staff.toObject();
        delete staffResponse.password;

        await createAuditLog({
            user: req.user.id,
            action: "CREATE_STAFF",
            module: "User Management",
            description: `Staff member ${staff.name} was created`
        });

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
        const { name, email, phone, department } = req.body;

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

        if (phone !== undefined) {
            if (!isValidPhone(phone)) {
                return res.status(400).json({
                    message: "Please provide a valid phone number"
                });
            }
            staff.phone = String(phone).trim();
        }

        if (department !== undefined) {
            const activeDepartment = await Department.findOne({
                name: String(department).trim(),
                isActive: { $ne: false }
            });

            if (!activeDepartment) {
                return res.status(400).json({
                    message: "Please select an active department"
                });
            }
            staff.department = activeDepartment.name;
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



const updateMyProfile = async (req, res) => {
    try {
        const { name, email, phone, department } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name) {
            user.name = name;
        }

        if (email) {
            user.email = email.toLowerCase().trim();
        }

        if (phone !== undefined) {
            user.phone = phone;
        }

        if (department !== undefined) {
            user.department = department;
        }

        await user.save();

        await createAuditLog({
            user: req.user.id,
            action: "UPDATE_PROFILE",
            module: "Profile",
            description: `${user.name} updated their own profile`
        });

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                department: user.department
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
};


const changeMyPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        if (
            typeof newPassword !== "string" ||
            newPassword.length < 8 ||
            !/[a-z]/.test(newPassword) ||
            !/[A-Z]/.test(newPassword) ||
            !/\d/.test(newPassword) ||
            !/[^A-Za-z0-9]/.test(newPassword)
        ) {
            return res.status(400).json({
                message: "New password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        await createAuditLog({
            user: req.user.id,
            action: "CHANGE_PASSWORD",
            module: "Profile",
            description: `${user.name} changed their password`
        });

        res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to change password"
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
    updateStaffStatus,
    updateMyProfile,
    changeMyPassword
};

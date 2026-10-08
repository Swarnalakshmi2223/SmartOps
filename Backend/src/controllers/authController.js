const User = require("../models/User");
const Department = require("../models/Department");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

const normalizePhone = (phone) => (
    typeof phone === "string" ? phone.trim() : ""
);

const isValidPhone = (phone) => (
    !phone || /^[+()\-\s\d]{7,20}$/.test(phone)
);

const registerUser = async (req,res) => {
    try{
        const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const phone = normalizePhone(req.body.phone);
        const department = typeof req.body.department === "string"
            ? req.body.department.trim()
            : "";
        const { password } = req.body;

        if (!name || name.length < 2 || name.length > 100 || !isValidEmail(email)) {
            return res.status(400).json({ message: "A valid name and email are required" });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            });
        }

        if (!isValidPhone(phone)) {
            return res.status(400).json({
                message: "Please provide a valid phone number"
            });
        }

        if (department) {
            const activeDepartment = await Department.findOne({
                name: department,
                isActive: { $ne: false }
            });

            if (!activeDepartment) {
                return res.status(400).json({
                    message: "Please select an active department"
                });
            }
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || null,
            department: department || null,
            role: "user",
            isActive: true
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                department: user.department,
                id: user._id
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed"
        });
    }
};



const loginUser = async (req, res) => {
    try {
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been deactivated"
            })
        }

    const isPasswordMatch = await bcrypt.compare( 
        password,
        user.password
    );

    if (!isPasswordMatch) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });

    } catch (error) {
    res.status(500).json({
        message: "Login failed"
    });
}

};

module.exports = {
    registerUser,
    loginUser
};

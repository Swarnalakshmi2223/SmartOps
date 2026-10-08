const express = require("express");
const rateLimit = require("express-rate-limit");

const { 
    registerUser,
    loginUser
 } = require("../controllers/authController");

const router = express.Router();

const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many authentication attempts. Please try again later." }
});

router.post("/register", authRateLimit, registerUser);
router.post("/login", authRateLimit, loginUser);

module.exports = router;

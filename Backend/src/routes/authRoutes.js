const express = require("express");
const rateLimit = require("express-rate-limit");

const { 
    registerUser,
    loginUser
 } = require("../controllers/authController");

const router = express.Router();

const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Please try again later." }
});

const registerRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many registration attempts. Please try again later." }
});

router.post("/register", registerRateLimit, registerUser);
router.post("/login", loginRateLimit, loginUser);

module.exports = router;

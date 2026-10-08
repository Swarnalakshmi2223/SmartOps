const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/protected", authMiddleware, roleMiddleware("admin"), (req, res) => {
    res.status(200).json({
        message: "You have a protected route",
        user: req.user
    });
});

router.get("/user", authMiddleware, roleMiddleware("admin"),(req, res) =>{
    res.status(200).json({
        message: "Welcom User.You have user access.",
        uesr: req.user
    });
});

router.get("/staff", authMiddleware, roleMiddleware("admin"),(req, res) => {
    res.status(200).json({
        message: "Welcome Staff. You have Staff access.",
        user: req.user
    });
});

router.get("/admin", authMiddleware, roleMiddleware("admin"),(req,res) => {
    res.status(200).json({
        message: "Welcome Admin.You have admin access.",
        user: req.user
    });
});

module.exports = router;

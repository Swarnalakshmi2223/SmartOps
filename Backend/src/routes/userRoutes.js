const express = require("express");

const {
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
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authMiddleware,
                roleMiddleware("admin"),
                getAllUsers
);

router.get("/staff", authMiddleware,
                    roleMiddleware("admin"),
                    getAllStaff
);

router.post("/staff", authMiddleware,
                    roleMiddleware("admin"),
                    createStaff
);

router.get("/staff/:id", authMiddleware,
                    roleMiddleware("admin"),
                    getStaffById
);

router.put("/staff/:id", authMiddleware,
                    roleMiddleware("admin"),
                    updateStaff
);

router.patch("/staff/:id/status", authMiddleware,
                     roleMiddleware("admin"),
                     updateStaffStatus
);

// Self-service profile and password routes must be declared before /:id
// so they cannot be interpreted as administrator user-management routes.
router.put("/profile", authMiddleware, updateMyProfile);

router.patch("/password", authMiddleware, changeMyPassword);

router.get("/:id", authMiddleware,
                 roleMiddleware("admin"),
                 getUserById
);
router.put("/:id", authMiddleware,
                    roleMiddleware("admin"),
                    updateUser
);

router.put("/:id/role", authMiddleware,
                    roleMiddleware("admin"),
                    updateUserRole
);

router.patch("/:id/status", authMiddleware,
                    roleMiddleware("admin"),
                    updateUserStatus
);

router.delete("/:id",authMiddleware,
                     roleMiddleware("admin"),
                     deleteUser
);

module.exports = router;

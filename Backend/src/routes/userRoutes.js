const express = require("express");

const {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserRole,
    updateUserStatus,
    deleteUser
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authMiddleware,
                roleMiddleware("admin"),
                getAllUsers
);

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
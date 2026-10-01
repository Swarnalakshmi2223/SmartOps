const express = require("express");


const { 
    createRequest,
    getMyRequests,
    getRequestById,
    updateRequest,
    updateRequestStatus,
    getAllRequests,
    assignRequest,
    getAssignedRequests
 } = require("../controllers/requestController");


const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware,
                 roleMiddleware("user"),
                 createRequest);

router.get("/my",authMiddleware,
                 roleMiddleware("user"),
                 getMyRequests);

router.get("/assigned", authMiddleware,
                    roleMiddleware("staff"),
                    getAssignedRequests);

router.get("/:id", authMiddleware,
                    roleMiddleware("user"),
                    getRequestById);

router.put("/:id", authMiddleware,
                     roleMiddleware("user"),
                     updateRequest);

router.patch("/:id/status", authMiddleware,
                        updateRequestStatus);

router.get("/", authMiddleware,
                   roleMiddleware("admin"),
                   getAllRequests);

router.patch("/:id/assign", authMiddleware,
                      roleMiddleware("admin"),
                      assignRequest);



module.exports = router;
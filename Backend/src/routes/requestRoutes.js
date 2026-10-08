const express = require("express");
const fs = require("fs");


const { 
    createRequest,
    getMyRequests,
    getRequestById,
    getRequestAttachment,
    getResolutionEvidence,
    updateRequest,
    updateRequestStatus,
    getAllRequests,
    assignRequest,
    getAssignedRequests,
    startRequest,
    resolveRequest,
    closeRequest,
    searchRequests,
    addComment,
    getComments
 } = require("../controllers/requestController");


const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const handleRequestUpload = (req, res, next) => {
    upload.single("attachment")(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                message: error.code === "LIMIT_FILE_SIZE"
                    ? "Attachment must be 5 MB or smaller"
                    : "Invalid attachment"
            });
        }

        if (req.file && req.file.size === 0) {
            fs.unlink(req.file.path, () => {});

            return res.status(400).json({
                message: "Attachment cannot be empty"
            });
        }

        next();
    });
};

router.post("/", authMiddleware,
                 roleMiddleware("user"),
                handleRequestUpload,
                 createRequest);

router.get("/search", authMiddleware, 
                      roleMiddleware("admin"), 
                      searchRequests);



router.get("/my",authMiddleware,
                 roleMiddleware("user"),
                 getMyRequests);

router.post("/:id/comments",authMiddleware,
                            addComment);

router.get("/:id/comments",authMiddleware,
                            getComments);

router.get("/:id/attachment", authMiddleware,
                              roleMiddleware("user", "staff", "admin"),
                              getRequestAttachment);

router.get("/:id/evidence", authMiddleware,
                              roleMiddleware("user", "staff", "admin"),
                              getResolutionEvidence);

// Keep static paths before /:id so "assigned" cannot be treated as a request id.
router.get("/assigned", authMiddleware,
                    roleMiddleware("staff"),
                    getAssignedRequests);

router.get("/:id", authMiddleware,
                    roleMiddleware("user", "staff", "admin"),
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

router.patch("/:id/start", authMiddleware,
                        roleMiddleware("staff"),
                        startRequest);

router.patch("/:id/resolve", authMiddleware,
                        roleMiddleware("staff"),
                        resolveRequest);

router.patch("/:id/close", authMiddleware,
                        roleMiddleware("user"),
                        closeRequest);

module.exports = router;

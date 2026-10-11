const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");

// Upload directory
const uploadDirectory = path.join(__dirname, "../../uploads");

// Create uploads folder if it does not exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if (!allowedExtensionsByMimeType[file.mimetype]?.includes(extension)) {
            return cb(new Error("Invalid attachment filename"));
        }

        const uniqueName = `${Date.now()}-${crypto.randomBytes(16).toString("hex")}${extension}`;

        cb(null, uniqueName);
    }
});

// Allowed file types
const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const allowedExtensionsByMimeType = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
};

// File validation
const fileFilter = (req, file, cb) => {
    if (
        allowedMimeTypes.has(file.mimetype) &&
        allowedExtensionsByMimeType[file.mimetype]?.includes(
            path.extname(file.originalname).toLowerCase()
        )
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, PNG, WEBP, PDF, DOC, and DOCX files are allowed"
            ),
            false
        );
    }
};

// Upload configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;

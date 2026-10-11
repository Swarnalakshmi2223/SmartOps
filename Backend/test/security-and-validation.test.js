const express = require("express");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = "test-only-secret-that-is-at-least-32-characters";

const { isValidEmail } = require("../src/utils/validation");
const authMiddleware = require("../src/middleware/authMiddleware");
const roleMiddleware = require("../src/middleware/roleMiddleware");
const upload = require("../src/middleware/uploadMiddleware");
const User = require("../src/models/User");

const response = () => {
    const result = {};
    return {
        result,
        status(code) {
            result.status = code;
            return this;
        },
        json(payload) {
            result.body = payload;
            return this;
        }
    };
};

describe("validation and authorization boundaries", () => {
    it("accepts bounded valid email values and rejects malformed or oversized values", () => {
        expect(isValidEmail("employee@example.com")).toBe(true);
        expect(isValidEmail("employee..name@example.com")).toBe(false);
        expect(isValidEmail("employee@example")).toBe(false);
        expect(isValidEmail("a".repeat(255) + "@example.com")).toBe(false);
    });

    it("rejects missing, malformed, expired, and inactive sessions", async () => {
        const missing = response();
        await authMiddleware({ headers: {} }, missing, () => {});
        expect(missing.result.status).toBe(401);

        const malformed = response();
        await authMiddleware({ headers: { authorization: "Basic token" } }, malformed, () => {});
        expect(malformed.result.status).toBe(401);

        const expiredToken = jwt.sign({ id: "507f1f77bcf86cd799439011" }, process.env.JWT_SECRET, { expiresIn: -1 });
        const expired = response();
        await authMiddleware({ headers: { authorization: `Bearer ${expiredToken}` } }, expired, () => {});
        expect(expired.result.status).toBe(401);

        const originalFindById = User.findById;
        User.findById = () => ({
            select: async () => ({ _id: "inactive-id", role: "user", isActive: false })
        });
        const inactiveToken = jwt.sign({ id: "inactive-id" }, process.env.JWT_SECRET);
        const inactive = response();
        await authMiddleware({ headers: { authorization: `Bearer ${inactiveToken}` } }, inactive, () => {});
        User.findById = originalFindById;
        expect(inactive.result.status).toBe(401);
    });

    it("enforces role permissions and requires authenticated context", () => {
        const unauthenticated = response();
        roleMiddleware("admin")({}, unauthenticated, () => {});
        expect(unauthenticated.result.status).toBe(401);

        const denied = response();
        roleMiddleware("admin")({ user: { role: "user" } }, denied, () => {});
        expect(denied.result.status).toBe(403);

        let called = false;
        roleMiddleware("admin")({ user: { role: "admin" } }, response(), () => { called = true; });
        expect(called).toBe(true);
    });
});

describe("attachment validation", () => {
    const tempFile = path.join(os.tmpdir(), "smartops-test-attachment.txt");
    const oversizedFile = path.join(os.tmpdir(), "smartops-test-oversized.pdf");

    beforeAll(() => {
        fs.writeFileSync(tempFile, "not an allowed attachment");
        fs.writeFileSync(oversizedFile, Buffer.alloc(5 * 1024 * 1024 + 1));
    });
    afterAll(() => {
        fs.rmSync(tempFile, { force: true });
        fs.rmSync(oversizedFile, { force: true });
    });

    it("rejects disallowed attachment types before controller code runs", async () => {
        const app = express();
        app.post("/upload", (req, res) => {
            upload.single("attachment")(req, res, (error) => {
                res.status(error ? 400 : 200).json({ message: error?.message || "accepted" });
            });
        });

        const result = await request(app).post("/upload").attach("attachment", tempFile);
        expect(result.status).toBe(400);
        expect(result.body.message).toMatch(/allowed|invalid/i);
    });

    it("rejects attachments above the configured size limit", async () => {
        const app = express();
        app.post("/upload", (req, res) => {
            upload.single("attachment")(req, res, (error) => {
                res.status(error ? 400 : 200).json({ message: error?.message || "accepted" });
            });
        });

        const result = await request(app).post("/upload").attach("attachment", oversizedFile);
        expect(result.status).toBe(400);
        expect(result.body.message).toMatch(/size|large|limit/i);
    });
});

const { createRequest } = require("../src/controllers/requestController");
const { reviewAISuggestion } = require("../src/controllers/aiReviewController");
const { updateRequestStatus, assignRequest } = require("../src/controllers/requestController");
const Request = require("../src/models/Request");
const User = require("../src/models/User");
const notificationController = require("../src/controllers/notificationController");

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

describe("controller input validation", () => {
    it("rejects incomplete request creation before database or external services", async () => {
        const res = response();
        await createRequest({ body: {}, headers: {}, user: { id: "user-id" } }, res);
        expect(res.result.status).toBe(400);
        expect(res.result.body.message).toMatch(/required/i);
    });

    it("rejects invalid AI actions and request identifiers", async () => {
        const res = response();
        await reviewAISuggestion(
            { params: { requestId: "not-an-object-id" }, body: { action: "delete" }, user: { id: "admin-id" } },
            res
        );
        expect(res.result.status).toBe(400);
        expect(res.result.body.message).toMatch(/invalid request id/i);
    });

    it("rejects an invalid status transition before changing the request", async () => {
        const originalFindById = Request.findById;
        const save = vi.fn();
        Request.findById = async () => ({ status: "Pending", save });

        const res = response();
        await updateRequestStatus(
            { params: { id: "request-id" }, body: { status: "Resolved" }, user: { id: "staff-id", role: "staff" } },
            res
        );
        Request.findById = originalFindById;

        expect(res.result.status).toBe(400);
        expect(save).not.toHaveBeenCalled();
        expect(res.result.body.message).toMatch(/invalid status transition/i);
    });

    it("denies a staff member who is not assigned to the request", async () => {
        const originalFindById = Request.findById;
        const save = vi.fn();
        Request.findById = async () => ({
            status: "Assigned",
            assignedTo: { toString: () => "another-staff" },
            save
        });

        const res = response();
        await updateRequestStatus(
            { params: { id: "request-id" }, body: { status: "In Progress" }, user: { id: "staff-id", role: "staff" } },
            res
        );
        Request.findById = originalFindById;

        expect(res.result.status).toBe(403);
        expect(save).not.toHaveBeenCalled();
    });

    it("requires a staff identifier before attempting assignment", async () => {
        const res = response();
        await assignRequest({ params: { id: "request-id" }, body: {}, user: { id: "admin-id" } }, res);
        expect(res.result.status).toBe(400);
        expect(res.result.body.message).toMatch(/staffId is required/i);
    });

    it("rejects incomplete manual notifications", async () => {
        const res = response();
        await notificationController.createNotification({ body: { title: "Missing recipient" } }, res);
        expect(res.result.status).toBe(400);
        expect(res.result.body.message).toMatch(/required/i);
    });
});

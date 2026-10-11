const { sendEmail } = require("../src/services/emailService");

describe("email failure handling", () => {
    it("returns a safe failure result without throwing or exposing credentials", async () => {
        const sendMail = vi.fn().mockRejectedValue({
            code: "ESOCKET",
            message: "SMTP password=secret for employee@example.com was rejected"
        });

        const result = await sendEmail({
            to: "employee@example.com",
            subject: "Test",
            text: "Test",
            html: "<p>Test</p>"
        }, { sendMail });

        expect(result).toEqual({ success: false, errorCode: "ESOCKET" });
        expect(sendMail).toHaveBeenCalledTimes(1);
    });
});

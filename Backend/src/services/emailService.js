const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

const sanitizeErrorMessage = (error) => String(
    error?.message || "Email operation failed"
)
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[redacted-email]")
    .replace(/(pass(word)?\s*[=:]\s*)[^\s]+/gi, "$1[redacted]");

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject,
            text,
            html
        });

        console.log("Email accepted by SMTP transport:", {
            messageId: info.messageId,
            recipientDomain: String(to).split("@")[1] || "unknown"
        });

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error("Email sending failed:", {
            code: error.code || "UNKNOWN",
            responseCode: error.responseCode || null,
            message: sanitizeErrorMessage(error)
        });

        return {
            success: false,
            errorCode: error.code || "EMAIL_SEND_FAILED"
        };
    }
};

const verifyEmailConnection = async () => {
    try {
        await transporter.verify();

        console.log("Email service connected successfully");

        return true;
    } catch (error) {
        console.error("Email service connection failed:", {
            code: error.code || "UNKNOWN",
            responseCode: error.responseCode || null,
            message: sanitizeErrorMessage(error)
        });

        return false;
    }
};

module.exports = {
    sendEmail,
    verifyEmailConnection
};

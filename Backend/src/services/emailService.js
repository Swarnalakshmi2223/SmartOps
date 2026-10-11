const nodemailer = require("nodemailer");
require("dotenv").config();

const secureMailTransport = process.env.MAIL_SECURE !== "false";

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || "gmail",
    secure: secureMailTransport,
    requireTLS: true,
    tls: {
        rejectUnauthorized: true
    },
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

const sanitizeErrorMessage = (error) => String(
    error?.message || "Email operation failed"
)
    .split(/\s+/)
    .map((token) => token.includes("@") && token.includes(".")
        ? "[redacted-email]"
        : token)
    .join(" ")
    .replace(/(pass(word)?\s*[=:]\s*)[^\s]+/gi, "$1[redacted]");

const sendEmail = async ({ to, subject, text, html }, mailTransport = transporter) => {
    try {
        const info = await mailTransport.sendMail({
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

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject,
            text,
            html
        });

        console.log("Email sent successfully:", info.messageId);

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error("Email sending failed:", error.message);

        return {
            success: false,
            error: error.message
        };
    }
};

const verifyEmailConnection = async () => {
    try {
        await transporter.verify();

        console.log("Email service connected successfully");

        return true;
    } catch (error) {
        console.error("Email service connection failed:", error.message);

        return false;
    }
};

module.exports = {
    sendEmail,
    verifyEmailConnection
};
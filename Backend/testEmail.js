const {
    sendEmail,
    verifyEmailConnection
} = require("./src/services/emailService");

const testEmail = async () => {
    console.log("Checking email connection...");

    const connected = await verifyEmailConnection();

    if (!connected) {
        console.log("Email connection failed.");
        process.exit(1);
    }

    console.log("Sending test email...");

    const result = await sendEmail({
        to: "YOUR_RECEIVING_EMAIL@gmail.com",
        subject: "SmartOps Nodemailer Test",
        text: "This is a test email from the SmartOps backend.",
        html: `
            <h2>SmartOps Email Test</h2>
            <p>This email was sent successfully using Nodemailer.</p>
            <p>Your SmartOps email service is working.</p>
        `
    });

    if (result.success) {
        console.log("Test email sent successfully.");
    } else {
        console.log("Test email failed:", result.error);
    }

    process.exit(0);
};

testEmail();
// 1. Install the latest version: npm install @getbrevo/brevo
const { BrevoClient } = require('@getbrevo/brevo');
const dbgr = require("debug")("development:Auth")
const config = require('config');
require('dotenv').config();

let key = process.env.BREVO_API_KEY;
if (!key) {
    try {
        key = config.get('BREVO_API_KEY');
    } catch(e) {
        dbgr("Warning: BREVO_API_KEY not found in env or config");
        key = "DUMMY_KEY"; // prevent fatal crash during boot if mail isn't completely configured
    }
}
dbgr(key ? "API Key Loaded" : "API Key Missing");


const sendEmail = async (to, subject, content) => {
    try {
        if (process.env.NODE_ENV === 'test') {
            dbgr("Test Environment: Email sending skipped.");
            dbgr(`Subject: ${subject}, To: ${to}`);
            return { messageId: "test-email-id" };
        }

        const client = new BrevoClient({
            apiKey: key,
        });

        const result = await client.transactionalEmails.sendTransacEmail({
            sender: {
                name: 'DevTinder',
                email: 'razergaming1828@gmail.com'
            },
            to: [{ email: to }],
            subject: subject,
            htmlContent: `<html><body>${content}</body></html>`,
        });

        return result;
    } catch (error) {
        dbgr("Brevo Email Error:", error);
        throw error;
    }
};

module.exports = { sendEmail };
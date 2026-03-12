// 1. Install the latest version: npm install @getbrevo/brevo
const { BrevoClient } = require('@getbrevo/brevo');
const dbgr = require("debug")("development:Auth")
const config = require('config');

const key = config.get('BREVO_API_KEY')
dbgr(key)


const sendEmail = async (to, subject, content) => {
    try {
        // Initialize the new Unified Client
        const client = new BrevoClient({
            apiKey: config.get('BREVO_API_KEY') || process.env.BREVO_API_KEY,
        });


        const result = await client.transactionalEmails.sendTransacEmail({
            sender: {
                name: 'DevTinder',
                email: 'razergaming1828@gmail.com' // Must be your verified sender
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
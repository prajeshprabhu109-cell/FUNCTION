// This code runs securely on Netlify's serverless function.
// It uses the secret RETELL_API_KEY from your Netlify Environment Variables.

const Retell = require('retell-sdk');

// Netlify automatically injects environment variables into process.env
const RETELL_API_KEY = process.env.RETELL_API_KEY;

const retellClient = new Retell({ apiKey: RETELL_API_KEY });

// The main handler for the Netlify Function
exports.handler = async (event) => {
    // Ensure this function is called using the POST method from your website
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Parse the data sent from your website's button click
    const body = JSON.parse(event.body);
    const agent_id = body.agent_id; // Your Retell Agent ID

    if (!RETELL_API_KEY || !agent_id) {
        // Log error on Netlify side, send generic error back to user
        console.error("Missing credentials for call creation.");
        return { statusCode: 500, body: "Error: Service configuration missing." };
    }

    try {
        // 1. Call the Retell API securely from the server to create a Web Call
        const webCallResponse = await retellClient.call.createWebCall({
            agent_id: agent_id,
        });

        // 2. Return the temporary access token to the user's browser
        return {
            statusCode: 200,
            body: JSON.stringify({ access_token: webCallResponse.access_token }),
            headers: {
                'Content-Type': 'application/json',
                // This header is essential for Netlify Functions to allow your website domain to access the API.
                'Access-Control-Allow-Origin': '*'
            }
        };

    } catch (error) {
        console.error("Retell API Error:", error);
        return { statusCode: 500, body: "Error initiating call session." };
    }
};
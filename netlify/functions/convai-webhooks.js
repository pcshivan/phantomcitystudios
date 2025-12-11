// netlify/functions/convai-webhook.js
const crypto = require("crypto");
const fetch = require("node-fetch");

const CONVAI_API_KEY = process.env.CONVAI_API_KEY;
const ELEVENLABS_WEBHOOK_SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET; // HMAC secret from ElevenLabs

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Verify signature header name — ElevenLabs dashboard usually specifies the header.
    // Common header used above examples: 'x-elevenlabs-signature' (lowercase)
    const signatureHeaderName = "x-elevenlabs-signature";
    const receivedSig = event.headers[signatureHeaderName] || event.headers[signatureHeaderName.toUpperCase()];

    if (!receivedSig || !ELEVENLABS_WEBHOOK_SECRET) {
      console.warn("Missing signature or secret");
      return { statusCode: 401, body: "Unauthorized" };
    }

    // Compute HMAC-SHA256 of raw body
    const computed = crypto
      .createHmac("sha256", ELEVENLABS_WEBHOOK_SECRET)
      .update(event.body)
      .digest("hex");

    if (computed !== receivedSig) {
      console.warn("Signature mismatch", { computed, receivedSig });
      return { statusCode: 401, body: "Invalid signature" };
    }

    const payload = JSON.parse(event.body);

    // Only handle message.created for now
    if (!payload || payload.type !== "message.created") {
      return { statusCode: 200, body: "ignored" };
    }

    const message = payload.data?.message?.text || "";
    const conversation_id = payload.data?.message?.conversation_id;
    const user = payload.data?.user || {};

    // Simple SalesAgent example
    let reply = "Thanks for reaching out — could you share timeline and approximate budget?";
    const lcase = message.toLowerCase();
    if (lcase.includes("video") || lcase.includes("campaign") || lcase.includes("hero")) {
      reply = "Exciting — we can draft a scoped proposal and schedule a 30-minute discovery call. Do you prefer morning or afternoon IST?";
    }

    // Send reply via ElevenLabs/Convai API — update the URL if their API differs
    const sendResp = await fetch("https://api.elevenlabs.io/v1/convai/conversations/reply", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONVAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversation_id,
        agent_id: "agent_2301kc76g76pfjgbegec73hb9m58", // your agent id
        text: reply
      })
    });

    if (!sendResp.ok) {
      const errText = await sendResp.text();
      console.error("Error sending reply to Convai:", sendResp.status, errText);
    }

    return { statusCode: 200, body: "ok" };
  } catch (err) {
    console.error("Webhook handler error", err);
    return { statusCode: 500, body: "Server error" };
  }
};

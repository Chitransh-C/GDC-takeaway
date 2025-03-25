import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // ✅ Parse incoming request body
        const { orderId, customerPhone } = await req.json();

        // ✅ Load Twilio credentials from Vercel Environment Variables
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const TWILIO_PHONE = process.env.TWILIO_PHONE;

        // ✅ Validate if credentials exist
        if (!accountSid || !authToken || !TWILIO_PHONE) {
            return NextResponse.json({ error: "Missing Twilio credentials" }, { status: 500 });
        }

        // ✅ Format the message
        const message = `Your order (${orderId}) has been placed successfully!`;

        // ✅ Twilio API Endpoint
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        // ✅ Encode credentials for authentication (Replace `btoa` with Buffer)
        const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;

        // ✅ Format request data
        const formData = new URLSearchParams();
        formData.append("From", TWILIO_PHONE);
        formData.append("To", `whatsapp:${customerPhone}`);
        formData.append("Body", message);

        // ✅ Send request to Twilio API
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        // ✅ Handle Twilio API Response
        const result = await response.json();
        if (response.ok) {
            return NextResponse.json({ success: "WhatsApp message sent!" }, { status: 200 });
        } else {
            return NextResponse.json({ error: result.message || "Failed to send message" }, { status: 500 });
        }
    } catch (error) {
        console.error("❌ Error in API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

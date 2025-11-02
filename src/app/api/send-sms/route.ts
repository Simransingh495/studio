// This is a Next.js API Route, which runs on the server.
// It is a secure place to handle secrets like API keys.
import 'dotenv/config';
import {NextRequest, NextResponse} from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const {to, message} = await req.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      const errorMessage =
        'SMS service is not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to the .env file.';
      console.error(errorMessage);
      return NextResponse.json(
        {success: false, error: errorMessage},
        {status: 500}
      );
    }

    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: message,
      from: fromNumber,
      to: to, // The recipient's phone number
    });

    return NextResponse.json({success: true});
  } catch (error: any) {
    console.error('Failed to send SMS:', error.message);
    return NextResponse.json(
      {success: false, error: `Failed to send message: ${error.message}`},
      {status: 500}
    );
  }
}


import { NextResponse } from 'next/server';
import { z } from 'zod';
import twilio from 'twilio';

const sendSmsSchema = z.object({
  to: z.string(),
  body: z.string(),
});

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  // Check if Twilio credentials are configured
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio credentials are not configured in .env file.');
    return NextResponse.json(
      { error: 'SMS service is not configured.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const validation = sendSmsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input.', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { to, body: smsBody } = validation.data;

    const message = await client.messages.create({
      body: smsBody,
      from: twilioPhoneNumber,
      to: to,
    });

    console.log('SMS sent successfully! SID:', message.sid);
    return NextResponse.json({
      message: 'SMS sent successfully!',
      sid: message.sid,
    });
  } catch (error: any) {
    console.error('Twilio API Error:', error);
    // Return the specific error message from Twilio for better client-side debugging
    return NextResponse.json(
      { error: 'Failed to send SMS.', details: error.message },
      { status: 500 }
    );
  }
}

// This is a Next.js API Route, which runs on the server.
// It is a secure place to handle secrets like API keys.

import {NextRequest, NextResponse} from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const {to, message} = await req.json();

    // =========================================================================
    // HOW TO GUIDE: ADD YOUR REAL SMS SERVICE HERE
    // =========================================================================
    //
    // 1. Sign up for an SMS service like Twilio (https://www.twilio.com/).
    //    You will get an "Account SID", an "Auth Token", and a phone number.
    //
    // 2. Add your secret keys to your environment variables.
    //    Create a file named `.env.local` in the root of your project and add:
    //    TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    //    TWILIO_AUTH_TOKEN=your_auth_token
    //    TWILIO_PHONE_NUMBER=+15017122661
    //
    // 3. Install the provider's library: `npm install twilio`
    //
    // 4. Uncomment the code below and fill in your details.
    //
    // =========================================================================

    /*
    import twilio from 'twilio';

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Twilio environment variables are not set.");
      return NextResponse.json({ success: false, error: "SMS service not configured." }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: message,
      from: fromNumber,
      to: to, // The recipient's phone number
    });
    */

    // --- (Simulation) ---
    // In this development environment, we will log the SMS to the console
    // instead of sending a real one.
    console.log('--- SIMULATING SENDING SMS ---');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('------------------------------');
    // --- (End Simulation) ---

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Failed to send SMS:', error);
    // In a real app, you might want more specific error handling.
    return NextResponse.json(
      {success: false, error: 'Failed to send message.'},
      {status: 500}
    );
  }
}

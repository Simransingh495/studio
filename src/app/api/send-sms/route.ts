
import { NextResponse } from 'next/server';

// This is a SIMULATED notification service. It does not send real WhatsApp messages.
// It logs the intended message to the server console for development and testing purposes.

export async function POST(request: Request) {
  try {
    const { phoneNumber, message, type = 'SMS' } = await request.json();

    if (!phoneNumber || !message) {
        return NextResponse.json({ success: false, error: 'Phone number and message are required.' }, { status: 400 });
    }

    // Simulate sending the notification by logging it to the console.
    console.log('--- SIMULATED NOTIFICATION ---');
    console.log(`Type: ${type.toUpperCase()}`);
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log('-----------------------------');

    // Always return a success response in simulation mode.
    return NextResponse.json({ 
        success: true, 
        message: `Simulated ${type.toUpperCase()} notification sent successfully.` 
    });

  } catch (error: any) {
    console.error('SIMULATED API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}

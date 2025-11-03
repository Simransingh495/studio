import { NextResponse } from 'next/server';

// This is a SIMULATED notification service for OneSignal. 
// In a real implementation, this endpoint would make a POST request to the OneSignal API.
// It logs the intended message to the server console for development and testing.

export async function POST(request: Request) {
  try {
    const { recipientUserId, message } = await request.json();

    if (!recipientUserId || !message) {
      return NextResponse.json({ success: false, error: 'Recipient User ID and message are required.' }, { status: 400 });
    }

    const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
    const oneSignalApiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!oneSignalAppId || !oneSignalApiKey) {
      console.warn('--- OneSignal credentials are not set in .env. Skipping real API call. ---');
    }

    // Simulate sending the notification by logging it to the console.
    console.log('--- SIMULATED ONESIGNAL PUSH NOTIFICATION ---');
    console.log(`App ID: ${oneSignalAppId}`);
    console.log(`Targeting User ID (External User ID): ${recipientUserId}`);
    console.log(`Message: ${message}`);
    console.log('---------------------------------------------');

    // In a real implementation, you would use fetch to call the OneSignal API:
    /*
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${oneSignalApiKey}`,
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        include_external_user_ids: [recipientUserId],
        contents: { en: message },
        headings: { en: 'BloodSync Alert' },
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OneSignal API Error: ${JSON.stringify(errorData)}`);
    }
    */

    // Always return a success response in simulation mode.
    return NextResponse.json({ 
        success: true, 
        message: `Simulated OneSignal push notification sent successfully.` 
    });

  } catch (error: any) {
    console.error('SIMULATED API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}

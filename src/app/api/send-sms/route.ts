
import { NextResponse } from 'next/server';
import { z } from 'zod';

const sendSmsSchema = z.object({
  to: z.string(),
  body: z.string(),
});

// This is a simulated SMS sending function.
// In a real application, you would integrate a service like Twilio here.
async function sendSms(to: string, body: string) {
  console.log('--- SIMULATING SENDING SMS ---');
  console.log(`To: ${to}`);
  console.log(`Body: ${body}`);
  console.log('-----------------------------');
  
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate a successful response
  return { success: true, sid: `SM${Math.random().toString(36).substring(2)}` };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = sendSmsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', details: validation.error.flatten() }, { status: 400 });
    }

    const { to, body: smsBody } = validation.data;

    // In a real app, you would check for API keys here.

    const { success, sid } = await sendSms(to, smsBody);

    if (!success) {
      return NextResponse.json({ error: 'Failed to send SMS.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'SMS sent successfully!', sid });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}

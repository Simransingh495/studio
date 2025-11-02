import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  html: z.string(),
});

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    console.error('API Route Error: RESEND_API_KEY or RESEND_FROM_EMAIL is not configured in .env file.');
    return NextResponse.json({ error: 'Server is not configured for sending emails. Please check environment variables.' }, { status: 500 });
  }
  
  try {
    const resend = new Resend(resendApiKey);

    const body = await request.json();
    const validation = sendEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', details: validation.error.flatten() }, { status: 400 });
    }

    const { to, subject, html } = validation.data;

    const { data, error } = await resend.emails.send({
      from: `BloodSync <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: 'Failed to send email.', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully!', data });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}

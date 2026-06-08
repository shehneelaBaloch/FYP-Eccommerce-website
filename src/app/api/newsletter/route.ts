import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = "force-dynamic";

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // shahneelakhadim@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // 16-character app password
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Send email using Nodemailer
    const info = await transporter.sendMail({
      from: '"Shopie" <shahneelakhadim@gmail.com>', // Your Gmail
      to: email, // Any email address to test
      subject: 'Welcome to Our Newsletter! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7C3AED;">Welcome to Our Newsletter! 🎉</h1>
          <p>Thank you for subscribing to our newsletter. Here's what you can expect:</p>
          <ul>
            <li>Exclusive deals and offers</li>
            <li>New product announcements</li>
            <li>Special promotions</li>
            <li>Helpful tips and insights</li>
          </ul>
          <p>We're excited to have you on board!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            You're receiving this email because you subscribed to our newsletter. 
          </p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    
    return NextResponse.json(
      { message: 'Email sent successfully! Check your inbox.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }
}
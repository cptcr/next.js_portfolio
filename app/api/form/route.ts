import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const emailAddress = process.env.EMAIL_ADDRESS;
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_SMTP_PORT;
    const emailUser = process.env.EMAIL_AUTH_USERNAME;
    const emailPass = process.env.EMAIL_AUTH_PASSWORD;

    if (!emailAddress || !emailHost || !emailPort || !emailUser || !emailPass) {
      console.error('Missing email configuration:', {
        hasAddress: !!emailAddress,
        hasHost: !!emailHost,
        hasPort: !!emailPort,
        hasUser: !!emailUser,
        hasPass: !!emailPass,
      });

      return NextResponse.json({ error: 'Email server not configured properly' }, { status: 500 });
    }

    const port = parseInt(emailPort);
    if (isNaN(port)) {
      return NextResponse.json({ error: 'Invalid email port' }, { status: 500 });
    }

    const message: EmailMessage = {
      from: `"Tony's Portfolio" <${emailUser}>`,
      to: emailAddress,
      replyTo: formData.email,
      subject: `[Portfolio Contact] ${formData.subject}`,
      text: `Message from ${formData.name} (${formData.email}):\n\n${formData.message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #3B82F6; margin-bottom: 20px;">New message from your portfolio</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Subject:</strong> ${formData.subject}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <p><strong>Message:</strong></p>
            <p>${formData.message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `,
    };

    const secureConnection = process.env.EMAIL_SECURE === 'true';

    const transporter = nodemailer.createTransport({
      // host: emailHost,
      host: 'mail.cptcr.cc',
      // port: port,
      port: 587,
      secure: secureConnection,
      auth: {
        // user: emailUser,
        user: 'helloworld@cptcr.cc',
        // pass: emailPass,
        pass: '9qUeLGeLVDuM',
      },
      // ...(secureConnection
      //   ? {}
      //   : {
      //       tls: {
      //         ciphers: "SSLv3",
      //         rejectUnauthorized: false,
      //       },
      //     }),
      connectionTimeout: 300000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });

    await transporter.verify();

    const info = await transporter.sendMail(message);

    return NextResponse.json({
      success: true,
      message: `Message delivered successfully to ${info.accepted.join(', ')}`,
    });
  } catch (error) {
    console.error('Error sending email:', error);

    return NextResponse.json(
      {
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

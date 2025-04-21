import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    
    const message: EmailMessage = {
      from: `"${formData.name}" <${formData.email}>`,
      to: process.env.EMAIL_ADDRESS || "", 
      subject: formData.subject,
      text: `Message from ${formData.name} (${formData.email}):\n\n${formData.message}`,
      html: `
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
      `
    };

    const secureConnection = process.env.EMAIL_SECURE === "true"; 

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_SMTP_PORT || "587"), 
      secure: secureConnection,
      auth: {
        user: process.env.EMAIL_AUTH_USERNAME,
        pass: process.env.EMAIL_AUTH_PASSWORD
      }
    });

    const info = await transporter.sendMail(message);
    
    return NextResponse.json({
      success: true,
      message: `Message delivered successfully to ${info.accepted.join(", ")}`
    });
    
  } catch (error) {
    console.error("Error sending email:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to send message",
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
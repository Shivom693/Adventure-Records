import express from 'express';
import nodemailer from 'nodemailer';
import { db } from '../db/dbFallback.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Configure Transporter securely from Environment Variables
const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }
  return null;
};

// Helper: Send email notification to platform admin
const sendAdminNotificationEmail = async (ticketData) => {
  const adminEmail = 'adventureof693@gmail.com';
  const transporter = createEmailTransporter();

  const emailSubject = `[Support Ticket] New Ticket: ${ticketData.subject || 'Inquiry'}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
      <h2 style="color: #eab308; margin-top: 0;">New Adventure Records Support Ticket</h2>
      <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />
      
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #d4d4d8;">
        <tr><td style="padding: 8px 0; font-weight: bold; width: 140px; color: #a1a1aa;">Ticket ID:</td><td style="color: #ffffff;">${ticketData.id || ticketData._id || 'AR-' + Date.now()}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">User Name:</td><td style="color: #ffffff;">${ticketData.name || 'Artist'}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">User Email:</td><td style="color: #ffffff;"><a href="mailto:${ticketData.email}" style="color: #38bdf8;">${ticketData.email}</a></td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">Category:</td><td style="color: #ffffff;">${ticketData.category || 'General Support'}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">Subject:</td><td style="color: #ffffff;">${ticketData.subject}</td></tr>
        ${ticketData.releaseId ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">Release ID:</td><td style="color: #ffffff;">${ticketData.releaseId}</td></tr>` : ''}
        <tr><td style="padding: 8px 0; font-weight: bold; color: #a1a1aa;">Submitted At:</td><td style="color: #ffffff;">${new Date().toLocaleString()}</td></tr>
      </table>

      <div style="margin-top: 20px; padding: 16px; background-color: #18181b; border-radius: 8px; border-left: 4px solid #eab308;">
        <h4 style="margin: 0 0 8px 0; color: #eab308; font-size: 13px; text-transform: uppercase;">Message Content:</h4>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #f4f4f5;">${ticketData.message}</p>
      </div>

      <div style="margin-top: 24px; font-size: 11px; color: #71717a; text-align: center;">
        Adventure Records Support System • Logged automatically to Owner Console
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Adventure Records Support" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml
      });
      console.log(`✉️ Support ticket email notification dispatched to ${adminEmail}`);
      return { success: true };
    } catch (err) {
      console.error(`⚠️ Email dispatch error to ${adminEmail}:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`📌 [SUPPORT TICKET LOGGED TO ADMIN ${adminEmail}]`);
    console.log(`Subject: ${ticketData.subject}`);
    console.log(`From: ${ticketData.name} <${ticketData.email}>`);
    console.log(`Message: ${ticketData.message}`);
    return { success: true, loggedLocally: true };
  }
};

// 1. Submit a support ticket (Public or Authenticated)
router.post('/', async (req, res) => {
  const { name, email, subject, category, message, releaseId, userId } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Name, Email, Subject, and Message are required fields.' });
  }

  try {
    const ticketId = 'AR-TICK-' + Math.floor(100000 + Math.random() * 900000);
    const newTicket = await db.tickets.create({
      ticketId,
      userId: userId || null,
      name,
      email,
      subject,
      category: category || 'General Support',
      message,
      releaseId: releaseId || null,
      status: 'Open',
      createdAt: new Date().toISOString()
    });

    // Dispatch notification to adventureof693@gmail.com
    await sendAdminNotificationEmail({
      id: ticketId,
      name,
      email,
      category,
      subject,
      message,
      releaseId
    });

    res.status(201).json({
      message: 'Support ticket submitted successfully!',
      ticket: newTicket
    });
  } catch (error) {
    console.error('Error submitting ticket:', error);
    res.status(500).json({ message: 'Server error saving ticket.', error: error.message });
  }
});

// 2. Get all support tickets (Admin only)
router.get('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Forbidden. Admin credentials required.' });
  }

  try {
    const allTickets = await db.tickets.find({});
    const ticketsArray = Array.isArray(allTickets) ? allTickets : [allTickets];
    ticketsArray.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.status(200).json({ tickets: ticketsArray });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving support tickets.', error: error.message });
  }
});

// 3. Update support ticket status / Resolve (Admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Forbidden. Admin credentials required.' });
  }

  const { status } = req.body;
  if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const updatedTicket = await db.tickets.findByIdAndUpdate(req.params.id, { 
      status, 
      updatedAt: new Date().toISOString() 
    });
    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    res.status(200).json({
      message: `Ticket status successfully updated to ${status}!`,
      ticket: updatedTicket
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket status.' });
  }
});

export default router;

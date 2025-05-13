import { Router } from 'express';
import { contactFormSchema, templateRequestSchema } from '@shared/schema';
import { FEATURE_FLAGS } from '@shared/config';
import { sendEmail } from '../services/emailService';

const router = Router();

/**
 * Handle contact form submissions
 * This route accepts form data and sends an email notification to the admin
 */
router.post('/contact', async (req, res) => {
  try {
    // Validate request data
    const validatedData = contactFormSchema.parse(req.body);
    
    // If email feature is disabled, just simulate success response
    if (!FEATURE_FLAGS.enableEmail) {
      console.log('[DISABLED EMAIL] Contact form submission:', validatedData);
      return res.status(200).json({ success: true, message: 'Contact form submission received (email sending disabled)' });
    }
    
    // Format email content
    const emailSubject = `[PumpFlux Contact] ${validatedData.subject}`;
    const emailText = `
New contact form submission:

Name: ${validatedData.name}
Email: ${validatedData.email}
Subject: ${validatedData.subject}

Message:
${validatedData.message}
    `;
    
    const emailHtml = `
<h2>New Contact Form Submission</h2>
<p><strong>From:</strong> ${validatedData.name} (${validatedData.email})</p>
<p><strong>Subject:</strong> ${validatedData.subject}</p>
<h3>Message:</h3>
<p>${validatedData.message.replace(/\\n/g, '<br>')}</p>
    `;
    
    // Send email to admin
    await sendEmail({
      to: 'admin@pumpflux.com', // Change to your admin email address
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });
    
    res.status(200).json({ success: true, message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(400).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Invalid input data' 
    });
  }
});

/**
 * Handle template request submissions
 * This route accepts template request data and sends an email notification to the admin
 */
router.post('/template-request', async (req, res) => {
  try {
    // Validate request data
    const validatedData = templateRequestSchema.parse(req.body);
    
    // If email feature is disabled, just simulate success response
    if (!FEATURE_FLAGS.enableEmail) {
      console.log('[DISABLED EMAIL] Template request submission:', validatedData);
      return res.status(200).json({ success: true, message: 'Template request received (email sending disabled)' });
    }
    
    // Format email content
    const emailSubject = `[PumpFlux Template Request] ${validatedData.templateName}`;
    const emailText = `
New template request submission:

Name: ${validatedData.name}
Email: ${validatedData.email}
Template: ${validatedData.templateName}

Description:
${validatedData.description}

Use Case:
${validatedData.useCase}
    `;
    
    const emailHtml = `
<h2>New Template Request</h2>
<p><strong>From:</strong> ${validatedData.name} (${validatedData.email})</p>
<p><strong>Template Name:</strong> ${validatedData.templateName}</p>

<h3>Description:</h3>
<p>${validatedData.description.replace(/\\n/g, '<br>')}</p>

<h3>Use Case:</h3>
<p>${validatedData.useCase.replace(/\\n/g, '<br>')}</p>
    `;
    
    // Send email to admin
    await sendEmail({
      to: 'templates@pumpflux.com', // Change to your template team email address
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });
    
    res.status(200).json({ success: true, message: 'Template request submitted successfully' });
  } catch (error) {
    console.error('Error processing template request:', error);
    res.status(400).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Invalid input data' 
    });
  }
});

export default router;
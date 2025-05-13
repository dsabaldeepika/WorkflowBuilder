import { Router } from 'express';
import { demoRequestFormSchema } from '@shared/schema';
import { FEATURE_FLAGS } from '@shared/config';
import { sendEmail } from '../services/emailService';
import { emailConfig } from '@shared/emailConfig';

const router = Router();

/**
 * Route to handle demo request submissions
 */
router.post('/demo-request', async (req, res) => {
  try {
    // Validate the input using the schema
    const validatedData = demoRequestFormSchema.parse(req.body);
    
    // Log the request for audit/debugging
    console.log('Demo request received:', {
      name: validatedData.name,
      email: validatedData.email,
      date: validatedData.preferredDate,
      time: validatedData.preferredTime
    });
    
    // Send email notification if feature is enabled
    if (FEATURE_FLAGS.enableEmail) {
      const { 
        name, 
        email, 
        companyName, 
        jobTitle, 
        phoneNumber, 
        teamSize, 
        interestedIn, 
        preferredDate, 
        preferredTime, 
        message 
      } = validatedData;
      
      // Format interests for email
      const interestsList = interestedIn.join(', ');
      
      // Create HTML message body
      const htmlContent = `
        <h2>New Demo Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Job Title:</strong> ${jobTitle}</p>
        ${phoneNumber ? `<p><strong>Phone:</strong> ${phoneNumber}</p>` : ''}
        <p><strong>Team Size:</strong> ${teamSize}</p>
        <p><strong>Interests:</strong> ${interestsList}</p>
        <p><strong>Preferred Date:</strong> ${preferredDate}</p>
        <p><strong>Preferred Time:</strong> ${preferredTime}</p>
        ${message ? `<p><strong>Additional Information:</strong> ${message}</p>` : ''}
      `;
      
      // Send notification email to admin
      await sendEmail({
        to: emailConfig.adminEmail,
        from: emailConfig.fromEmail,
        subject: `New Demo Request from ${name} at ${companyName}`,
        html: htmlContent
      });
      
      // Send confirmation email to user
      await sendEmail({
        to: email,
        from: emailConfig.fromEmail,
        subject: 'Your PumpFlux Demo Request Confirmation',
        html: `
          <h2>Thank you for your interest in PumpFlux!</h2>
          <p>We've received your demo request for ${preferredDate} at ${preferredTime} ET.</p>
          <p>A member of our team will be in touch shortly to confirm your appointment and provide any additional information you might need.</p>
          <p>In the meantime, feel free to explore our <a href="https://docs.pumpflux.io">documentation</a> to learn more about our platform.</p>
          <p>Best regards,<br>The PumpFlux Team</p>
        `
      });
    }
    
    // Return success response
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing demo request:', error);
    
    // Return appropriate error response
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, error: 'Invalid form data', details: error.errors });
    } else {
      res.status(500).json({ success: false, error: 'Server error processing request' });
    }
  }
});

export default router;
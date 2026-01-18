const nodemailer = require('nodemailer');

// Create transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Send OTP email for registration
exports.sendOTPEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    const otp = generateOTP();
    
    // Store OTP with 10 minutes expiry
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    const mailOptions = {
      from: process.env.GMAIL,
      to: email,
      subject: 'Welcome to Query Management - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #2c3e50;">Welcome to Query Management System!</h2>
          <p>Hello <strong>${name}</strong>,</p>
          
          <p>Thank you for registering with us. Your account has been successfully created!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Your Verification OTP:</h3>
            <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 15px 0;">${otp}</p>
            <p style="color: #6c757d; font-size: 14px;">This OTP is valid for 10 minutes</p>
          </div>
          
          <p>If you didn't register for this account, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #6c757d;">
            This is an automated message from Query Management System. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `
        Welcome to Query Management System!
        
        Hello ${name},
        
        Thank you for registering with us. Your account has been successfully created!
        
        Your Verification OTP: ${otp}
        
        This OTP is valid for 10 minutes.
        
        If you didn't register for this account, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    throw error;
  }
};

// Verify OTP
exports.verifyOTP = (email, otp) => {
  const stored = otpStore.get(email);
  
  if (!stored) {
    return { success: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return { success: false, message: 'OTP has expired' };
  }
  
  if (stored.otp !== otp) {
    return { success: false, message: 'Invalid OTP' };
  }
  
  otpStore.delete(email);
  return { success: true, message: 'OTP verified successfully' };
};

// Send email notification when query is answered
exports.sendQueryAnswerEmail = async (query) => {
  try {
    const transporter = createTransporter();
    
    // Populate resolvedBy if it exists
    await query.populate('resolvedBy', 'name email role');
    const resolverName = query.resolvedBy ? query.resolvedBy.name : (query.assignedTo ? query.assignedTo.name : 'System');
    const resolverRole = query.resolvedBy ? query.resolvedBy.role : (query.assignedTo ? query.assignedTo.role : '');

    const mailOptions = {
      from: process.env.GMAIL,
      to: query.createdBy.email,
      subject: `Your Query has been Answered - "${query.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #2c3e50;">Query Answered</h2>
          <p>Hello <strong>${query.createdBy.name}</strong>,</p>
          
          <p>Your query has been answered by <strong>${resolverName}</strong>${resolverRole ? ` (${resolverRole})` : ''}.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Query Title:</h3>
            <p style="margin-bottom: 10px;"><strong>${query.title}</strong></p>
            
            <h3 style="color: #495057;">Your Question:</h3>
            <p style="margin-bottom: 10px;">${query.description}</p>
          </div>
          
          <div style="background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #155724;">Answer:</h3>
            <p style="margin-bottom: 0; color: #155724;">${query.answer}</p>
          </div>
          
          <p style="margin-top: 20px;">Query Status: <strong style="color: #28a745;">RESOLVED</strong></p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #6c757d;">
            This is an automated message from Query Management System. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `
        Query Answered
        
        Hello ${query.createdBy.name},
        
        Your query has been answered by ${resolverName}${resolverRole ? ` (${resolverRole})` : ''}.
        
        Query Title: ${query.title}
        Your Question: ${query.description}
        
        Answer: ${query.answer}
        
        Query Status: RESOLVED
        
        This is an automated message from Query Management System.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};

// Send email notification when query is dismantled
exports.sendQueryDismantledEmail = async (query, dismantledBy) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.GMAIL,
      to: query.createdBy.email,
      subject: `Query Dismantled - "${query.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #dc3545;">Query Dismantled</h2>
          <p>Hello <strong>${query.createdBy.name}</strong>,</p>
          
          <p>Your query has been dismantled by <strong>${dismantledBy.name}</strong> (${dismantledBy.role}).</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Query Title:</h3>
            <p style="margin-bottom: 10px;"><strong>${query.title}</strong></p>
            
            <h3 style="color: #495057;">Your Question:</h3>
            <p style="margin-bottom: 10px;">${query.description}</p>
          </div>
          
          <div style="background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #721c24;">Reason for Dismantling:</h3>
            <p style="margin-bottom: 0; color: #721c24;">${query.dismantledReason}</p>
          </div>
          
          <p style="margin-top: 20px;">Query Status: <strong style="color: #dc3545;">DISMANTLED</strong></p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #6c757d;">
            This is an automated message from Query Management System. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `
        Query Dismantled
        
        Hello ${query.createdBy.name},
        
        Your query has been dismantled by ${dismantledBy.name} (${dismantledBy.role}).
        
        Query Title: ${query.title}
        Your Question: ${query.description}
        
        Reason for Dismantling: ${query.dismantledReason}
        
        Query Status: DISMANTLED
        
        This is an automated message from Query Management System.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Dismantle email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending dismantle email:', error.message);
    throw error;
  }
};

// General utility to send any email
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.GMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};

// Send email to admin when new query is created
exports.sendNewQueryToAdminEmail = async (query, admins) => {
  try {
    const transporter = createTransporter();
    
    const adminEmails = admins.map(admin => admin.email).join(',');

    const mailOptions = {
      from: process.env.GMAIL,
      to: adminEmails,
      subject: `New Query Submitted - "${query.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #007bff;">New Query Submitted</h2>
          <p>Hello Admin,</p>
          
          <p>A new query has been submitted and requires your attention.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Query Details:</h3>
            <p><strong>Title:</strong> ${query.title}</p>
            <p><strong>Description:</strong> ${query.description}</p>
            <p><strong>Created By:</strong> ${query.createdBy.name} (${query.createdBy.email})</p>
            <p><strong>Status:</strong> <span style="color: #ffc107;">UNASSIGNED</span></p>
          </div>
          
          <p>Please log in to the system to assign this query to a team head.</p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #6c757d;">
            This is an automated message from Query Management System. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `
        New Query Submitted
        
        Hello Admin,
        
        A new query has been submitted and requires your attention.
        
        Query Details:
        Title: ${query.title}
        Description: ${query.description}
        Created By: ${query.createdBy.name} (${query.createdBy.email})
        Status: UNASSIGNED
        
        Please log in to the system to assign this query to a team head.
        
        This is an automated message from Query Management System.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('New query email sent to admins:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending new query email to admin:', error.message);
    throw error;
  }
};

// Send email to team head when query is assigned
exports.sendQueryAssignedEmail = async (query, teamHead) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.GMAIL,
      to: teamHead.email,
      subject: `Query Assigned to You - "${query.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #28a745;">Query Assigned to You</h2>
          <p>Hello <strong>${teamHead.name}</strong>,</p>
          
          <p>A new query has been assigned to you for resolution.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Query Details:</h3>
            <p><strong>Title:</strong> ${query.title}</p>
            <p><strong>Description:</strong> ${query.description}</p>
            <p><strong>Created By:</strong> ${query.createdBy.name} (${query.createdBy.email})</p>
            <p><strong>Status:</strong> <span style="color: #28a745;">ASSIGNED</span></p>
          </div>
          
          <p>Please log in to the system to view and resolve this query.</p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #6c757d;">
            This is an automated message from Query Management System. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `
        Query Assigned to You
        
        Hello ${teamHead.name},
        
        A new query has been assigned to you for resolution.
        
        Query Details:
        Title: ${query.title}
        Description: ${query.description}
        Created By: ${query.createdBy.name} (${query.createdBy.email})
        Status: ASSIGNED
        
        Please log in to the system to view and resolve this query.
        
        This is an automated message from Query Management System.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Query assignment email sent to team head:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending query assignment email:', error.message);
    throw error;
  }
};


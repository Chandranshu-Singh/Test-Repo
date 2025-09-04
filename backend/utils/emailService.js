const nodemailer = require('nodemailer');

// Create transporter (for development, we'll use console logging)
const createTransporter = () => {
    if (process.env.NODE_ENV === 'production') {
        // Production email configuration
        return nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // Development: Log emails to console
        return {
            sendMail: async (mailOptions) => {
                console.log('📧 Email would be sent in production:');
                console.log('From:', mailOptions.from);
                console.log('To:', mailOptions.to);
                console.log('Subject:', mailOptions.subject);
                console.log('Content:', mailOptions.html || mailOptions.text);
                console.log('---');
                
                // Simulate successful email sending
                return Promise.resolve({
                    messageId: 'dev-' + Date.now(),
                    response: 'Email logged to console (development mode)'
                });
            }
        };
    }
};

// Send email verification
const sendVerificationEmail = async (email, token, firstName) => {
    try {
        const transporter = createTransporter();
        
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@skillshare.com',
            to: email,
            subject: 'Welcome to SkillShare - Verify Your Email',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">Welcome to SkillShare!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px;">Connect, Learn, Grow</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #2d3748; margin-bottom: 20px;">Hi ${firstName}!</h2>
                        
                        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
                            Thank you for joining SkillShare! We're excited to have you as part of our community of learners and teachers.
                        </p>
                        
                        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
                            To complete your registration and start your learning journey, please verify your email address by clicking the button below:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                                Verify Email Address
                            </a>
                        </div>
                        
                        <p style="color: #718096; font-size: 14px; margin-bottom: 20px;">
                            If the button doesn't work, you can copy and paste this link into your browser:
                        </p>
                        
                        <p style="color: #667eea; font-size: 14px; word-break: break-all;">
                            ${verificationUrl}
                        </p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #718096; font-size: 14px; margin: 0;">
                                This verification link will expire in 24 hours. If you didn't create an account with SkillShare, you can safely ignore this email.
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: #2d3748; color: white; padding: 20px; text-align: center; font-size: 14px;">
                        <p style="margin: 0;">© 2024 SkillShare. All rights reserved.</p>
                        <p style="margin: 10px 0 0 0;">
                            <a href="#" style="color: #a0aec0; text-decoration: none;">Privacy Policy</a> | 
                            <a href="#" style="color: #a0aec0; text-decoration: none;">Terms of Service</a>
                        </p>
                    </div>
                </div>
            `
        };
        
        const result = await transporter.sendMail(mailOptions);
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Verification email logged successfully');
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw error;
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token, firstName) => {
    try {
        const transporter = createTransporter();
        
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@skillshare.com',
            to: email,
            subject: 'SkillShare - Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px;">SkillShare Account Security</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #2d3748; margin-bottom: 20px;">Hi ${firstName}!</h2>
                        
                        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
                            We received a request to reset your SkillShare account password. If you made this request, click the button below to create a new password:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p style="color: #718096; font-size: 14px; margin-bottom: 20px;">
                            If the button doesn't work, you can copy and paste this link into your browser:
                        </p>
                        
                        <p style="color: #667eea; font-size: 14px; word-break: break-all;">
                            ${resetUrl}
                        </p>
                        
                        <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
                            <p style="color: #856404; margin: 0; font-size: 14px;">
                                <strong>Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                            </p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #718096; font-size: 14px; margin: 0;">
                                If you have any questions or concerns, please contact our support team.
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: #2d3748; color: white; padding: 20px; text-align: center; font-size: 14px;">
                        <p style="margin: 0;">© 2024 SkillShare. All rights reserved.</p>
                        <p style="margin: 10px 0 0 0;">
                            <a href="#" style="color: #a0aec0; text-decoration: none;">Privacy Policy</a> | 
                            <a href="#" style="color: #a0aec0; text-decoration: none;">Terms of Service</a>
                        </p>
                    </div>
                </div>
            `
        };
        
        const result = await transporter.sendMail(mailOptions);
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Password reset email logged successfully');
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Password reset email failed:', error);
        throw error;
    }
};

// Send welcome email
const sendWelcomeEmail = async (email, firstName) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@skillshare.com',
            to: email,
            subject: 'Welcome to SkillShare - Your Account is Verified!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">Welcome to SkillShare!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px;">Your account is now verified and ready to go!</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #2d3748; margin-bottom: 20px;">Congratulations, ${firstName}! 🎉</h2>
                        
                        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
                            Your SkillShare account has been successfully verified! You're now ready to start your learning journey or share your expertise with others.
                        </p>
                        
                        <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <h3 style="color: #155724; margin: 0 0 15px 0;">What's Next?</h3>
                            <ul style="color: #155724; margin: 0; padding-left: 20px;">
                                <li>Complete your profile with skills and interests</li>
                                <li>Browse available skill providers</li>
                                <li>Book your first learning session</li>
                                <li>Connect with the SkillShare community</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                               style="background: #48bb78; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                                Get Started
                            </a>
                        </div>
                        
                        <p style="color: #718096; font-size: 14px; margin: 0;">
                            If you have any questions or need help getting started, our support team is here to help!
                        </p>
                    </div>
                    
                    <div style="background: #2d3748; color: white; padding: 20px; text-align: center; font-size: 14px;">
                        <p style="margin: 0;">© 2024 SkillShare. All rights reserved.</p>
                        <p style="margin: 10px 0 0 0;">
                            <a href="#" style="color: #a0aec0; text-decoration: none;">Privacy Policy</a> | 
                            <a href="#" style="color: #a0aec0; text-decoration: none;">Terms of Service</a>
                        </p>
                    </div>
                </div>
            `
        };
        
        const result = await transporter.sendMail(mailOptions);
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Welcome email logged successfully');
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Welcome email failed:', error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
};

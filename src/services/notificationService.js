import { Alert } from 'react-native';

// Generate random 6-digit OTP
export const generateRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to WhatsApp
export const sendOTPToWhatsApp = async (phoneNumber, otp) => {
  try {
    // Format phone number (remove + and add country code if needed)
    const formattedPhone = phoneNumber.replace('+', '').replace(/\s/g, '');
    
    // Create WhatsApp message
    const message = `🔐 PHC Mobile Verification Code\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this message.`;
    
    // Create WhatsApp URL
    const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    
    // In production, integrate with WhatsApp Business API
    // You would typically use a service like Twilio, MessageBird, or WhatsApp Business API
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to send OTP to WhatsApp');
  }
};

// Send email notification
export const sendEmailNotification = async (email, subject, data) => {
  try {
    const emailData = {
      to: email,
      subject: subject,
      template: 'registration-notification',
      data: {
        ...data,
        appName: 'PHC Mobile',
        timestamp: new Date().toISOString(),
      }
    };
    
    // In production, integrate with email service
    // You would typically use a service like SendGrid, Mailgun, or AWS SES
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to send email notification');
  }
};

// Send SMS OTP (alternative to WhatsApp)
export const sendSMSOTP = async (phoneNumber, otp) => {
  try {
    const message = `PHC Mobile: Your verification code is ${otp}. Valid for 10 minutes.`;
    
    // In production, integrate with SMS service
    // You would typically use a service like Twilio, MessageBird, or AWS SNS
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to send SMS OTP');
  }
};

// Verify OTP (client-side validation)
export const verifyOTP = (inputOTP, expectedOTP) => {
  return inputOTP === expectedOTP;
};

// Store OTP temporarily (in production, this should be handled by backend)
export const storeOTP = (email, otp, expiresIn = 600000) => { // 10 minutes
  const otpData = {
    otp,
    expiresAt: Date.now() + expiresIn,
  };
  
  // In a real app, you might want to store this in AsyncStorage
  // or better yet, let the backend handle OTP storage
  return otpData;
};

// Check if OTP is expired
export const isOTPExpired = (expiresAt) => {
  return Date.now() > expiresAt;
}; 
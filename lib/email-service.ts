// Email Service
// Handles sending emails via Resend for transfer notifications

import { Resend } from 'resend';
import { formatAddress } from '@/lib/utils';

export interface ClaimEmailData {
  recipientEmail: string;
  senderAddress: string;
  amount: number;
  token: 'FLOW' | 'USDC';
  note?: string;
  claimLink: string;
  expiresAt: Date;
}

export interface ClaimConfirmationData {
  senderId: string;
  transferId: string;
  amount: number;
  token: 'FLOW' | 'USDC';
  claimedBy: string;
}

export interface ExpiryReminderData {
  senderId: string;
  transferId: string;
  recipientEmail: string;
  amount: number;
  token: 'FLOW' | 'USDC';
  claimLink: string;
  expiresAt: Date;
}

export class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@useflopay.xyz';

    if (apiKey && !apiKey.includes('placeholder')) {
      this.resend = new Resend(apiKey);
    } else {
      console.warn('Resend API key not configured, email service disabled');
    }
  }

  /**
   * Send claim email to recipient
   */
  async sendClaimEmail(data: ClaimEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.resend) {
        throw new Error('Email service not configured');
      }

      console.log(`Sending claim email to: ${data.recipientEmail}`);

      const htmlContent = this.generateClaimEmailHTML(data);
      const textContent = this.generateClaimEmailText(data);

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [data.recipientEmail],
        subject: `💰 You have ${data.amount} ${data.token} waiting for you!`,
        html: htmlContent,
        text: textContent,
      });

      console.log('Claim email sent successfully:', result);

      return { success: true };

    } catch (error) {
      console.error('Error sending claim email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send confirmation email to sender
   */
  async sendClaimConfirmation(data: ClaimConfirmationData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.resend) {
        throw new Error('Email service not configured');
      }

      // Get sender email from database
      const { supabase } = await import('./supabase');
      if (!supabase) {
        throw new Error('Database not configured');
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', data.senderId)
        .single();

      if (userError || !userData?.email) {
        console.warn('Could not find sender email, skipping confirmation email');
        return { success: true }; // Don't fail the operation
      }

      console.log(`Sending claim confirmation to sender: ${userData.email}`);

      const htmlContent = this.generateClaimConfirmationHTML(data);
      const textContent = this.generateClaimConfirmationText(data);

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [userData.email],
        subject: `✅ Your transfer of ${data.amount} ${data.token} has been claimed!`,
        html: htmlContent,
        text: textContent,
      });

      console.log('Claim confirmation email sent successfully:', result);

      return { success: true };

    } catch (error) {
      console.error('Error sending claim confirmation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send expiry reminder email
   */
  async sendExpiryReminder(data: ExpiryReminderData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.resend) {
        throw new Error('Email service not configured');
      }

      console.log(`Sending expiry reminder to: ${data.recipientEmail}`);

      const htmlContent = this.generateExpiryReminderHTML(data);
      const textContent = this.generateExpiryReminderText(data);

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [data.recipientEmail],
        subject: `⏰ Your ${data.amount} ${data.token} transfer expires soon!`,
        html: htmlContent,
        text: textContent,
      });

      console.log('Expiry reminder email sent successfully:', result);

      return { success: true };

    } catch (error) {
      console.error('Error sending expiry reminder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate HTML content for claim email
   */
  private generateClaimEmailHTML(data: ClaimEmailData): string {
    const expiresIn = this.formatTimeRemaining(data.expiresAt);
    const senderDisplay = formatAddress(data.senderAddress);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You have money waiting!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 20px; text-align: center; }
        .logo { color: #97F11D; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .tagline { color: #ffffff; font-size: 16px; opacity: 0.8; }
        .content { padding: 40px 20px; }
        .amount { font-size: 48px; font-weight: bold; color: #97F11D; text-align: center; margin: 20px 0; }
        .token { font-size: 24px; color: #666666; text-align: center; margin-bottom: 30px; }
        .message { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #97F11D; }
        .cta-button { display: inline-block; background-color: #97F11D; color: #000000; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; margin: 20px 0; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666666; }
        .sender-info { font-size: 14px; color: #666666; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">FlowPay</div>
            <div class="tagline">Global Money Transfers</div>
        </div>
        
        <div class="content">
            <h1 style="text-align: center; color: #333333; margin-bottom: 10px;">💰 You have money waiting!</h1>
            
            <div class="amount">${data.amount}</div>
            <div class="token">${data.token}</div>
            
            <div class="sender-info">
                <strong>From:</strong> ${senderDisplay}
            </div>
            
            ${data.note ? `
            <div class="message">
                <strong>Message:</strong><br>
                ${data.note}
            </div>
            ` : ''}
            
            <div style="text-align: center;">
                <a href="${data.claimLink}" class="cta-button">Claim Your Money</a>
            </div>
            
            <div class="warning">
                <strong>⏰ Important:</strong> This transfer expires in ${expiresIn}. 
                If not claimed by then, the funds will be returned to the sender.
            </div>
            
            <p style="color: #666666; font-size: 14px; text-align: center;">
                No FlowPay account required! You can claim to your crypto wallet or bank account.
            </p>
        </div>
        
        <div class="footer">
            <p>This email was sent by FlowPay. If you didn't expect this transfer, please ignore this email.</p>
            <p>© 2024 FlowPay. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate text content for claim email
   */
  private generateClaimEmailText(data: ClaimEmailData): string {
    const expiresIn = this.formatTimeRemaining(data.expiresAt);
    const senderDisplay = formatAddress(data.senderAddress);

    return `
💰 You have money waiting!

FlowPay Transfer Notification

Amount: ${data.amount} ${data.token}
From: ${senderDisplay}
${data.note ? `Message: ${data.note}` : ''}

Claim your money: ${data.claimLink}

⏰ Important: This transfer expires in ${expiresIn}. 
If not claimed by then, the funds will be returned to the sender.

No FlowPay account required! You can claim to your crypto wallet or bank account.

---
This email was sent by FlowPay. If you didn't expect this transfer, please ignore this email.
© 2024 FlowPay. All rights reserved.
    `;
  }

  /**
   * Generate HTML content for claim confirmation email
   */
  private generateClaimConfirmationHTML(data: ClaimConfirmationData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transfer Claimed</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 20px; text-align: center; }
        .logo { color: #97F11D; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 20px; }
        .amount { font-size: 48px; font-weight: bold; color: #97F11D; text-align: center; margin: 20px 0; }
        .success { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">FlowPay</div>
        </div>
        
        <div class="content">
            <h1 style="text-align: center; color: #333333;">✅ Transfer Claimed!</h1>
            
            <div class="amount">${data.amount}</div>
            <div style="font-size: 24px; color: #666666; text-align: center; margin-bottom: 30px;">${data.token}</div>
            
            <div class="success">
                <strong>✅ Success!</strong> Your transfer has been claimed by:<br>
                <strong>${formatAddress(data.claimedBy)}</strong>
            </div>
            
            <p style="color: #666666; text-align: center;">
                Transfer ID: ${data.transferId}
            </p>
        </div>
        
        <div class="footer">
            <p>© 2024 FlowPay. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate text content for claim confirmation email
   */
  private generateClaimConfirmationText(data: ClaimConfirmationData): string {
    return `
✅ Transfer Claimed!

Your FlowPay transfer has been successfully claimed.

Amount: ${data.amount} ${data.token}
Claimed by: ${formatAddress(data.claimedBy)}
Transfer ID: ${data.transferId}

Thank you for using FlowPay!

---
© 2024 FlowPay. All rights reserved.
    `;
  }

  /**
   * Generate HTML content for expiry reminder email
   */
  private generateExpiryReminderHTML(data: ExpiryReminderData): string {
    const expiresIn = this.formatTimeRemaining(data.expiresAt);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transfer Expires Soon</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 20px; text-align: center; }
        .logo { color: #97F11D; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 20px; }
        .amount { font-size: 48px; font-weight: bold; color: #97F11D; text-align: center; margin: 20px 0; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta-button { display: inline-block; background-color: #97F11D; color: #000000; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">FlowPay</div>
        </div>
        
        <div class="content">
            <h1 style="text-align: center; color: #333333;">⏰ Transfer Expires Soon!</h1>
            
            <div class="amount">${data.amount}</div>
            <div style="font-size: 24px; color: #666666; text-align: center; margin-bottom: 30px;">${data.token}</div>
            
            <div class="warning">
                <strong>⏰ Urgent:</strong> Your transfer expires in ${expiresIn}. 
                Claim it now or the funds will be returned to the sender!
            </div>
            
            <div style="text-align: center;">
                <a href="${data.claimLink}" class="cta-button">Claim Now</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 FlowPay. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate text content for expiry reminder email
   */
  private generateExpiryReminderText(data: ExpiryReminderData): string {
    const expiresIn = this.formatTimeRemaining(data.expiresAt);

    return `
⏰ Transfer Expires Soon!

Your FlowPay transfer expires in ${expiresIn}.

Amount: ${data.amount} ${data.token}

Claim now: ${data.claimLink}

If not claimed by then, the funds will be returned to the sender.

---
© 2024 FlowPay. All rights reserved.
    `;
  }

  /**
   * Format time remaining until expiry
   */
  private formatTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'less than 1 hour';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }
}

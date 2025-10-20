import { Resend } from 'resend';

// Only create Resend client if API key is provided
const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface PaymentReceiptData {
  customerEmail?: string;
  merchantEmail?: string;
  productName: string;
  amount: string;
  token: string;
  txHash: string;
  recipientAddress: string;
}

export async function sendCustomerReceipt(data: PaymentReceiptData) {
  if (!data.customerEmail || !resend) {
    console.log('Skipping customer receipt email - no email or Resend not configured');
    return;
  }

  try {
    await resend.emails.send({
      from: 'FlowPay <payments@useflowpay.xyz>',
      to: data.customerEmail,
      subject: `Payment Confirmation - ${data.productName}`,
      html: generateCustomerReceiptHTML(data),
    });
  } catch (error) {
    console.error('Failed to send customer receipt:', error);
  }
}

export async function sendMerchantNotification(data: PaymentReceiptData) {
  if (!data.merchantEmail || !resend) {
    console.log('Skipping merchant notification email - no email or Resend not configured');
    return;
  }

  try {
    await resend.emails.send({
      from: 'FlowPay <payments@useflowpay.xyz>',
      to: data.merchantEmail,
      subject: `Payment Received - ${data.amount} ${data.token}`,
      html: generateMerchantNotificationHTML(data),
    });
  } catch (error) {
    console.error('Failed to send merchant notification:', error);
  }
}

function generateCustomerReceiptHTML(data: PaymentReceiptData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #111111; color: #FFFFFF; margin: 0; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; color: #111111; border-radius: 8px; overflow: hidden; }
          .header { background-color: #111111; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; color: #97F11D; }
          .content { padding: 40px; }
          .divider { height: 3px; background-color: #97F11D; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #E5E7EB; }
          .label { color: #707070; font-weight: 500; }
          .value { font-weight: 600; }
          .button { display: inline-block; background-color: #97F11D; color: #111111; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
          .footer { padding: 30px; text-align: center; color: #707070; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">FlowPay</div>
          </div>
          <div class="content">
            <h2>Payment Successful</h2>
            <p>Thank you for your payment. Here are the details:</p>
            <div class="divider"></div>
            <div class="info-row">
              <span class="label">Product</span>
              <span class="value">${data.productName}</span>
            </div>
            <div class="info-row">
              <span class="label">Amount</span>
              <span class="value">${data.amount} ${data.token}</span>
            </div>
            <div class="info-row">
              <span class="label">Recipient</span>
              <span class="value">${data.recipientAddress.substring(0, 8)}...${data.recipientAddress.substring(data.recipientAddress.length - 6)}</span>
            </div>
            <div class="info-row">
              <span class="label">Transaction</span>
              <span class="value">${data.txHash.substring(0, 8)}...</span>
            </div>
            <a href="https://testnet.flowscan.org/transaction/${data.txHash}" class="button">View Transaction</a>
          </div>
          <div class="footer">
            Built on Flow
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateMerchantNotificationHTML(data: PaymentReceiptData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #111111; color: #FFFFFF; margin: 0; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; color: #111111; border-radius: 8px; overflow: hidden; }
          .header { background-color: #111111; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; color: #97F11D; }
          .content { padding: 40px; }
          .divider { height: 3px; background-color: #97F11D; margin: 20px 0; }
          .amount { font-size: 36px; font-weight: bold; color: #97F11D; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #E5E7EB; }
          .label { color: #707070; font-weight: 500; }
          .value { font-weight: 600; }
          .button { display: inline-block; background-color: #97F11D; color: #111111; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
          .footer { padding: 30px; text-align: center; color: #707070; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">FlowPay</div>
          </div>
          <div class="content">
            <h2>Payment Received!</h2>
            <div class="amount">${data.amount} ${data.token}</div>
            <p>You've received a payment for ${data.productName}</p>
            <div class="divider"></div>
            <div class="info-row">
              <span class="label">Product</span>
              <span class="value">${data.productName}</span>
            </div>
            <div class="info-row">
              <span class="label">Transaction</span>
              <span class="value">${data.txHash.substring(0, 8)}...</span>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Dashboard</a>
          </div>
          <div class="footer">
            Built on Flow
          </div>
        </div>
      </body>
    </html>
  `;
}


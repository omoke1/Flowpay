// Claim Transfer Email Template
// React email component for Resend

import { Html, Head, Body, Container, Section, Text, Button, Hr } from '@react-email/components';
import { formatAddress } from '@/lib/utils';

interface ClaimTransferEmailProps {
  recipientEmail: string;
  senderAddress: string;
  amount: number;
  token: 'FLOW' | 'USDC';
  note?: string;
  claimLink: string;
  expiresAt: Date;
}

export function ClaimTransferEmail({
  recipientEmail,
  senderAddress,
  amount,
  token,
  note,
  claimLink,
  expiresAt
}: ClaimTransferEmailProps) {

  const formatTimeRemaining = (expiresAt: Date) => {
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
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>FlowPay</Text>
            <Text style={tagline}>Global Money Transfers</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={title}>💰 You have money waiting!</Text>
            
            {/* Amount */}
            <Section style={amountSection}>
              <Text style={amount}>{amount}</Text>
              <Text style={token}>{token}</Text>
            </Section>

            {/* Sender Info */}
            <Section style={senderInfo}>
              <Text style={label}>From:</Text>
              <Text style={address}>{formatAddress(senderAddress)}</Text>
            </Section>

            {/* Note */}
            {note && (
              <Section style={messageSection}>
                <Text style={label}>Message:</Text>
                <Text style={message}>{note}</Text>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={button} href={claimLink}>
                Claim Your Money
              </Button>
            </Section>

            {/* Warning */}
            <Section style={warningSection}>
              <Text style={warningTitle}>⏰ Important:</Text>
              <Text style={warningText}>
                This transfer expires in {formatTimeRemaining(expiresAt)}. 
                If not claimed by then, the funds will be returned to the sender.
              </Text>
            </Section>

            {/* Info */}
            <Text style={info}>
              No FlowPay account required! You can claim to your crypto wallet or bank account.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by FlowPay. If you didn't expect this transfer, please ignore this email.
            </Text>
            <Text style={footerText}>
              © 2024 FlowPay. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

const header = {
  background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#97F11D',
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '10px',
  margin: '0',
};

const tagline = {
  color: '#ffffff',
  fontSize: '16px',
  opacity: 0.8,
  margin: '0',
};

const content = {
  padding: '40px 20px',
};

const title = {
  textAlign: 'center' as const,
  color: '#333333',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '30px',
  margin: '0 0 30px 0',
};

const amountSection = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const amount = {
  fontSize: '48px',
  fontWeight: 'bold',
  color: '#97F11D',
  margin: '0 0 10px 0',
};

const token = {
  fontSize: '24px',
  color: '#666666',
  margin: '0',
};

const senderInfo = {
  marginBottom: '20px',
};

const label = {
  fontSize: '14px',
  color: '#666666',
  margin: '0 0 5px 0',
};

const address = {
  fontFamily: 'monospace',
  fontSize: '14px',
  margin: '0',
};

const messageSection = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '20px',
  borderLeft: '4px solid #97F11D',
};

const message = {
  margin: '0',
  fontSize: '14px',
};

const buttonSection = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const button = {
  backgroundColor: '#97F11D',
  color: '#000000',
  padding: '16px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '18px',
  display: 'inline-block',
};

const warningSection = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px',
};

const warningTitle = {
  fontWeight: 'bold',
  margin: '0 0 5px 0',
  fontSize: '14px',
};

const warningText = {
  margin: '0',
  fontSize: '14px',
};

const info = {
  color: '#666666',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '0',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
};

const footer = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  color: '#666666',
  margin: '0 0 5px 0',
};

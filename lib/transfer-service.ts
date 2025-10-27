// Transfer Service
// Orchestrates transfer creation, claiming, and refunding

import { supabase, Transfer } from './supabase';
import { 
  createEscrowTransfer, 
  claimEscrowTransfer, 
  refundExpiredTransfer,
  getEscrowTransferDetails,
  generateClaimToken,
  calculateExpiryTimestamp,
  isTransferExpired
} from './flow-escrow-transactions';
import { EmailService } from './email-service';

export class TransferService {
  private static instance: TransferService;
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  public static getInstance(): TransferService {
    if (!TransferService.instance) {
      TransferService.instance = new TransferService();
    }
    return TransferService.instance;
  }

  /**
   * Create a new transfer
   */
  async createTransfer(data: {
    senderId: string;
    senderAddress: string;
    recipientEmail?: string;
    amount: number;
    token: 'FLOW' | 'USDC';
    note?: string;
    sendEmail?: boolean;
  }): Promise<{ success: boolean; transfer?: Transfer; error?: string }> {
    try {
      console.log('Creating transfer:', data);

      // Validate input
      if (!data.senderId || !data.senderAddress || !data.amount || !data.token) {
        throw new Error('Missing required fields');
      }

      if (data.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      if (!['FLOW', 'USDC'].includes(data.token)) {
        throw new Error('Token must be FLOW or USDC');
      }

      // Generate unique identifiers
      const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const claimToken = generateClaimToken();
      const expiresAt = calculateExpiryTimestamp();
      const claimLink = `${process.env.NEXT_PUBLIC_APP_URL}/claim/${claimToken}`;

      console.log(`Generated transfer ID: ${transferId}`);
      console.log(`Generated claim token: ${claimToken}`);
      console.log(`Expires at: ${new Date(expiresAt * 1000).toISOString()}`);

      // Create transfer record in database first
      const { data: transferData, error: dbError } = await supabase!
        .from('transfers')
        .insert({
          id: transferId,
          sender_id: data.senderId,
          sender_address: data.senderAddress,
          recipient_email: data.recipientEmail,
          amount: data.amount,
          token: data.token,
          claim_token: claimToken,
          claim_link: claimLink,
          note: data.note,
          expires_at: new Date(expiresAt * 1000).toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error creating transfer:', dbError);
        throw new Error(`Failed to create transfer record: ${dbError.message}`);
      }

      console.log('Transfer record created in database:', transferData);

      // Execute escrow transaction on Flow blockchain
      try {
        const escrowTxHash = await createEscrowTransfer(
          transferId,
          data.recipientEmail,
          data.amount.toString(),
          data.token,
          claimToken,
          data.note,
          expiresAt
        );

        console.log(`Escrow transaction executed: ${escrowTxHash}`);

        // Update transfer with escrow transaction hash
        const { error: updateError } = await supabase!
          .from('transfers')
          .update({ escrow_tx_hash: escrowTxHash })
          .eq('id', transferId);

        if (updateError) {
          console.error('Error updating transfer with escrow hash:', updateError);
          // Don't fail the whole operation, just log the error
        }

        // Send email if requested and recipient email provided
        if (data.sendEmail && data.recipientEmail) {
          try {
            await this.emailService.sendClaimEmail({
              recipientEmail: data.recipientEmail,
              senderAddress: data.senderAddress,
              amount: data.amount,
              token: data.token,
              note: data.note,
              claimLink: claimLink,
              expiresAt: new Date(expiresAt * 1000)
            });
            console.log('Claim email sent successfully');
          } catch (emailError) {
            console.error('Error sending claim email:', emailError);
            // Don't fail the whole operation, just log the error
          }
        }

        return {
          success: true,
          transfer: transferData as Transfer
        };

      } catch (escrowError) {
        console.error('Escrow transaction failed:', escrowError);
        
        // Update transfer status to failed
        await supabase!
          .from('transfers')
          .update({ status: 'expired' })
          .eq('id', transferId);

        throw new Error(`Escrow transaction failed: ${escrowError}`);
      }

    } catch (error) {
      console.error('Error creating transfer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Claim a transfer
   */
  async claimTransfer(data: {
    claimToken: string;
    recipientAddress?: string;
    payoutMethod: 'crypto' | 'fiat';
    recipientEmail?: string;
  }): Promise<{ success: boolean; transfer?: Transfer; error?: string }> {
    try {
      console.log('Claiming transfer:', data);

      // Get transfer details from database
      const { data: transferData, error: dbError } = await supabase!
        .from('transfers')
        .select('*')
        .eq('claim_token', data.claimToken)
        .single();

      if (dbError || !transferData) {
        throw new Error('Transfer not found');
      }

      // Check if transfer is still pending
      if (transferData.status !== 'pending') {
        throw new Error(`Transfer has already been ${transferData.status}`);
      }

      // Check if transfer has expired
      if (isTransferExpired(new Date(transferData.expires_at).getTime() / 1000)) {
        throw new Error('Transfer has expired');
      }

      console.log('Transfer found:', transferData);

      if (data.payoutMethod === 'crypto') {
        // Execute claim transaction on Flow blockchain
        if (!data.recipientAddress) {
          throw new Error('Recipient address required for crypto payout');
        }

        const claimTxHash = await claimEscrowTransfer(
          data.claimToken,
          transferData.token
        );

        console.log(`Claim transaction executed: ${claimTxHash}`);

        // Update transfer status
        const { error: updateError } = await supabase!
          .from('transfers')
          .update({
            status: 'claimed',
            claim_tx_hash: claimTxHash,
            claimed_by_address: data.recipientAddress,
            claimed_at: new Date().toISOString()
          })
          .eq('id', transferData.id);

        if (updateError) {
          console.error('Error updating transfer status:', updateError);
          throw new Error('Failed to update transfer status');
        }

        // Send confirmation email to sender
        try {
          await this.emailService.sendClaimConfirmation({
            senderId: transferData.sender_id,
            transferId: transferData.id,
            amount: transferData.amount,
            token: transferData.token,
            claimedBy: data.recipientAddress
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the operation
        }

      } else if (data.payoutMethod === 'fiat') {
        // Handle fiat payout via Crossmint
        // This would integrate with Crossmint offramp service
        // For now, we'll mark as claimed and handle the offramp separately
        
        const { error: updateError } = await supabase!
          .from('transfers')
          .update({
            status: 'claimed',
            claimed_at: new Date().toISOString(),
            note: `${transferData.note || ''} [Fiat payout initiated]`
          })
          .eq('id', transferData.id);

        if (updateError) {
          console.error('Error updating transfer status:', updateError);
          throw new Error('Failed to update transfer status');
        }
      }

      // Get updated transfer data
      const { data: updatedTransfer, error: fetchError } = await supabase!
        .from('transfers')
        .select('*')
        .eq('id', transferData.id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated transfer:', fetchError);
      }

      return {
        success: true,
        transfer: updatedTransfer as Transfer
      };

    } catch (error) {
      console.error('Error claiming transfer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Refund an expired transfer
   */
  async refundTransfer(transferId: string, senderAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Refunding transfer: ${transferId}`);

      // Get transfer details
      const { data: transferData, error: dbError } = await supabase!
        .from('transfers')
        .select('*')
        .eq('id', transferId)
        .eq('sender_address', senderAddress)
        .single();

      if (dbError || !transferData) {
        throw new Error('Transfer not found or unauthorized');
      }

      // Check if transfer is still pending
      if (transferData.status !== 'pending') {
        throw new Error(`Transfer has already been ${transferData.status}`);
      }

      // Check if transfer has expired
      if (!isTransferExpired(new Date(transferData.expires_at).getTime() / 1000)) {
        throw new Error('Transfer has not yet expired');
      }

      // Execute refund transaction on Flow blockchain
      const refundTxHash = await refundExpiredTransfer(
        transferId,
        transferData.token
      );

      console.log(`Refund transaction executed: ${refundTxHash}`);

      // Update transfer status
      const { error: updateError } = await supabase!
        .from('transfers')
        .update({
          status: 'refunded',
          claim_tx_hash: refundTxHash,
          claimed_at: new Date().toISOString()
        })
        .eq('id', transferId);

      if (updateError) {
        console.error('Error updating transfer status:', updateError);
        throw new Error('Failed to update transfer status');
      }

      return { success: true };

    } catch (error) {
      console.error('Error refunding transfer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get transfer details by claim token
   */
  async getTransferDetails(claimToken: string): Promise<{ success: boolean; transfer?: Transfer; error?: string }> {
    try {
      console.log(`Getting transfer details for claim token: ${claimToken}`);

      const { data: transferData, error: dbError } = await supabase!
        .from('transfers')
        .select('*')
        .eq('claim_token', claimToken)
        .single();

      if (dbError || !transferData) {
        return {
          success: false,
          error: 'Transfer not found'
        };
      }

      return {
        success: true,
        transfer: transferData as Transfer
      };

    } catch (error) {
      console.error('Error getting transfer details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get transfers by sender
   */
  async getTransfersBySender(senderId: string): Promise<{ success: boolean; transfers?: Transfer[]; error?: string }> {
    try {
      console.log(`Getting transfers for sender: ${senderId}`);

      const { data: transfers, error: dbError } = await supabase!
        .from('transfers')
        .select('*')
        .eq('sender_id', senderId)
        .order('created_at', { ascending: false });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      return {
        success: true,
        transfers: transfers as Transfer[]
      };

    } catch (error) {
      console.error('Error getting transfers by sender:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clean up expired transfers
   */
  async cleanupExpiredTransfers(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      console.log('Cleaning up expired transfers');

      const { data, error } = await supabase!
        .rpc('cleanup_expired_transfers');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`Cleaned up ${data} expired transfers`);

      return {
        success: true,
        count: data
      };

    } catch (error) {
      console.error('Error cleaning up expired transfers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get transfer statistics for a sender
   */
  async getTransferStats(senderId: string): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      console.log(`Getting transfer stats for sender: ${senderId}`);

      const { data: stats, error: dbError } = await supabase!
        .from('transfer_stats')
        .select('*')
        .eq('sender_id', senderId)
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('Error getting transfer stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const transferService = TransferService.getInstance();

// FlowPay Escrow Smart Contract
// Handles P2P transfers with escrow functionality
// Supports FLOW and USDC tokens with 7-day expiry

import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x1654653399040a61
import USDCFlow from 0xf1ab99c82dee3526

pub contract FlowPayEscrow {
    
    // Transfer status enum
    pub enum TransferStatus: UInt8 {
        case PENDING
        case CLAIMED
        case REFUNDED
        case EXPIRED
    }
    
    // Transfer struct
    pub struct Transfer {
        pub let id: String
        pub let sender: Address
        pub let recipientEmail: String?
        pub let amount: UFix64
        pub let token: String
        pub let claimToken: String
        pub let note: String?
        pub let status: TransferStatus
        pub let createdAt: UFix64
        pub let expiresAt: UFix64
        pub let claimedBy: Address?
        pub let claimedAt: UFix64?
        
        init(
            id: String,
            sender: Address,
            recipientEmail: String?,
            amount: UFix64,
            token: String,
            claimToken: String,
            note: String?,
            expiresAt: UFix64
        ) {
            self.id = id
            self.sender = sender
            self.recipientEmail = recipientEmail
            self.amount = amount
            self.token = token
            self.claimToken = claimToken
            self.note = note
            self.status = TransferStatus.PENDING
            self.createdAt = getCurrentBlock().timestamp
            self.expiresAt = expiresAt
            self.claimedBy = nil
            self.claimedAt = nil
        }
    }
    
    // Escrow resource to hold locked funds
    pub resource EscrowVault {
        pub var transfers: {String: Transfer}
        pub var totalLocked: UFix64
        pub var transferCount: UInt64
        
        init() {
            self.transfers = {}
            self.totalLocked = 0.0
            self.transferCount = 0
        }
        
        // Create a new transfer and lock funds
        pub fun createTransfer(
            id: String,
            sender: &{FungibleToken.Provider},
            recipientEmail: String?,
            amount: UFix64,
            token: String,
            claimToken: String,
            note: String?,
            expiresAt: UFix64
        ): Transfer {
            pre {
                amount > 0.0: "Amount must be greater than 0"
                token == "FLOW" || token == "USDC": "Token must be FLOW or USDC"
                expiresAt > getCurrentBlock().timestamp: "Expiry must be in the future"
            }
            
            // Create transfer record
            let transfer = Transfer(
                id: id,
                sender: sender.owner?.address ?? panic("Invalid sender"),
                recipientEmail: recipientEmail,
                amount: amount,
                token: token,
                claimToken: claimToken,
                note: note,
                expiresAt: expiresAt
            )
            
            // Store transfer
            self.transfers[id] = transfer
            self.totalLocked = self.totalLocked + amount
            self.transferCount = self.transferCount + 1
            
            // Emit event
            emit TransferCreated(
                id: id,
                sender: transfer.sender,
                amount: amount,
                token: token,
                claimToken: claimToken,
                expiresAt: expiresAt
            )
            
            return transfer
        }
        
        // Claim transfer funds
        pub fun claimTransfer(
            claimToken: String,
            recipient: &{FungibleToken.Receiver}
        ): Transfer {
            pre {
                self.transfers.length > 0: "No transfers exist"
            }
            
            // Find transfer by claim token
            var transferId: String? = nil
            for id in self.transfers.keys {
                if self.transfers[id]?.claimToken == claimToken {
                    transferId = id
                    break
                }
            }
            
            pre {
                transferId != nil: "Transfer not found"
                let transfer = self.transfers[transferId!]!
                transfer.status == TransferStatus.PENDING: "Transfer already processed"
                getCurrentBlock().timestamp < transfer.expiresAt: "Transfer has expired"
            }
            
            let transfer = self.transfers[transferId!]!
            
            // Update transfer status
            self.transfers[transferId!] = Transfer(
                id: transfer.id,
                sender: transfer.sender,
                recipientEmail: transfer.recipientEmail,
                amount: transfer.amount,
                token: transfer.token,
                claimToken: transfer.claimToken,
                note: transfer.note,
                expiresAt: transfer.expiresAt
            )
            
            // Update claimed info
            self.transfers[transferId!]!.status = TransferStatus.CLAIMED
            self.transfers[transferId!]!.claimedBy = recipient.owner?.address
            self.transfers[transferId!]!.claimedAt = getCurrentBlock().timestamp
            
            // Update locked amount
            self.totalLocked = self.totalLocked - transfer.amount
            
            // Emit event
            emit TransferClaimed(
                id: transfer.id,
                claimToken: claimToken,
                claimedBy: recipient.owner?.address ?? panic("Invalid recipient"),
                amount: transfer.amount,
                token: transfer.token
            )
            
            return self.transfers[transferId!]!
        }
        
        // Refund expired transfer
        pub fun refundExpiredTransfer(
            transferId: String,
            sender: &{FungibleToken.Receiver}
        ): Transfer {
            pre {
                self.transfers[transferId] != nil: "Transfer not found"
                let transfer = self.transfers[transferId]!
                transfer.status == TransferStatus.PENDING: "Transfer already processed"
                getCurrentBlock().timestamp >= transfer.expiresAt: "Transfer not yet expired"
            }
            
            let transfer = self.transfers[transferId]!
            
            // Update transfer status
            self.transfers[transferId]!.status = TransferStatus.REFUNDED
            
            // Update locked amount
            self.totalLocked = self.totalLocked - transfer.amount
            
            // Emit event
            emit TransferRefunded(
                id: transfer.id,
                sender: transfer.sender,
                amount: transfer.amount,
                token: transfer.token,
                refundedAt: getCurrentBlock().timestamp
            )
            
            return self.transfers[transferId]!
        }
        
        // Get transfer details by claim token
        pub fun getTransferByClaimToken(claimToken: String): Transfer? {
            for transfer in self.transfers.values {
                if transfer.claimToken == claimToken {
                    return transfer
                }
            }
            return nil
        }
        
        // Get transfer details by ID
        pub fun getTransferById(transferId: String): Transfer? {
            return self.transfers[transferId]
        }
        
        // Get all transfers for a sender
        pub fun getTransfersBySender(sender: Address): [Transfer] {
            var senderTransfers: [Transfer] = []
            for transfer in self.transfers.values {
                if transfer.sender == sender {
                    senderTransfers.append(transfer)
                }
            }
            return senderTransfers
        }
        
        // Get escrow metrics
        pub fun getMetrics(): {totalLocked: UFix64, transferCount: UInt64, activeTransfers: UInt64} {
            var activeTransfers: UInt64 = 0
            for transfer in self.transfers.values {
                if transfer.status == TransferStatus.PENDING {
                    activeTransfers = activeTransfers + 1
                }
            }
            
            return {
                totalLocked: self.totalLocked,
                transferCount: self.transferCount,
                activeTransfers: activeTransfers
            }
        }
    }
    
    // Escrow vault reference
    pub var escrowVault: &EscrowVault?
    
    // Events
    pub event TransferCreated(
        id: String,
        sender: Address,
        amount: UFix64,
        token: String,
        claimToken: String,
        expiresAt: UFix64
    )
    
    pub event TransferClaimed(
        id: String,
        claimToken: String,
        claimedBy: Address,
        amount: UFix64,
        token: String
    )
    
    pub event TransferRefunded(
        id: String,
        sender: Address,
        amount: UFix64,
        token: String,
        refundedAt: UFix64
    )
    
    init() {
        // Create escrow vault
        let vault <- create EscrowVault()
        self.escrowVault = &vault as &EscrowVault
        
        // Store vault in account storage
        self.account.save(<-vault, to: /storage/flowPayEscrowVault)
        
        // Link vault to public
        self.account.link<&EscrowVault>(/public/flowPayEscrowVault, target: /storage/flowPayEscrowVault)
    }
    
    // Public functions for external access
    
    // Create transfer (called by transaction)
    pub fun createTransfer(
        id: String,
        sender: &{FungibleToken.Provider},
        recipientEmail: String?,
        amount: UFix64,
        token: String,
        claimToken: String,
        note: String?,
        expiresAt: UFix64
    ): Transfer {
        pre {
            self.escrowVault != nil: "Escrow vault not initialized"
        }
        
        return self.escrowVault!.createTransfer(
            id: id,
            sender: sender,
            recipientEmail: recipientEmail,
            amount: amount,
            token: token,
            claimToken: claimToken,
            note: note,
            expiresAt: expiresAt
        )
    }
    
    // Claim transfer (called by transaction)
    pub fun claimTransfer(
        claimToken: String,
        recipient: &{FungibleToken.Receiver}
    ): Transfer {
        pre {
            self.escrowVault != nil: "Escrow vault not initialized"
        }
        
        return self.escrowVault!.claimTransfer(
            claimToken: claimToken,
            recipient: recipient
        )
    }
    
    // Refund expired transfer (called by transaction)
    pub fun refundExpiredTransfer(
        transferId: String,
        sender: &{FungibleToken.Receiver}
    ): Transfer {
        pre {
            self.escrowVault != nil: "Escrow vault not initialized"
        }
        
        return self.escrowVault!.refundExpiredTransfer(
            transferId: transferId,
            sender: sender
        )
    }
    
    // Get transfer by claim token
    pub fun getTransferByClaimToken(claimToken: String): Transfer? {
        pre {
            self.escrowVault != nil: "Escrow vault not initialized"
        }
        
        return self.escrowVault!.getTransferByClaimToken(claimToken: claimToken)
    }
    
    // Get transfer by ID
    pub fun getTransferById(transferId: String): Transfer? {
        pre {
            self.escrowVault != nil: "Escrow vault not initialized"
        }
        
        return self.escrowVault!.getTransferById(transferId: transferId)
    }
    
    // Get transfers by sender
    pub fun getTransfersBySender(sender: Address): [Transfer] {
        pre {
            self.escrowVault != nil: "Escrow vault not initialized"
        }
        
        return self.escrowVault!.getTransfersBySender(sender: sender)
    }
    
    // Get escrow metrics
    pub fun getEscrowMetrics(): {totalLocked: UFix64, transferCount: UInt64, activeTransfers: UInt64} {
        pre {
            self.escrowVault != nil: "Escrow vault not initialized"
        }
        
        return self.escrowVault!.getMetrics()
    }
}

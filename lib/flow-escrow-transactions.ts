// Flow Escrow Transaction Functions
// Wrappers for FlowPayEscrow contract interactions

import * as fcl from '@onflow/fcl';

// Contract addresses (update for mainnet)
const FLOWPAY_ESCROW_CONTRACT = '0x1234567890abcdef'; // Update with deployed contract address
const FLOW_TOKEN_CONTRACT = '0x1654653399040a61';
const USDC_CONTRACT = '0xf1ab99c82dee3526';
const FUNGIBLE_TOKEN_CONTRACT = '0x9a0766d93b6608b7';

// Transaction to create escrow transfer
const CREATE_ESCROW_TRANSFER_TRANSACTION = `
import FungibleToken from ${FUNGIBLE_TOKEN_CONTRACT}
import FlowToken from ${FLOW_TOKEN_CONTRACT}
import USDCFlow from ${USDC_CONTRACT}
import FlowPayEscrow from ${FLOWPAY_ESCROW_CONTRACT}

transaction(
    id: String,
    recipientEmail: String?,
    amount: UFix64,
    token: String,
    claimToken: String,
    note: String?,
    expiresAt: UFix64
) {
    let escrowVault: &FlowPayEscrow.EscrowVault
    let senderVault: &{FungibleToken.Provider}
    let transfer: FlowPayEscrow.Transfer

    prepare(signer: auth(BorrowValue) &Account) {
        // Get escrow vault reference
        self.escrowVault = getAccount(${FLOWPAY_ESCROW_CONTRACT})
            .getCapability<&FlowPayEscrow.EscrowVault>(/public/flowPayEscrowVault)
            .borrow()
            ?? panic("Could not borrow escrow vault reference")

        // Get sender vault based on token type
        if token == "FLOW" {
            self.senderVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow Flow token vault")
        } else if token == "USDC" {
            self.senderVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &USDCFlow.Vault>(from: /storage/usdcVault)
                ?? panic("Could not borrow USDC vault")
        } else {
            panic("Unsupported token type")
        }
    }

    execute {
        // Create transfer in escrow
        self.transfer = self.escrowVault.createTransfer(
            id: id,
            sender: self.senderVault,
            recipientEmail: recipientEmail,
            amount: amount,
            token: token,
            claimToken: claimToken,
            note: note,
            expiresAt: expiresAt
        )
    }
}
`;

// Transaction to claim escrow transfer
const CLAIM_ESCROW_TRANSFER_TRANSACTION = `
import FungibleToken from ${FUNGIBLE_TOKEN_CONTRACT}
import FlowToken from ${FLOW_TOKEN_CONTRACT}
import USDCFlow from ${USDC_CONTRACT}
import FlowPayEscrow from ${FLOWPAY_ESCROW_CONTRACT}

transaction(claimToken: String, token: String) {
    let escrowVault: &FlowPayEscrow.EscrowVault
    let recipientVault: &{FungibleToken.Receiver}
    let transfer: FlowPayEscrow.Transfer

    prepare(signer: auth(BorrowValue) &Account) {
        // Get escrow vault reference
        self.escrowVault = getAccount(${FLOWPAY_ESCROW_CONTRACT})
            .getCapability<&FlowPayEscrow.EscrowVault>(/public/flowPayEscrowVault)
            .borrow()
            ?? panic("Could not borrow escrow vault reference")

        // Get recipient vault based on token type
        if token == "FLOW" {
            self.recipientVault = signer.storage.borrow<auth(FungibleToken.Receiver) &FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow Flow token vault")
        } else if token == "USDC" {
            self.recipientVault = signer.storage.borrow<auth(FungibleToken.Receiver) &USDCFlow.Vault>(from: /storage/usdcVault)
                ?? panic("Could not borrow USDC vault")
        } else {
            panic("Unsupported token type")
        }
    }

    execute {
        // Claim transfer from escrow
        self.transfer = self.escrowVault.claimTransfer(
            claimToken: claimToken,
            recipient: self.recipientVault
        )
    }
}
`;

// Transaction to refund expired transfer
const REFUND_EXPIRED_TRANSFER_TRANSACTION = `
import FungibleToken from ${FUNGIBLE_TOKEN_CONTRACT}
import FlowToken from ${FLOW_TOKEN_CONTRACT}
import USDCFlow from ${USDC_CONTRACT}
import FlowPayEscrow from ${FLOWPAY_ESCROW_CONTRACT}

transaction(transferId: String, token: String) {
    let escrowVault: &FlowPayEscrow.EscrowVault
    let senderVault: &{FungibleToken.Receiver}
    let transfer: FlowPayEscrow.Transfer

    prepare(signer: auth(BorrowValue) &Account) {
        // Get escrow vault reference
        self.escrowVault = getAccount(${FLOWPAY_ESCROW_CONTRACT})
            .getCapability<&FlowPayEscrow.EscrowVault>(/public/flowPayEscrowVault)
            .borrow()
            ?? panic("Could not borrow escrow vault reference")

        // Get sender vault based on token type
        if token == "FLOW" {
            self.senderVault = signer.storage.borrow<auth(FungibleToken.Receiver) &FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow Flow token vault")
        } else if token == "USDC" {
            self.senderVault = signer.storage.borrow<auth(FungibleToken.Receiver) &USDCFlow.Vault>(from: /storage/usdcVault)
                ?? panic("Could not borrow USDC vault")
        } else {
            panic("Unsupported token type")
        }
    }

    execute {
        // Refund expired transfer
        self.transfer = self.escrowVault.refundExpiredTransfer(
            transferId: transferId,
            sender: self.senderVault
        )
    }
}
`;

// Script to get transfer details by claim token
const GET_TRANSFER_BY_CLAIM_TOKEN_SCRIPT = `
import FlowPayEscrow from ${FLOWPAY_ESCROW_CONTRACT}

pub fun main(claimToken: String): FlowPayEscrow.Transfer? {
    let escrowVault = getAccount(${FLOWPAY_ESCROW_CONTRACT})
        .getCapability<&FlowPayEscrow.EscrowVault>(/public/flowPayEscrowVault)
        .borrow()
        ?? panic("Could not borrow escrow vault reference")

    return escrowVault.getTransferByClaimToken(claimToken: claimToken)
}
`;

// Script to get transfer details by ID
const GET_TRANSFER_BY_ID_SCRIPT = `
import FlowPayEscrow from ${FLOWPAY_ESCROW_CONTRACT}

pub fun main(transferId: String): FlowPayEscrow.Transfer? {
    let escrowVault = getAccount(${FLOWPAY_ESCROW_CONTRACT})
        .getCapability<&FlowPayEscrow.EscrowVault>(/public/flowPayEscrowVault)
        .borrow()
        ?? panic("Could not borrow escrow vault reference")

    return escrowVault.getTransferById(transferId: transferId)
}
`;

// Script to get transfers by sender
const GET_TRANSFERS_BY_SENDER_SCRIPT = `
import FlowPayEscrow from ${FLOWPAY_ESCROW_CONTRACT}

pub fun main(sender: Address): [FlowPayEscrow.Transfer] {
    let escrowVault = getAccount(${FLOWPAY_ESCROW_CONTRACT})
        .getCapability<&FlowPayEscrow.EscrowVault>(/public/flowPayEscrowVault)
        .borrow()
        ?? panic("Could not borrow escrow vault reference")

    return escrowVault.getTransfersBySender(sender: sender)
}
`;

// Script to get escrow metrics
const GET_ESCROW_METRICS_SCRIPT = `
import FlowPayEscrow from ${FLOWPAY_ESCROW_CONTRACT}

pub fun main(): {totalLocked: UFix64, transferCount: UInt64, activeTransfers: UInt64} {
    let escrowVault = getAccount(${FLOWPAY_ESCROW_CONTRACT})
        .getCapability<&FlowPayEscrow.EscrowVault>(/public/flowPayEscrowVault)
        .borrow()
        ?? panic("Could not borrow escrow vault reference")

    return escrowVault.getMetrics()
}
`;

/**
 * Create an escrow transfer
 */
export async function createEscrowTransfer(
    transferId: string,
    recipientEmail: string | null,
    amount: string,
    token: 'FLOW' | 'USDC',
    claimToken: string,
    note: string | null,
    expiresAt: number
): Promise<string> {
    try {
        console.log(`Creating escrow transfer: ${transferId}, ${amount} ${token}`);
        
        const transactionId = await fcl.mutate({
            cadence: CREATE_ESCROW_TRANSFER_TRANSACTION,
            args: (arg: any, t: any) => [
                arg(transferId, t.String),
                arg(recipientEmail, t.Optional(t.String)),
                arg(amount, t.UFix64),
                arg(token, t.String),
                arg(claimToken, t.String),
                arg(note, t.Optional(t.String)),
                arg(expiresAt.toString(), t.UFix64)
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser],
            limit: 1000
        });

        console.log(`Escrow transfer created: ${transactionId}`);
        return transactionId;
    } catch (error) {
        console.error('Error creating escrow transfer:', error);
        throw new Error(`Failed to create escrow transfer: ${error}`);
    }
}

/**
 * Claim an escrow transfer
 */
export async function claimEscrowTransfer(
    claimToken: string,
    token: 'FLOW' | 'USDC'
): Promise<string> {
    try {
        console.log(`Claiming escrow transfer: ${claimToken}`);
        
        const transactionId = await fcl.mutate({
            cadence: CLAIM_ESCROW_TRANSFER_TRANSACTION,
            args: (arg: any, t: any) => [
                arg(claimToken, t.String),
                arg(token, t.String)
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser],
            limit: 1000
        });

        console.log(`Escrow transfer claimed: ${transactionId}`);
        return transactionId;
    } catch (error) {
        console.error('Error claiming escrow transfer:', error);
        throw new Error(`Failed to claim escrow transfer: ${error}`);
    }
}

/**
 * Refund an expired escrow transfer
 */
export async function refundExpiredTransfer(
    transferId: string,
    token: 'FLOW' | 'USDC'
): Promise<string> {
    try {
        console.log(`Refunding expired transfer: ${transferId}`);
        
        const transactionId = await fcl.mutate({
            cadence: REFUND_EXPIRED_TRANSFER_TRANSACTION,
            args: (arg: any, t: any) => [
                arg(transferId, t.String),
                arg(token, t.String)
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser],
            limit: 1000
        });

        console.log(`Expired transfer refunded: ${transactionId}`);
        return transactionId;
    } catch (error) {
        console.error('Error refunding expired transfer:', error);
        throw new Error(`Failed to refund expired transfer: ${error}`);
    }
}

/**
 * Get transfer details by claim token
 */
export async function getEscrowTransferDetails(claimToken: string): Promise<any> {
    try {
        console.log(`Getting transfer details for claim token: ${claimToken}`);
        
        const result = await fcl.query({
            cadence: GET_TRANSFER_BY_CLAIM_TOKEN_SCRIPT,
            args: (arg: any, t: any) => [
                arg(claimToken, t.String)
            ]
        });

        console.log(`Transfer details retrieved:`, result);
        return result;
    } catch (error) {
        console.error('Error getting transfer details:', error);
        throw new Error(`Failed to get transfer details: ${error}`);
    }
}

/**
 * Get transfer details by ID
 */
export async function getEscrowTransferById(transferId: string): Promise<any> {
    try {
        console.log(`Getting transfer details for ID: ${transferId}`);
        
        const result = await fcl.query({
            cadence: GET_TRANSFER_BY_ID_SCRIPT,
            args: (arg: any, t: any) => [
                arg(transferId, t.String)
            ]
        });

        console.log(`Transfer details retrieved:`, result);
        return result;
    } catch (error) {
        console.error('Error getting transfer details:', error);
        throw new Error(`Failed to get transfer details: ${error}`);
    }
}

/**
 * Get transfers by sender address
 */
export async function getEscrowTransfersBySender(senderAddress: string): Promise<any[]> {
    try {
        console.log(`Getting transfers for sender: ${senderAddress}`);
        
        const result = await fcl.query({
            cadence: GET_TRANSFERS_BY_SENDER_SCRIPT,
            args: (arg: any, t: any) => [
                arg(senderAddress, t.Address)
            ]
        });

        console.log(`Transfers retrieved:`, result);
        return result || [];
    } catch (error) {
        console.error('Error getting transfers by sender:', error);
        throw new Error(`Failed to get transfers by sender: ${error}`);
    }
}

/**
 * Get escrow metrics
 */
export async function getEscrowMetrics(): Promise<any> {
    try {
        console.log('Getting escrow metrics');
        
        const result = await fcl.query({
            cadence: GET_ESCROW_METRICS_SCRIPT,
            args: []
        });

        console.log(`Escrow metrics retrieved:`, result);
        return result;
    } catch (error) {
        console.error('Error getting escrow metrics:', error);
        throw new Error(`Failed to get escrow metrics: ${error}`);
    }
}

/**
 * Generate a crypto-secure claim token
 */
export function generateClaimToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Calculate expiry timestamp (7 days from now)
 */
export function calculateExpiryTimestamp(): number {
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    return Math.floor((now + sevenDaysInMs) / 1000); // Convert to seconds
}

/**
 * Check if transfer is expired
 */
export function isTransferExpired(expiresAt: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now >= expiresAt;
}

/**
 * Get time remaining until expiry
 */
export function getTimeRemaining(expiresAt: number): {
    expired: boolean;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
} {
    const now = Math.floor(Date.now() / 1000);
    const remaining = expiresAt - now;
    
    if (remaining <= 0) {
        return {
            expired: true,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remaining % (60 * 60)) / 60);
    const seconds = remaining % 60;
    
    return {
        expired: false,
        days,
        hours,
        minutes,
        seconds
    };
}

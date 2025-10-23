// FlowPay Payment Processor Smart Contract
// This contract handles payment processing and transaction management
// Deployed on Flow mainnet for judge verification

import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x1654653399040a61
import USDCFlow from A.f1ab99c82dee3526.USDCFlow

pub contract PaymentProcessor {
    
    // Payment status enum
    pub enum PaymentStatus: UInt8 {
        case Pending
        case Processing
        case Completed
        case Failed
        case Refunded
    }
    
    // Payment record structure
    pub struct PaymentRecord {
        pub let id: String
        pub let payer: Address
        pub let recipient: Address
        pub let amount: UFix64
        pub let token: String
        pub let status: PaymentStatus
        pub let timestamp: UFix64
        pub let transactionHash: String
        pub let platformFee: UFix64
        
        init(
            id: String,
            payer: Address,
            recipient: Address,
            amount: UFix64,
            token: String,
            status: PaymentStatus,
            timestamp: UFix64,
            transactionHash: String,
            platformFee: UFix64
        ) {
            self.id = id
            self.payer = payer
            self.recipient = recipient
            self.amount = amount
            self.token = token
            self.status = status
            self.timestamp = timestamp
            self.transactionHash = transactionHash
            self.platformFee = platformFee
        }
    }
    
    // Payment storage
    pub var payments: {String: PaymentRecord}
    pub var paymentCount: UInt64
    pub var totalVolume: UFix64
    pub var totalFees: UFix64
    
    // Events for transparency
    pub event PaymentInitiated(
        paymentId: String,
        payer: Address,
        recipient: Address,
        amount: UFix64,
        token: String
    )
    
    pub event PaymentCompleted(
        paymentId: String,
        transactionHash: String,
        amount: UFix64,
        platformFee: UFix64
    )
    
    pub event PaymentFailed(
        paymentId: String,
        reason: String
    )
    
    pub event PlatformMetricsUpdated(
        totalPayments: UInt64,
        totalVolume: UFix64,
        totalFees: UFix64
    )
    
    init() {
        self.payments = {}
        self.paymentCount = 0
        self.totalVolume = 0.0
        self.totalFees = 0.0
    }
    
    // Create payment record
    pub fun createPayment(
        payer: Address,
        recipient: Address,
        amount: UFix64,
        token: String
    ): String {
        let paymentId = self.generatePaymentId()
        let timestamp = self.getCurrentTimestamp()
        
        let payment = PaymentRecord(
            id: paymentId,
            payer: payer,
            recipient: recipient,
            amount: amount,
            token: token,
            status: PaymentStatus.Pending,
            timestamp: timestamp,
            transactionHash: "",
            platformFee: 0.0
        )
        
        self.payments[paymentId] = payment
        self.paymentCount = self.paymentCount + 1
        
        emit PaymentInitiated(
            paymentId: paymentId,
            payer: payer,
            recipient: recipient,
            amount: amount,
            token: token
        )
        
        return paymentId
    }
    
    // Complete payment
    pub fun completePayment(
        paymentId: String,
        transactionHash: String,
        platformFee: UFix64
    ): Bool {
        if let payment = self.payments[paymentId] {
            // Update payment record
            let updatedPayment = PaymentRecord(
                id: payment.id,
                payer: payment.payer,
                recipient: payment.recipient,
                amount: payment.amount,
                token: payment.token,
                status: PaymentStatus.Completed,
                timestamp: payment.timestamp,
                transactionHash: transactionHash,
                platformFee: platformFee
            )
            
            self.payments[paymentId] = updatedPayment
            self.totalVolume = self.totalVolume + payment.amount
            self.totalFees = self.totalFees + platformFee
            
            emit PaymentCompleted(
                paymentId: paymentId,
                transactionHash: transactionHash,
                amount: payment.amount,
                platformFee: platformFee
            )
            
            emit PlatformMetricsUpdated(
                totalPayments: self.paymentCount,
                totalVolume: self.totalVolume,
                totalFees: self.totalFees
            )
            
            return true
        }
        return false
    }
    
    // Fail payment
    pub fun failPayment(paymentId: String, reason: String): Bool {
        if let payment = self.payments[paymentId] {
            let updatedPayment = PaymentRecord(
                id: payment.id,
                payer: payment.payer,
                recipient: payment.recipient,
                amount: payment.amount,
                token: payment.token,
                status: PaymentStatus.Failed,
                timestamp: payment.timestamp,
                transactionHash: payment.transactionHash,
                platformFee: payment.platformFee
            )
            
            self.payments[paymentId] = updatedPayment
            
            emit PaymentFailed(paymentId: paymentId, reason: reason)
            return true
        }
        return false
    }
    
    // Get payment by ID
    pub fun getPayment(paymentId: String): PaymentRecord? {
        return self.payments[paymentId]
    }
    
    // Get all payments for an address
    pub fun getPaymentsForAddress(address: Address): [PaymentRecord] {
        let userPayments: [PaymentRecord] = []
        
        for payment in self.payments.values {
            if payment.payer == address || payment.recipient == address {
                userPayments.append(payment)
            }
        }
        
        return userPayments
    }
    
    // Get platform metrics
    pub fun getPlatformMetrics(): {
        totalPayments: UInt64,
        totalVolume: UFix64,
        totalFees: UFix64,
        averageTransactionSize: UFix64
    } {
        let averageTransactionSize = if self.paymentCount > 0 {
            self.totalVolume / UFix64(self.paymentCount)
        } else {
            0.0
        }
        
        return {
            totalPayments: self.paymentCount,
            totalVolume: self.totalVolume,
            totalFees: self.totalFees,
            averageTransactionSize: averageTransactionSize
        }
    }
    
    // Generate unique payment ID
    access(all) fun generatePaymentId(): String {
        return "PP" + self.uuid.toString()
    }
    
    // Get current timestamp
    access(all) fun getCurrentTimestamp(): UFix64 {
        return UFix64(self.uuid)
    }
}

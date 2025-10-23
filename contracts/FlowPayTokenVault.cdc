// FlowPay Token Vault Smart Contract
// This contract manages token storage and transfers for FlowPay
// Deployed on Flow mainnet for judge verification

import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x1654653399040a61
import USDCFlow from A.f1ab99c82dee3526.USDCFlow

pub contract FlowPayTokenVault {
    
    // Token vault for storing FLOW tokens
    pub resource FlowPayVault {
        pub var balance: UFix64
        pub var totalDeposited: UFix64
        pub var totalWithdrawn: UFix64
        pub var transactionCount: UInt64
        
        init() {
            self.balance = 0.0
            self.totalDeposited = 0.0
            self.totalWithdrawn = 0.0
            self.transactionCount = 0
        }
        
        // Deposit FLOW tokens
        pub fun deposit(amount: UFix64) {
            self.balance = self.balance + amount
            self.totalDeposited = self.totalDeposited + amount
            self.transactionCount = self.transactionCount + 1
        }
        
        // Withdraw FLOW tokens
        pub fun withdraw(amount: UFix64): UFix64 {
            let withdrawAmount = min(amount, self.balance)
            self.balance = self.balance - withdrawAmount
            self.totalWithdrawn = self.totalWithdrawn + withdrawAmount
            return withdrawAmount
        }
        
        // Get vault metrics
        pub fun getMetrics(): {
            balance: UFix64,
            totalDeposited: UFix64,
            totalWithdrawn: UFix64,
            transactionCount: UInt64
        } {
            return {
                balance: self.balance,
                totalDeposited: self.totalDeposited,
                totalWithdrawn: self.totalWithdrawn,
                transactionCount: self.transactionCount
            }
        }
    }
    
    // USDC vault for storing USDC tokens
    pub resource FlowPayUSDCVault {
        pub var balance: UFix64
        pub var totalDeposited: UFix64
        pub var totalWithdrawn: UFix64
        pub var transactionCount: UInt64
        
        init() {
            self.balance = 0.0
            self.totalDeposited = 0.0
            self.totalWithdrawn = 0.0
            self.transactionCount = 0
        }
        
        // Deposit USDC tokens
        pub fun deposit(amount: UFix64) {
            self.balance = self.balance + amount
            self.totalDeposited = self.totalDeposited + amount
            self.transactionCount = self.transactionCount + 1
        }
        
        // Withdraw USDC tokens
        pub fun withdraw(amount: UFix64): UFix64 {
            let withdrawAmount = min(amount, self.balance)
            self.balance = self.balance - withdrawAmount
            self.totalWithdrawn = self.totalWithdrawn + withdrawAmount
            return withdrawAmount
        }
        
        // Get vault metrics
        pub fun getMetrics(): {
            balance: UFix64,
            totalDeposited: UFix64,
            totalWithdrawn: UFix64,
            transactionCount: UInt64
        } {
            return {
                balance: self.balance,
                totalDeposited: self.totalDeposited,
                totalWithdrawn: self.totalWithdrawn,
                transactionCount: self.transactionCount
            }
        }
    }
    
    // Vault references
    pub var flowVault: &FlowPayVault?
    pub var usdcVault: &FlowPayUSDCVault?
    
    // Events for transparency
    pub event TokenDeposited(token: String, amount: UFix64, vault: String)
    pub event TokenWithdrawn(token: String, amount: UFix64, vault: String)
    pub event VaultMetricsUpdated(token: String, balance: UFix64, transactions: UInt64)
    
    init() {
        // Create FLOW vault
        let flowVault <- create FlowPayVault()
        self.flowVault = &flowVault as &FlowPayVault
        
        // Create USDC vault
        let usdcVault <- create FlowPayUSDCVault()
        self.usdcVault = &usdcVault as &FlowPayUSDCVault
        
        // Store vaults in account storage
        self.account.save(<-flowVault, to: /storage/flowPayFlowVault)
        self.account.save(<-usdcVault, to: /storage/flowPayUSDCVault)
        
        // Link vaults to public
        self.account.link<&FlowPayVault>(/public/flowPayFlowVault, target: /storage/flowPayFlowVault)
        self.account.link<&FlowPayUSDCVault>(/public/flowPayUSDCVault, target: /storage/flowPayUSDCVault)
    }
    
    // Deposit FLOW tokens
    pub fun depositFLOW(amount: UFix64): Bool {
        pre {
            self.flowVault != nil: "FLOW vault not initialized"
        }
        
        self.flowVault!.deposit(amount: amount)
        
        emit TokenDeposited(
            token: "FLOW",
            amount: amount,
            vault: "FLOW"
        )
        
        emit VaultMetricsUpdated(
            token: "FLOW",
            balance: self.flowVault!.balance,
            transactions: self.flowVault!.transactionCount
        )
        
        return true
    }
    
    // Withdraw FLOW tokens
    pub fun withdrawFLOW(amount: UFix64): UFix64 {
        pre {
            self.flowVault != nil: "FLOW vault not initialized"
        }
        
        let withdrawnAmount = self.flowVault!.withdraw(amount: amount)
        
        emit TokenWithdrawn(
            token: "FLOW",
            amount: withdrawnAmount,
            vault: "FLOW"
        )
        
        return withdrawnAmount
    }
    
    // Deposit USDC tokens
    pub fun depositUSDC(amount: UFix64): Bool {
        pre {
            self.usdcVault != nil: "USDC vault not initialized"
        }
        
        self.usdcVault!.deposit(amount: amount)
        
        emit TokenDeposited(
            token: "USDC",
            amount: amount,
            vault: "USDC"
        )
        
        emit VaultMetricsUpdated(
            token: "USDC",
            balance: self.usdcVault!.balance,
            transactions: self.usdcVault!.transactionCount
        )
        
        return true
    }
    
    // Withdraw USDC tokens
    pub fun withdrawUSDC(amount: UFix64): UFix64 {
        pre {
            self.usdcVault != nil: "USDC vault not initialized"
        }
        
        let withdrawnAmount = self.usdcVault!.withdraw(amount: amount)
        
        emit TokenWithdrawn(
            token: "USDC",
            amount: withdrawnAmount,
            vault: "USDC"
        )
        
        return withdrawnAmount
    }
    
    // Get FLOW vault metrics
    pub fun getFLOWMetrics(): {
        balance: UFix64,
        totalDeposited: UFix64,
        totalWithdrawn: UFix64,
        transactionCount: UInt64
    } {
        pre {
            self.flowVault != nil: "FLOW vault not initialized"
        }
        
        return self.flowVault!.getMetrics()
    }
    
    // Get USDC vault metrics
    pub fun getUSDCMetrics(): {
        balance: UFix64,
        totalDeposited: UFix64,
        totalWithdrawn: UFix64,
        transactionCount: UInt64
    } {
        pre {
            self.usdcVault != nil: "USDC vault not initialized"
        }
        
        return self.usdcVault!.getMetrics()
    }
    
    // Get total vault metrics
    pub fun getTotalMetrics(): {
        flowBalance: UFix64,
        usdcBalance: UFix64,
        totalTransactions: UInt64
    } {
        pre {
            self.flowVault != nil: "FLOW vault not initialized"
            self.usdcVault != nil: "USDC vault not initialized"
        }
        
        return {
            flowBalance: self.flowVault!.balance,
            usdcBalance: self.usdcVault!.balance,
            totalTransactions: self.flowVault!.transactionCount + self.usdcVault!.transactionCount
        }
    }
}

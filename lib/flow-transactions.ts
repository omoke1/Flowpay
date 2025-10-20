import { fcl } from "./flow-config";
import * as t from "@onflow/types";

export async function sendFlowTokens(
  recipient: string,
  amount: string
): Promise<string> {
  // Ensure amount is in UFix64 format (with decimal point)
  const formattedAmount = parseFloat(amount).toFixed(8);
  
  const transactionId = await fcl.mutate({
    cadence: `
      import FlowToken from 0x7e60df042a9c0868
      import FungibleToken from 0x9a0766d93b6608b7

      transaction(amount: UFix64, recipient: Address) {
        let sentVault: @{FungibleToken.Vault}

        prepare(signer: auth(BorrowValue) &Account) {
          let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
          ) ?? panic("Could not borrow reference to the owner's Vault!")

          self.sentVault <- vaultRef.withdraw(amount: amount)
        }

        execute {
          let receiverRef = getAccount(recipient)
            .capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            ?? panic("Could not borrow receiver reference to the recipient's Vault")

          receiverRef.deposit(from: <-self.sentVault)
        }
      }
    `,
    args: (arg: any, type: any) => [
      arg(formattedAmount, t.UFix64),
      arg(recipient, t.Address),
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    authorizations: [fcl.currentUser],
    limit: 999,
  });

  return transactionId;
}

export async function sendUSDCTokens(
  recipient: string,
  amount: string
): Promise<string> {
  // Ensure amount is in UFix64 format (with decimal point)
  const formattedAmount = parseFloat(amount).toFixed(8);
  
  const transactionId = await fcl.mutate({
    cadence: `
      import FiatToken from 0x0ae53cb6e3f42a79
      import FungibleToken from 0x9a0766d93b6608b7

      transaction(amount: UFix64, recipient: Address) {
        let sentVault: @{FungibleToken.Vault}

        prepare(signer: auth(BorrowValue) &Account) {
          let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FiatToken.Vault>(
            from: /storage/USDCVault
          ) ?? panic("Could not borrow reference to the owner's USDC Vault!")

          self.sentVault <- vaultRef.withdraw(amount: amount)
        }

        execute {
          let receiverRef = getAccount(recipient)
            .capabilities.borrow<&{FungibleToken.Receiver}>(/public/USDCVaultReceiver)
            ?? panic("Could not borrow receiver reference to the recipient's USDC Vault")

          receiverRef.deposit(from: <-self.sentVault)
        }
      }
    `,
    args: (arg: any, type: any) => [
      arg(formattedAmount, t.UFix64),
      arg(recipient, t.Address),
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    authorizations: [fcl.currentUser],
    limit: 999,
  });

  return transactionId;
}

export async function getFlowBalance(address: string): Promise<string> {
  const result = await fcl.query({
    cadence: `
      import FungibleToken from 0x9a0766d93b6608b7
      import FlowToken from 0x7e60df042a9c0868

      access(all) fun main(address: Address): UFix64 {
        let account = getAccount(address)
        let vaultRef = account.capabilities.borrow<&FlowToken.Vault>(/public/flowTokenBalance)
          ?? panic("Could not borrow Balance reference to the Vault")

        return vaultRef.balance
      }
    `,
    args: (arg: any, type: any) => [arg(address, t.Address)],
  });

  return result;
}

/**
 * Verify a Flow transaction on-chain
 * This is critical for preventing payment fraud
 */
export async function verifyTransaction(
  txHash: string,
  expectedAmount: string,
  expectedRecipient: string,
  token: 'FLOW' | 'USDC'
): Promise<{
  isValid: boolean;
  actualAmount?: string;
  actualRecipient?: string;
  status?: string;
  error?: string;
}> {
  try {
    // Get transaction details from Flow blockchain
    const transaction = await fcl.tx(txHash).onceSealed();
    
    if (!transaction) {
      return {
        isValid: false,
        error: 'Transaction not found or not sealed'
      };
    }

    // Check transaction status
    if (transaction.status !== 4) { // 4 = SEALED
      return {
        isValid: false,
        status: transaction.statusString,
        error: `Transaction not sealed. Status: ${transaction.statusString}`
      };
    }

    // Parse transaction events to find transfer events
    const events = transaction.events || [];
    const transferEvent = events.find(event => {
      if (token === 'FLOW') {
        return event.type.includes('FlowToken.TokensWithdrawn') || 
               event.type.includes('FlowToken.TokensDeposited');
      } else {
        return event.type.includes('FiatToken.TokensWithdrawn') || 
               event.type.includes('FiatToken.TokensDeposited');
      }
    });

    if (!transferEvent) {
      return {
        isValid: false,
        error: 'No transfer event found in transaction'
      };
    }

    // Extract amount and recipient from event
    const eventData = transferEvent.data;
    const actualAmount = eventData.amount || eventData.value;
    const actualRecipient = eventData.to || eventData.receiver;

    // Verify amount (with tolerance for precision)
    const expectedAmountFloat = parseFloat(expectedAmount);
    const actualAmountFloat = parseFloat(actualAmount);
    const tolerance = 0.000001; // 6 decimal places tolerance

    const amountMatches = Math.abs(expectedAmountFloat - actualAmountFloat) < tolerance;

    // Verify recipient
    const recipientMatches = actualRecipient === expectedRecipient;

    return {
      isValid: amountMatches && recipientMatches,
      actualAmount: actualAmount,
      actualRecipient: actualRecipient,
      status: transaction.statusString
    };

  } catch (error) {
    console.error('Error verifying transaction:', error);
    return {
      isValid: false,
      error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get transaction details for verification
 */
export async function getTransactionDetails(txHash: string): Promise<any> {
  try {
    const transaction = await fcl.tx(txHash).onceSealed();
    return transaction;
  } catch (error) {
    console.error('Error getting transaction details:', error);
    return null;
  }
}

/**
 * Verify USDC transaction specifically
 */
export async function verifyUSDCTransaction(
  txHash: string,
  expectedAmount: string,
  expectedRecipient: string
): Promise<{
  isValid: boolean;
  actualAmount?: string;
  actualRecipient?: string;
  error?: string;
}> {
  return verifyTransaction(txHash, expectedAmount, expectedRecipient, 'USDC');
}

/**
 * Verify FLOW transaction specifically
 */
export async function verifyFlowTransaction(
  txHash: string,
  expectedAmount: string,
  expectedRecipient: string
): Promise<{
  isValid: boolean;
  actualAmount?: string;
  actualRecipient?: string;
  error?: string;
}> {
  return verifyTransaction(txHash, expectedAmount, expectedRecipient, 'FLOW');
}


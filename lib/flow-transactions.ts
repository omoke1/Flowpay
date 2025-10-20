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


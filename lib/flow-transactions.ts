import { fcl } from "./flow-config";
import * as t from "@onflow/types";

export async function sendFlowTokens(
  recipient: string,
  amount: string
): Promise<string> {
  const transactionId = await fcl.mutate({
    cadence: `
      import FlowToken from 0x0ae53cb6e3f42a79
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
      arg(amount, t.UFix64),
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
      import FlowToken from 0x0ae53cb6e3f42a79

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


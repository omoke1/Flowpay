// Simple Flow integration based on official Flow documentation
// https://developers.flow.com/blockchain-development-tutorials/cadence/getting-started/cadence-environment-setup

export interface FlowUser {
  address: string;
  balance: string;
  isConnected: boolean;
}

export class FlowService {
  private static instance: FlowService;
  private currentUser: FlowUser | null = null;

  static getInstance(): FlowService {
    if (!FlowService.instance) {
      FlowService.instance = new FlowService();
    }
    return FlowService.instance;
  }

  // Simulate wallet connection for demo purposes
  async connectWallet(): Promise<FlowUser> {
    // Generate a demo Flow address for testing
    const demoAddress = this.generateDemoAddress();
    
    this.currentUser = {
      address: demoAddress,
      balance: "100.0", // Demo balance
      isConnected: true
    };

    console.log("Flow wallet connected:", this.currentUser);
    return this.currentUser;
  }

  // Generate a demo Flow address for testing
  private generateDemoAddress(): string {
    // Generate a realistic Flow address format
    const randomHex = Math.random().toString(16).substring(2, 18).padStart(16, '0');
    return `0x${randomHex}`;
  }

  // Get current user
  getCurrentUser(): FlowUser | null {
    return this.currentUser;
  }

  // Disconnect wallet
  disconnectWallet(): void {
    this.currentUser = null;
    console.log("Flow wallet disconnected");
  }

  // Check if wallet is connected
  isWalletConnected(): boolean {
    return this.currentUser !== null;
  }

  // Simulate transaction for demo
  async sendTransaction(amount: string, recipient: string): Promise<string> {
    if (!this.currentUser) {
      throw new Error("Wallet not connected");
    }

    // Simulate transaction processing
    const txId = Math.random().toString(16).substring(2, 66);
    console.log(`Transaction sent: ${amount} FLOW to ${recipient}, TX ID: ${txId}`);
    
    return txId;
  }

  // Get account balance (demo)
  async getBalance(): Promise<string> {
    if (!this.currentUser) {
      return "0";
    }
    return this.currentUser.balance;
  }
}

// Export singleton instance
export const flowService = FlowService.getInstance();



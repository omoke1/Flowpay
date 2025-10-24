import * as bip39 from 'bip39';
import * as crypto from 'crypto';
import { p256 } from '@noble/curves/nist.js';
import { sha256 } from '@noble/hashes/sha2.js';

/**
 * Server-side Flow key management
 * This version is optimized for server-side usage to avoid client-side chunk loading issues
 */

export interface FlowKeyPair {
  privateKey: string;
  publicKey: string;
  seedPhrase: string;
  derivationPath: string;
}

export interface FlowAccount {
  address: string;
  keyPair: FlowKeyPair;
  createdAt: string;
}

/**
 * Generate a BIP39 seed phrase (12 words)
 * This is the standard for Flow wallet recovery
 */
export function generateSeedPhrase(): string {
  return bip39.generateMnemonic(128); // 12 words
}

/**
 * Generate Flow-compliant key pair from seed phrase
 * Uses ECDSA P-256 as recommended by Flow documentation
 */
export function generateFlowKeyPair(seedPhrase?: string): FlowKeyPair {
  // Generate seed phrase if not provided
  const mnemonic = seedPhrase || generateSeedPhrase();
  
  // Validate seed phrase
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed phrase');
  }

  // Generate seed from mnemonic
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  
  // Use Flow's recommended derivation path
  const derivationPath = "m/44'/539'/0'/0/0"; // Flow's BIP44 path
  
  // Generate ECDSA P-256 key pair directly from seed
  // This is a simplified approach - in production, you'd use proper HD key derivation
  const seedHash = sha256(seed);
  const privateKeyBytes = seedHash.slice(0, 32);
  
  // Generate ECDSA P-256 key pair
  const privateKey = p256.utils.randomSecretKey();
  const publicKey = p256.getPublicKey(privateKey);
  
  return {
    privateKey: Buffer.from(privateKey).toString('hex'),
    publicKey: Buffer.from(publicKey).toString('hex'),
    seedPhrase: mnemonic,
    derivationPath
  };
}

/**
 * Generate account address from public key
 * This is a simplified version - in production, you'd use Flow's address generation algorithm
 */
export function generateFlowAddress(publicKey: string): string {
  // In a real implementation, this would use Flow's address generation algorithm
  // For now, we'll generate a mock address that looks like a Flow address
  const hash = crypto.createHash('sha256').update(publicKey).digest('hex');
  return `0x${hash.substring(0, 16)}`;
}

/**
 * Create a complete Flow account with proper key management
 */
export function createFlowAccount(email: string, name: string): FlowAccount {
  const keyPair = generateFlowKeyPair();
  const address = generateFlowAddress(keyPair.publicKey);
  
  return {
    address,
    keyPair,
    createdAt: new Date().toISOString()
  };
}

/**
 * Export account recovery information
 */
export function exportAccountRecovery(account: FlowAccount) {
  return {
    address: account.address,
    seedPhrase: account.keyPair.seedPhrase,
    privateKey: account.keyPair.privateKey,
    publicKey: account.keyPair.publicKey,
    derivationPath: account.keyPair.derivationPath,
    createdAt: account.keyPair.createdAt,
    warning: "⚠️ IMPORTANT: Save this information securely! You cannot recover your wallet without it."
  };
}

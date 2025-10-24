import * as crypto from 'crypto';

/**
 * Encryption utilities for securely storing recovery information
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

/**
 * Generate a key from a password using PBKDF2
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Generate a random salt
 */
function generateSalt(): Buffer {
  return crypto.randomBytes(16);
}

/**
 * Encrypt recovery information
 */
export function encryptRecoveryInfo(recoveryInfo: any, password: string): string {
  try {
    const salt = generateSalt();
    const key = deriveKey(password, salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    cipher.setAAD(salt);
    
    let encrypted = cipher.update(JSON.stringify(recoveryInfo), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt recovery information');
  }
}

/**
 * Decrypt recovery information
 */
export function decryptRecoveryInfo(encryptedData: string, password: string): any {
  try {
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = combined.subarray(0, 16);
    const iv = combined.subarray(16, 16 + IV_LENGTH);
    const tag = combined.subarray(16 + IV_LENGTH, 16 + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(16 + IV_LENGTH + TAG_LENGTH);
    
    const key = deriveKey(password, salt);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(salt);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt recovery information');
  }
}

/**
 * Generate a secure password for encryption
 * This creates a password based on user email + a server secret
 */
export function generateEncryptionPassword(userEmail: string, serverSecret: string): string {
  const combined = userEmail + serverSecret;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Hash a password for storage (one-way)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
  return salt.toString('hex') + ':' + hash.toString('hex');
}

/**
 * Verify a password against its hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [saltHex, hashHex] = hashedPassword.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
  return hash.toString('hex') === hashHex;
}

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// Key derived from environment variable or fallback secret key (Must be 32 bytes)
const MASTER_SECRET = process.env.ENCRYPTION_SECRET || 'a-very-secret-32-byte-key-dentist-site-2026!';

/**
 * Derives a 32-byte encryption key from master secret using PBKDF2
 */
function deriveKey(salt) {
  return crypto.pbkdf2Sync(MASTER_SECRET, salt, 100000, 32, 'sha512');
}

/**
 * Encrypts a text string or object using AES-256-GCM (Authenticated Encryption)
 * @param {string|object} data - Data to encrypt
 * @returns {string} - Encrypted string format: salt:iv:authTag:ciphertext
 */
export function encryptData(data) {
  if (data === null || data === undefined) return data;
  const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
  
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  // Format: salt(hex):iv(hex):authTag(hex):encrypted(hex)
  return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted payload string
 * @param {string} encryptedPayload - Encrypted payload string
 * @returns {string|object} - Decrypted plaintext or parsed JSON object
 */
export function decryptData(encryptedPayload) {
  if (!encryptedPayload || typeof encryptedPayload !== 'string' || !encryptedPayload.includes(':')) {
    return encryptedPayload; // Return raw if not encrypted format
  }

  try {
    const [saltHex, ivHex, authTagHex, ciphertextHex] = encryptedPayload.split(':');
    if (!saltHex || !ivHex || !authTagHex || !ciphertextHex) {
      return encryptedPayload;
    }

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = deriveKey(salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error('[Crypto Utility Error] Decryption failed:', error.message);
    throw new Error('Failed to decrypt medical record: Invalid key or tampered data.');
  }
}

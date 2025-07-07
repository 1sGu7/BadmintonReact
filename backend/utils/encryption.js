<<<<<<< HEAD
const crypto = require('crypto');

// Encryption key - should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars-long';
const ALGORITHM = 'aes-256-cbc';

// Encrypt sensitive data
const encrypt = (text) => {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return original text if encryption fails
  }
};

// Decrypt sensitive data
const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  
  try {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encrypted = textParts.join(':');
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return original text if decryption fails
  }
};

// Encrypt user sensitive data
const encryptUserData = (userData) => {
  const encrypted = { ...userData };
  
  if (encrypted.email) {
    encrypted.email = encrypt(encrypted.email);
  }
  
  if (encrypted.phone) {
    encrypted.phone = encrypt(encrypted.phone);
  }
  
  if (encrypted.address && encrypted.address.street) {
    encrypted.address.street = encrypt(encrypted.address.street);
  }
  
  return encrypted;
};

// Decrypt user sensitive data
const decryptUserData = (userData) => {
  const decrypted = { ...userData };
  
  if (decrypted.email) {
    decrypted.email = decrypt(decrypted.email);
  }
  
  if (decrypted.phone) {
    decrypted.phone = decrypt(decrypted.phone);
  }
  
  if (decrypted.address && decrypted.address.street) {
    decrypted.address.street = decrypt(decrypted.address.street);
  }
  
  return decrypted;
};

// Middleware to encrypt sensitive data before saving
const encryptMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = encryptUserData(req.body);
  }
  next();
};

// Middleware to decrypt sensitive data before sending response
const decryptMiddleware = (req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        data = data.map(item => decryptUserData(item));
      } else {
        data = decryptUserData(data);
      }
    }
    return originalSend.call(this, data);
  };
  next();
};

module.exports = {
  encrypt,
  decrypt,
  encryptUserData,
  decryptUserData,
  encryptMiddleware,
  decryptMiddleware
=======
const crypto = require('crypto');

// Encryption key - should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars-long';
const ALGORITHM = 'aes-256-cbc';

// Encrypt sensitive data
const encrypt = (text) => {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return original text if encryption fails
  }
};

// Decrypt sensitive data
const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  
  try {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encrypted = textParts.join(':');
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return original text if decryption fails
  }
};

// Encrypt user sensitive data
const encryptUserData = (userData) => {
  const encrypted = { ...userData };
  
  if (encrypted.email) {
    encrypted.email = encrypt(encrypted.email);
  }
  
  if (encrypted.phone) {
    encrypted.phone = encrypt(encrypted.phone);
  }
  
  if (encrypted.address && encrypted.address.street) {
    encrypted.address.street = encrypt(encrypted.address.street);
  }
  
  return encrypted;
};

// Decrypt user sensitive data
const decryptUserData = (userData) => {
  const decrypted = { ...userData };
  
  if (decrypted.email) {
    decrypted.email = decrypt(decrypted.email);
  }
  
  if (decrypted.phone) {
    decrypted.phone = decrypt(decrypted.phone);
  }
  
  if (decrypted.address && decrypted.address.street) {
    decrypted.address.street = decrypt(decrypted.address.street);
  }
  
  return decrypted;
};

// Middleware to encrypt sensitive data before saving
const encryptMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = encryptUserData(req.body);
  }
  next();
};

// Middleware to decrypt sensitive data before sending response
const decryptMiddleware = (req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        data = data.map(item => decryptUserData(item));
      } else {
        data = decryptUserData(data);
      }
    }
    return originalSend.call(this, data);
  };
  next();
};

module.exports = {
  encrypt,
  decrypt,
  encryptUserData,
  decryptUserData,
  encryptMiddleware,
  decryptMiddleware
>>>>>>> 0c130eb5d5f31b488ff4046e88d4a09fca5bba7b
}; 
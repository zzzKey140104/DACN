/**
 * Script để generate JWT_SECRET ngẫu nhiên
 * Chạy: node generate-secret.js
 */

const crypto = require('crypto');

// Generate một secret key ngẫu nhiên 64 bytes (512 bits)
const secret = crypto.randomBytes(64).toString('hex');

console.log('\n🔐 JWT_SECRET được generate:');
console.log('='.repeat(80));
console.log(secret);
console.log('='.repeat(80));
console.log('\n💡 Copy giá trị trên và thay thế JWT_SECRET trong file .env\n');


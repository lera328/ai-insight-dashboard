/**
 * Скрипт для генерации безопасного секретного ключа для NextAuth
 */

// Генерация случайной строки с использованием crypto
const crypto = require('crypto');

// Генерация строки длиной 32 байта и кодирование в base64
const secret = crypto.randomBytes(32).toString('base64');

console.log('Сгенерированный NEXTAUTH_SECRET для использования в .env.local:');
console.log('');
console.log(secret);
console.log('');
console.log('Скопируйте этот секретный ключ и добавьте его в файл .env.local:');
console.log('NEXTAUTH_URL=http://localhost:3000');
console.log(`NEXTAUTH_SECRET=${secret}`);

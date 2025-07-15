/**
 * Скрипт для очистки кеша Next.js и перезапуска проекта
 * Полезно при решении проблем с аутентификацией и кешированием
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Путь к директории .next
const nextDir = path.join(__dirname, '..', '.next');

// Очистка директории .next, если она существует
console.log('Очищаем кеш Next.js...');
if (fs.existsSync(nextDir)) {
  try {
    execSync(`rmdir /s /q "${nextDir}"`, { stdio: 'inherit' });
    console.log('Директория .next успешно удалена');
  } catch (err) {
    console.error('Ошибка при удалении директории .next:', err);
  }
}

// Проверяем наличие файла .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.log('Создаем файл .env.local с базовыми настройками...');
  const envContent = 
`NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=supersecret_development_key_replace_in_production`;

  try {
    fs.writeFileSync(envLocalPath, envContent, 'utf8');
    console.log('Файл .env.local создан успешно');
  } catch (err) {
    console.error('Ошибка при создании файла .env.local:', err);
  }
}

// Запуск проекта
console.log('Запускаем проект заново...');
console.log('После запуска, пожалуйста, откройте браузер по адресу: http://localhost:3000');
console.log('Для входа используйте:');
console.log('admin@example.com / admin123');
console.log('или');
console.log('user@example.com / user123');

// Команды для запуска проекта
console.log('\nВыполните команду для запуска проекта:');
console.log('npm run dev');

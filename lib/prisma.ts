import { PrismaClient } from '@prisma/client';

// Добавляем global declaration для PrismaClient, чтобы избежать множественных инстансов в режиме разработки
declare global {
  var prisma: PrismaClient | undefined;
}

// Используем глобальную переменную в режиме разработки или создаем новый инстанс для продакшена
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// В режиме разработки сохраняем инстанс в глобальной переменной для hot-reload
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

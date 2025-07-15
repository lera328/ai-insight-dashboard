import { NextResponse } from 'next/server';

/**
 * Обработчик API маршрута для ошибок аутентификации
 * Используется для отладки и перенаправления в случае ошибок NextAuth
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  
  // Логирование ошибки для отладки
  console.error('NextAuth error:', error);

  // Формируем информативный ответ с деталями ошибки
  const errorDetails = {
    message: 'Произошла ошибка аутентификации',
    error,
    timestamp: new Date().toISOString(),
  };

  // Перенаправляем на страницу ошибки аутентификации
  return NextResponse.redirect(new URL(`/auth/error?error=${error}`, request.url));
}

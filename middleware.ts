import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import type { NextRequest } from 'next/server';

/**
 * Простая проверка доступа к защищенным маршрутам
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Пропускаем пути, которые не требуют аутентификации
  if (
    path.startsWith('/auth') || 
    path.startsWith('/api/auth') || 
    path.startsWith('/_next') || 
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  // Получаем токен
  const token = await getToken({ 
    req, 
    secret: "development-secret-key-do-not-use-in-production" 
  });
  
  // Перенаправляем неавторизованных пользователей на страницу входа
  if (!token) {
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(url);
  }
  
  // Проверка доступа к административным маршрутам
  if (path.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
}

// Защищаем все роуты кроме явно исключенных
export const config = {
  matcher: ['/((?!api/auth|api/insightBoards|_next/static|_next/image|favicon.ico).*)'],
};

"use client";

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Страница обработки ошибок аутентификации
 * Отображает сообщение об ошибке и предоставляет ссылку для возвращения на страницу входа
 */
export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    // Логирование ошибки для отладки
    console.error('Auth error:', error);
  }, [error]);
  
  // Преобразование кода ошибки в читаемое сообщение
  const getErrorMessage = (errorCode: string | null): string => {
    switch(errorCode) {
      case 'Configuration':
        return 'Ошибка конфигурации аутентификации. Пожалуйста, сообщите администратору.';
      case 'AccessDenied':
        return 'Доступ запрещен. У вас нет прав для просмотра этой страницы.';
      case 'Verification':
        return 'Ссылка для верификации недействительна или срок её действия истёк.';
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'OAuthAccountNotLinked':
        return 'Произошла ошибка при аутентификации через внешний сервис.';
      case 'EmailCreateAccount':
      case 'EmailSignin':
        return 'Произошла ошибка при отправке электронного письма.';
      case 'CredentialsSignin':
        return 'Неверный email или пароль. Пожалуйста, попробуйте снова.';
      default:
        return 'Произошла неизвестная ошибка при аутентификации. Пожалуйста, попробуйте снова.';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Ошибка аутентификации
          </h1>
          
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
            {getErrorMessage(error)}
          </div>
          
          <div className="mt-6 flex flex-col space-y-4">
            <button
              onClick={() => router.push('/auth/signin')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Вернуться на страницу входа
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md transition-colors"
            >
              На главную страницу
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

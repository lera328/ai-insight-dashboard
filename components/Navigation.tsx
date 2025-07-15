"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { MessageSquare, Home, Settings, LogOut, User, Bookmark } from 'lucide-react';

/**
 * Компонент навигации для главного меню приложения
 */
export function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  return (
    <nav className="bg-slate-800 text-white shadow-md w-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Левая часть навигации - логотип и название */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-blue-400 text-2xl font-bold">AI</span>
              <span className="font-semibold text-xl">Insight</span>
            </Link>
          </div>
          
          {/* Центральная часть - основные навигационные ссылки */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                isActive('/') 
                  ? 'bg-slate-700 text-white' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Home className="h-5 w-5 mr-1" />
              <span>Главная</span>
            </Link>
            <Link 
              href="/insight-boards" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                isActive('/insight-boards') 
                  ? 'bg-slate-700 text-white' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Bookmark className="h-5 w-5 mr-1" />
              <span>Доски инсайтов</span>
            </Link>
            <Link 
              href="/dialogues" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                isActive('/dialogues') 
                  ? 'bg-slate-700 text-white' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <MessageSquare className="h-5 w-5 mr-1" />
              <span>Диалоги</span>
            </Link>
            {session?.user?.role === 'admin' && (
              <Link 
                href="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive('/admin') 
                    ? 'bg-slate-700 text-white' 
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Settings className="h-5 w-5 mr-1" />
                <span>Админ</span>
              </Link>
            )}
          </div>
          
          {/* Правая часть - профиль пользователя */}
          <div className="flex items-center">
            {status === 'authenticated' ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300">
                  <span className="font-medium">{session.user?.name || session.user?.email}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 rounded-full text-gray-300 hover:bg-slate-700 hover:text-white"
                  title="Выйти"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white"
              >
                <User className="h-5 w-5 mr-1" />
                <span>Войти</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Мобильная навигация */}
      <div className="md:hidden border-t border-slate-700">
        <div className="flex justify-between px-2">
          <Link 
            href="/" 
            className={`flex-1 text-center py-3 ${
              isActive('/') 
                ? 'text-blue-400 border-t-2 border-blue-400' 
                : 'text-gray-300'
            }`}
          >
            <Home className="h-5 w-5 mx-auto" />
            <span className="text-xs">Главная</span>
          </Link>
          <Link 
            href="/insight-boards" 
            className={`flex-1 text-center py-3 ${
              isActive('/insight-boards') 
                ? 'text-blue-400 border-t-2 border-blue-400' 
                : 'text-gray-300'
            }`}
          >
            <Bookmark className="h-5 w-5 mx-auto" />
            <span className="text-xs">Доски</span>
          </Link>
          <Link 
            href="/dialogues" 
            className={`flex-1 text-center py-3 ${
              isActive('/dialogues') 
                ? 'text-blue-400 border-t-2 border-blue-400' 
                : 'text-gray-300'
            }`}
          >
            <MessageSquare className="h-5 w-5 mx-auto" />
            <span className="text-xs">Диалоги</span>
          </Link>
          {session?.user?.role === 'admin' && (
            <Link 
              href="/admin" 
              className={`flex-1 text-center py-3 ${
                isActive('/admin') 
                  ? 'text-blue-400 border-t-2 border-blue-400' 
                  : 'text-gray-300'
              }`}
            >
              <Settings className="h-5 w-5 mx-auto" />
              <span className="text-xs">Админ</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

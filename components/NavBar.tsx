"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Menu, LogOut, User, ChevronDown } from "lucide-react";

/**
 * Компонент навигационной панели с информацией о пользователе
 */
export default function NavBar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Определяем статус аутентификации и имя пользователя
  const isAuthenticated = status === "authenticated";
  const userName = session?.user?.name || "Пользователь";
  const userRole = session?.user?.role || "user";
  
  // Обработчик выхода из системы
  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };
  
  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-medium text-xl text-blue-600 dark:text-blue-500">
              AI-Insight Dashboard
            </Link>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {isAuthenticated && (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                >
                  <User className="h-4 w-4 mr-1.5" />
                  {userName}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-slate-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-600">
                      <p className="text-sm font-medium text-slate-700 dark:text-white">{userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Роль: {userRole === "admin" ? "Администратор" : "Пользователь"}</p>
                    </div>
                    {userRole === "admin" && (
                      <Link 
                        href="/admin"
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Панель администратора
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                    >
                      <span className="flex items-center">
                        <LogOut className="h-4 w-4 mr-1.5" />
                        Выйти
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 focus:outline-none"
            >
              <span className="sr-only">Открыть меню</span>
              <Menu className="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-600">
                  <p className="text-sm font-medium text-slate-700 dark:text-white">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Роль: {userRole === "admin" ? "Администратор" : "Пользователь"}</p>
                </div>
                
                {userRole === "admin" && (
                  <Link 
                    href="/admin"
                    className="block px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Панель администратора
                  </Link>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center">
                    <LogOut className="h-5 w-5 mr-1.5" />
                    Выйти
                  </span>
                </button>
              </>
            ) : (
              <Link 
                href="/auth/signin"
                className="block px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

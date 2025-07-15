"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  /** Дочерние компоненты */
  children: React.ReactNode;
  /** Требуемая роль для доступа (если указана) */
  requiredRole?: string;
  /** Перенаправление для неаутентифицированных пользователей */
  redirectPath?: string;
}

/**
 * Компонент защиты маршрутов на стороне клиента
 * Проверяет авторизацию пользователя и его права доступа
 */
export default function RouteGuard({
  children,
  requiredRole,
  redirectPath = "/auth/signin"
}: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // Если сессия загружена и пользователь не аутентифицирован
    if (status === "unauthenticated") {
      router.push(redirectPath);
      return;
    }

    // Если сессия загружена и требуется определенная роль
    if (status === "authenticated" && requiredRole) {
      // Проверка прав доступа на основе роли
      if (session?.user?.role !== requiredRole) {
        router.push("/");
      }
    }
  }, [status, session, router, requiredRole, redirectPath]);

  // Пока проверяем аутентификацию, показываем загрузку
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Проверка прав доступа...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, не показываем контент
  // useEffect выполнит перенаправление
  if (status === "unauthenticated") {
    return null;
  }

  // Если требуется определенная роль и она не соответствует
  if (requiredRole && session?.user?.role !== requiredRole) {
    return null;
  }

  // Если все проверки пройдены, показываем содержимое
  return <>{children}</>;
}

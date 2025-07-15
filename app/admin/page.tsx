"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import NavBar from "@/components/NavBar";
import RouteGuard from "@/components/RouteGuard";
import { Shield, Users, Activity, Settings } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
};

/**
 * Компонент статистической карточки
 */
function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-2">{title}</h3>
      </div>
      <p className="text-2xl font-semibold text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}

/**
 * Административная панель для управления пользователями и системными настройками
 */
export default function AdminDashboard() {
  const { data: session } = useSession();
  
  // Состояние для аналитических данных (в реальном приложении заменить на API вызовы)
  const [stats, setStats] = useState({
    totalUsers: 15,
    activeUsers: 7,
    totalRequests: 342,
    avgRequestTime: "4.2 сек."
  });

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen flex flex-col">
        <NavBar />
        
        <div className="flex-1 py-6 px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-white flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Панель администратора
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Управление пользователями и мониторинг системы AI-Insight Dashboard
            </p>
          </div>

          {/* Карточки с основными метриками */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Всего пользователей" 
              value={stats.totalUsers} 
              icon={<Users className="h-5 w-5 text-blue-600" />} 
            />
            <StatCard 
              title="Активных пользователей" 
              value={stats.activeUsers} 
              icon={<Users className="h-5 w-5 text-green-600" />} 
            />
            <StatCard 
              title="Всего запросов" 
              value={stats.totalRequests} 
              icon={<Activity className="h-5 w-5 text-purple-600" />} 
            />
            <StatCard 
              title="Среднее время запроса" 
              value={stats.avgRequestTime} 
              icon={<Activity className="h-5 w-5 text-amber-600" />} 
            />
          </div>

          {/* Раздел управления пользователями */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-slate-800 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Управление пользователями
              </h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors">
                Добавить пользователя
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Имя
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {[
                    { id: "1", name: "Администратор", email: "admin@example.com", role: "admin", active: true },
                    { id: "2", name: "Пользователь", email: "user@example.com", role: "user", active: true }
                  ].map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200">
                        {user.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200">
                        {user.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200">
                        {user.email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin" 
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" 
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}>
                          {user.role === "admin" ? "Администратор" : "Пользователь"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Активен
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Раздел настроек системы */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-lg font-medium text-slate-800 dark:text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Настройки системы
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Максимальный размер файла</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Максимальный размер файла для загрузки</p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    defaultValue="10" 
                    className="w-24 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 text-slate-800 dark:text-white"
                  />
                  <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">МБ</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Максимальное количество запросов</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Лимит запросов для пользователя в день</p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    defaultValue="50" 
                    className="w-24 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Активные модели ИИ</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Доступные модели для анализа</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    llama3.2
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    mistral
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors">
                Сохранить настройки
              </button>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ClientInsightBoardService } from '@/services/clientInsightBoardService';
import { InsightBoardSummary } from '@/types/insightBoard';
import { Loader2, BookOpen, Calendar, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import RouteGuard from '@/components/RouteGuard';

/**
 * Страница со списком сохраненных досок инсайтов
 */
export default function InsightBoardsPage() {
  const [boards, setBoards] = useState<InsightBoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  
  // Загрузка списка досок инсайтов при открытии страницы
  useEffect(() => {
    async function loadBoards() {
      try {
        setLoading(true);
        const boardSummaries = await ClientInsightBoardService.getUserInsightBoards();
        setBoards(boardSummaries);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки досок инсайтов:', err);
        setError('Не удалось загрузить доски инсайтов');
      } finally {
        setLoading(false);
      }
    }
    
    loadBoards();
  }, []);
  
  // Форматирование даты
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Удаление доски
  const handleDeleteBoard = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту доску инсайтов?')) {
      return;
    }
    
    try {
      await ClientInsightBoardService.deleteInsightBoard(id);
      setBoards(prevBoards => prevBoards.filter(board => board.id !== id));
    } catch (err) {
      console.error('Ошибка при удалении доски:', err);
      alert('Не удалось удалить доску инсайтов');
    }
  };

  return (
    <RouteGuard>
      <div className="min-h-screen py-8 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Сохранённые доски инсайтов
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Здесь вы можете просмотреть и управлять сохранёнными результатами анализа
          </p>
          
          {/* Сообщение об ошибке */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
              <p className="flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </p>
            </div>
          )}
          
          {/* Загрузка */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-slate-600 dark:text-slate-300">Загрузка...</span>
            </div>
          )}
          
          {/* Пустое состояние */}
          {!loading && boards.length === 0 && !error && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                У вас пока нет сохранённых досок инсайтов
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Создайте новый анализ и сохраните его, чтобы он появился здесь
              </p>
              <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center">
                Создать новый анализ
              </Link>
            </div>
          )}
          
          {/* Список досок */}
          {!loading && boards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map(board => (
                <div 
                  key={board.id} 
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden flex flex-col"
                >
                  <div className="p-5 flex-grow">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 truncate">
                      {board.title}
                    </h3>
                    
                    <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(board.createdAt)}
                      </div>
                      {board.fileName && (
                        <div className="truncate">
                          📄 {board.fileName}
                        </div>
                      )}
                      <div>
                        🤖 {board.model}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-700/30 flex justify-between">
                    <Link 
                      href={`/insight-boards/${board.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Просмотреть
                    </Link>
                    
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}

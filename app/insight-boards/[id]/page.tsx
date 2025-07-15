"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClientInsightBoardService } from '@/services/clientInsightBoardService';
import { InsightBoard } from '@/types/insightBoard';
import { Loader2, ArrowLeft, BookOpen, Link as LinkIcon, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import RouteGuard from '@/components/RouteGuard';

/**
 * Страница для просмотра конкретной доски инсайтов
 */
export default function InsightBoardDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [board, setBoard] = useState<InsightBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ID доски из URL параметров
  const boardId = params?.id as string;
  
  // Загрузка доски инсайтов
  useEffect(() => {
    async function loadBoard() {
      if (!boardId) return;
      
      try {
        setLoading(true);
        const boardData = await ClientInsightBoardService.getInsightBoard(boardId);
        setBoard(boardData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки доски инсайтов:', err);
        setError('Не удалось загрузить доску инсайтов');
      } finally {
        setLoading(false);
      }
    }
    
    loadBoard();
  }, [boardId]);
  
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
  
  return (
    <RouteGuard>
      <div className="min-h-screen py-8 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Навигация назад */}
          <div className="mb-6">
            <Link 
              href="/insight-boards"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Назад к списку досок
            </Link>
          </div>
          
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
          
          {/* Содержимое доски инсайтов */}
          {!loading && board && (
            <div className="space-y-6">
              {/* Заголовок и метаданные */}
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  {board.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(board.createdAt)}
                  </div>
                  {board.fileName && (
                    <div className="flex items-center">
                      <span className="mr-1">📄</span> {board.fileName}
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="mr-1">🤖</span> {board.model}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">🌡️</span> Температура: {board.temperature}
                  </div>
                </div>
              </div>
              
              {/* Summary секция */}
              <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                    Обзор
                  </h2>
                </div>
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                  {board.insights.summary}
                </div>
              </div>

              {/* Key Concepts секция */}
              {board.insights.keyConcepts && board.insights.keyConcepts.length > 0 && (
                <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                    Ключевые концепции
                  </h2>
                  <ul className="space-y-2">
                    {board.insights.keyConcepts.map((concept, index) => {
                      // Статический набор цветов для маркеров
                      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500'];
                      const colorClass = concept.color || colors[index % colors.length];
                      
                      return (
                        <li key={`concept-${index}`} className="flex items-center">
                          <span className={`h-2 w-2 rounded-full ${colorClass} mr-2`}></span>
                          <span className="text-slate-700 dark:text-slate-300">{concept.name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Related Links секция */}
              {board.insights.relatedLinks && board.insights.relatedLinks.length > 0 && (
                <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                    Дополнительные материалы
                  </h2>
                  <ul className="space-y-3">
                    {board.insights.relatedLinks.map((link, index) => (
                      <li key={`link-${index}`}>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-start"
                        >
                          <LinkIcon className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                          <span>{link.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Исходный текст */}
              <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                  Исходный текст
                </h2>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md max-h-96 overflow-y-auto text-slate-700 dark:text-slate-300">
                  <pre className="whitespace-pre-wrap">{board.sourceText}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}

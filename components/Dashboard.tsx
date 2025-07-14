"use client";

import React, { useState, useCallback } from 'react';
import { InsightResponse, KeyConcept, RelatedLink } from '@/services/aiService';
import { Loader2, AlertCircle, BookOpen, Link as LinkIcon, Upload, FileText } from 'lucide-react';

/**
 * Интерфейс для моделей Ollama
 */
export interface OllamaModel {
  /** Внутреннее имя модели */
  name: string;
  /** Отображаемое имя модели */
  displayName: string;
}

/**
 * Интерфейс для параметров модели
 */
export interface ModelParams {
  /** Название модели */
  model: string;
  /** Температура генерации (креативность) */
  temperature: number;
}

/**
 * Интерфейс для пропсов компонента Dashboard
 */
export interface DashboardProps {
  /** Дополнительные CSS классы */
  className?: string;
  /** Текст для анализа */
  inputText: string;
  /** Обработчик изменения текста */
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Обработчик загрузки файла */
  onFileUpload: (text: string, fileName: string) => void;
  /** Состояние загрузки */
  isLoading: boolean;
  /** Сообщение об ошибке */
  error: string | null;
  /** Флаг наличия результатов */
  hasResults: boolean;
  /** Данные инсайтов */
  insights: InsightResponse | null;
  /** Обработчик генерации инсайтов */
  onGenerateInsights: () => Promise<void>;
  /** Обработчик сброса формы */
  onReset: () => void;
  /** Параметры модели */
  modelParams: ModelParams;
  /** Доступные модели */
  availableModels: OllamaModel[];
  /** Обработчик изменения модели */
  onModelChange: (model: string) => void;
  /** Обработчик изменения температуры */
  onTemperatureChange: (temperature: number) => void;
}

/**
 * Компонент Dashboard - основной компонент для анализа текста с помощью ИИ Ollama
 * Содержит форму для ввода текста и отображение результатов анализа
 *
 * Обновления от 13.07.2025:
 * - Добавлена интеграция с Ollama API
 * - Добавлены настройки модели и температуры
 * - Реализовано управление состоянием через пропсы
 * 
 * @param {DashboardProps} props - Пропсы компонента
 * @returns {JSX.Element} React компонент Dashboard
 */
export default function Dashboard({ 
  className = '',
  inputText,
  onInputChange,
  onFileUpload,
  isLoading,
  error,
  hasResults,
  insights,
  onGenerateInsights,
  onReset,
  modelParams,
  availableModels,
  onModelChange,
  onTemperatureChange
}: DashboardProps): JSX.Element {
  // Состояние для отображения индикатора загрузки файла
  const [fileLoading, setFileLoading] = useState<boolean>(false);

  /**
   * Обрабатывает загрузку файла
   * @param {React.ChangeEvent<HTMLInputElement>} event - Событие изменения инпута файла
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    
    try {
      // Показываем индикатор загрузки
      setFileLoading(true);
      
      // Создаем форму для отправки файла
      const formData = new FormData();
      formData.append('file', file);
      
      // Отправляем файл на сервер для обработки
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обработке файла');
      }
      
      // Получаем результат извлечения текста
      const extractionResult = await response.json();
      
      // Передаем извлеченный текст и информацию о файле
      onFileUpload(extractionResult.text, `${extractionResult.fileName} [${extractionResult.format.toUpperCase()}]`);
    } catch (error) {
      alert(`Ошибка при чтении файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setFileLoading(false);
      // Очищаем инпут файла для возможности повторной загрузки
      if (event.target) {
        event.target.value = '';
      }
    }
  };  

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 ${className}`}>
      {/* Заголовок */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
          AI-Insight Dashboard
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Интеллектуальный анализ текста с использованием ИИ
        </p>
      </header>

      {/* Секция ввода текста */}
      <div className="mb-8 bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
        {/* Форма ввода */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="topic-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Введите тему или вопрос для анализа
            </label>
            
            {/* Кнопка загрузки файла */}
            <label htmlFor="file-upload" className="flex items-center text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300">
              {fileLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Обработка файла...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Загрузить файл
                </>
              )}
              <input 
                id="file-upload" 
                type="file" 
                accept=".txt,.md,.json,.csv,.html,.xml,.js,.jsx,.ts,.tsx,.css,.scss,.doc,.docx,.odt,.pdf,.rtf" 
                className="sr-only" 
                onChange={handleFileUpload}
                disabled={isLoading || fileLoading}
              />

            </label>
          </div>
          
          <textarea
            id="topic-input"
            rows={5}
            value={inputText}
            onChange={onInputChange}
            disabled={isLoading}
            placeholder="Введите тему или вопрос для анализа или загрузите текстовый файл..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        
        {/* Настройки модели Ollama */}
        <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-md p-4">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Настройки модели Ollama</h3>
          
          {/* Выбор модели */}
          <div className="mb-4">
            <label htmlFor="model-select" className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
              Модель
            </label>
            <select
              id="model-select"
              value={modelParams.model}
              onChange={(e) => onModelChange(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            >
              {availableModels.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.displayName}
                </option>
              ))}
            </select>
          </div>
          
          {/* Настройка температуры */}
          <div>
            <label htmlFor="temperature-slider" className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
              <span>Температура</span>
              <span className="font-mono">{modelParams.temperature.toFixed(1)}</span>
            </label>
            <input
              id="temperature-slider"
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={modelParams.temperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-500 mt-1">
              <span>Точность</span>
              <span>Креативность</span>
            </div>
          </div>
        </div>

        {/* Кнопка запроса */}
        <div className="flex justify-between mb-8">
          <button
            onClick={onReset}
            disabled={isLoading || (!inputText.trim() && !hasResults)}
            className={`px-4 py-2 rounded-md text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            Очистить
          </button>
          
          <button
            onClick={onGenerateInsights}
            disabled={isLoading || !inputText.trim()}
            className={`px-6 py-3 rounded-md text-white font-medium shadow-sm ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Генерация...
              </span>
            ) : (
              'Сгенерировать инсайты'
            )}
          </button>
        </div>
      </div>

      {/* Отображение ошибки, если она есть */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-600 dark:text-red-400">Ошибка при обработке запроса</h3>
            <p className="text-sm text-red-500 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {/* Индикатор загрузки на весь экран (если нет результатов) */}
      {isLoading && !hasResults && (
        <div className="my-12 flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-300 text-center">Генерация инсайтов с помощью ИИ...</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">Это может занять несколько секунд</p>
        </div>
      )}

      {/* Отображение результатов анализа, если они есть */}
      {hasResults && insights && (
        <div className="space-y-6">
          {/* Метаданные запроса, если они есть */}
          {insights.metadata && (
            <div className="mb-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-2 inline-flex gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Время обработки: {insights.generationTimeMs ? `${(insights.generationTimeMs / 1000).toFixed(2)}s` : 'н/д'}</span>
                {insights.metadata.requestLength && (
                  <span>Длина запроса: {insights.metadata.requestLength} символов</span>
                )}
              </div>
            </div>
          )}
          
          {/* Summary секция */}
          <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                Обзор
              </h2>
            </div>
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
              {insights.summary}
            </div>
          </div>

          {/* Key Concepts секция */}
          {insights.keyConcepts && insights.keyConcepts.length > 0 && (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                Ключевые концепции
              </h2>
              <ul className="space-y-2">
                {insights.keyConcepts.map((concept, index) => {
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
          {insights.relatedLinks && insights.relatedLinks.length > 0 && (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                Дополнительные материалы
              </h2>
              <ul className="space-y-3">
                {insights.relatedLinks.map((link, index) => (
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
        </div>
      )}
    </div>
  );
}

/**
 * Компонент для рендеринга пустого состояния, когда нет результатов
 * @returns {JSX.Element} UI пустого состояния
 */
function EmptyState(): JSX.Element {
  return (
    <div className="my-12 text-center">
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 max-w-md mx-auto">
        <div className="mb-4">
          <svg className="h-12 w-12 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2"
              d="M24 8a4 4 0 100 8 4 4 0 000-8zm9 20c0-5-4-9-9-9s-9 4-9 9m1-17l-6-6m26 6l-6-6m-14 34l-6-6m26 6l-6-6" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Готовы к анализу</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Введите тему или текст в поле выше и нажмите кнопку «Сгенерировать инсайты»
        </p>
      </div>
    </div>
  );
}

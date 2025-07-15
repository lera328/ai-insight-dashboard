"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import NavBar from '../components/NavBar';
import { useSession } from 'next-auth/react';
import { InsightResponse } from '@/services/aiService';
import { queueService } from '@/services/queueService';
import RouteGuard from '@/components/RouteGuard';

// Интерфейс для моделей Ollama
interface OllamaModel {
  name: string;
  displayName: string;
}

// Интерфейс для параметров модели
interface ModelParams {
  model: string;
  temperature: number;
}

/**
 * Главная страница AI-Insight Dashboard
 * Управляет состоянием приложения и взаимодействием с API Ollama
 * Содержит логику для отправки запросов и обработки ответов
 * 
 * @returns {JSX.Element} Главная страница приложения с дашбордом
 */
export default function Home(): JSX.Element {
  // Состояние для входного текста
  const [inputText, setInputText] = useState<string>('');
  
  // Состояние для процесса загрузки
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Состояние для отображения прогресса генерации
  const [progress, setProgress] = useState<number>(0);
  
  // Состояние для результатов анализа
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  
  // Состояние для ошибок
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для отображения результатов
  const [hasResults, setHasResults] = useState<boolean>(false);
  
  // Состояние для параметров модели
  const [modelParams, setModelParams] = useState<ModelParams>({
    model: 'llama3.2:latest', // Установленная модель
    temperature: 0.7  // Температура по умолчанию
  });
  
  // Доступные модели Ollama
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([
    { name: 'llama3.2:latest', displayName: 'Llama 3.2 (3.2B)' }
  ]);

  /**
   * Обработчик изменения текста ввода
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Событие изменения текста
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);
      if (error) setError(null);
    },
    [error]
  );

  // Состояние для информации о загруженном файле
  const [fileInfo, setFileInfo] = useState<{name: string; size: string; chars: number} | null>(null);

  /**
   * Обработчик загрузки файла
   * @param {string} text - Содержимое файла
   * @param {string} fileName - Имя файла
   */
  const handleFileUpload = useCallback((text: string, fileName: string) => {
    // Устанавливаем текст из файла в поле ввода
    setInputText(text);
    
    // Очищаем предыдущие результаты
    setInsights(null);
    
    // Получаем размер файла в килобайтах
    const fileSizeKB = (new TextEncoder().encode(text).length / 1024).toFixed(2);
    
    // Сохраняем информацию о файле
    setFileInfo({
      name: fileName,
      size: `${fileSizeKB} KB`,
      chars: text.length
    });
    
    // Отображаем информационное сообщение о файле
    setError(`Файл загружен: ${fileName} (${fileSizeKB} KB, ${text.length.toLocaleString()} символов). Нажмите "Сгенерировать инсайты" для анализа.`);
  }, []);

  /**
   * Обработчик изменения модели
   * @param {string} model - Название модели
   */
  const handleModelChange = useCallback((model: string) => {
    setModelParams(prev => ({ ...prev, model }));
  }, []);

  /**
   * Обработчик изменения температуры модели
   * 
   * @param {number} temperature - Значение температуры (0.1 - 1.0)
   */
  const handleTemperatureChange = useCallback((temperature: number) => {
    setModelParams(prev => ({ ...prev, temperature }));
  }, []);

  /**
   * Выполняет запрос к API для генерации инсайтов
   */
  const handleGenerateInsights = useCallback(async () => {
    if (!inputText.trim()) return;
    
    setError(null);
    setIsLoading(true);
    setInsights(null);
    setProgress(0);
    
    // Добавляем запрос в очередь вместо прямого вызова API
    queueService.enqueue(
      { 
        topic: inputText, 
        modelParams: modelParams 
      },
      // Обработчик успешного завершения
      (result: InsightResponse) => {
        setInsights(result);
        setHasResults(true);
        setIsLoading(false);
        
        // Логируем успешный результат
        console.log('Получены инсайты:', {
          summary: result.summary.substring(0, 50) + '...',
          keyConcepts: result.keyConcepts.length,
          relatedLinks: result.relatedLinks.length,
          metadata: result.metadata
        });
      },
      // Обработчик ошибки
      (err: Error) => {
        console.error('Ошибка при получении инсайтов:', err);
        setError(err.message || 'Неизвестная ошибка');
        setHasResults(false);
        setIsLoading(false);
      },
      // Обработчик прогресса
      (progressValue: number) => {
        setProgress(prev => Math.min(prev + progressValue, 95)); // Максимум 95% до получения результата
      }
    );
  }, [inputText, modelParams]);
  
  /**
   * Очищает результаты и входные данные
   */
  const handleReset = useCallback(() => {
    setInputText('');
    setInsights(null);
    setError(null);
    setHasResults(false);
  }, []);

  // Получаем данные сессии для персонализации интерфейса
  const { data: session } = useSession();
  const userName = session?.user?.name || "Пользователь";

  return (
    <RouteGuard>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        
        <div className="flex-1 py-6 px-4 sm:px-6 md:px-8">
          {/* Персонализированное приветствие */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
              Добро пожаловать, {userName}!
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Используйте AI-Insight Dashboard для анализа текста и получения полезных инсайтов
            </p>
          </div>
          
          <Dashboard 
            inputText={inputText}
            onInputChange={handleInputChange}
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            error={error}
            hasResults={!!insights}
            insights={insights}
            onGenerateInsights={handleGenerateInsights}
            onReset={handleReset}
            modelParams={modelParams}
            availableModels={availableModels}
            onModelChange={handleModelChange}
            onTemperatureChange={handleTemperatureChange}
            progress={progress}
            fileName={fileInfo?.name}
          />
        </div>
      </div>
    </RouteGuard>
  );
}

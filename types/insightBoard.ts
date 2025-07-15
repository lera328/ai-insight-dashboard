/**
 * Типы и интерфейсы для досок инсайтов
 */

import { InsightResponse } from '@/services/aiService';

/**
 * Доска инсайтов, сохраненная в системе
 */
export interface InsightBoard {
  /** Уникальный идентификатор доски */
  id: string;
  /** Заголовок доски инсайтов */
  title: string;
  /** Данные инсайтов */
  insights: InsightResponse;
  /** Исходный текст для анализа */
  sourceText: string;
  /** Имя файла, если анализ был из файла */
  fileName?: string;
  /** Временная метка создания */
  createdAt: number;
  /** Временная метка последнего обновления */
  updatedAt: number;
  /** ID пользователя */
  userId: string;
  /** Используемая модель */
  model: string;
  /** Температура, использованная при генерации */
  temperature: number;
  /** Метаданные доски (для дополнительной информации) */
  metadata?: Record<string, any>;
}

/**
 * Параметры создания новой доски инсайтов
 */
export interface CreateInsightBoardParams {
  /** Заголовок доски */
  title: string;
  /** Данные инсайтов */
  insights: InsightResponse;
  /** Исходный текст для анализа */
  sourceText: string;
  /** Имя файла, если анализ был из файла */
  fileName?: string;
  /** ID пользователя */
  userId: string;
  /** Используемая модель */
  model: string;
  /** Температура, использованная при генерации */
  temperature: number;
  /** Метаданные доски */
  metadata?: Record<string, any>;
}

/**
 * Параметры обновления доски инсайтов
 */
export interface UpdateInsightBoardParams {
  /** ID доски */
  id: string;
  /** Новый заголовок (если изменился) */
  title?: string;
  /** Новые метаданные (если изменились) */
  metadata?: Record<string, any>;
}

/**
 * Краткая информация о доске инсайтов для списка
 */
export interface InsightBoardSummary {
  /** ID доски */
  id: string;
  /** Заголовок доски */
  title: string;
  /** Временная метка создания */
  createdAt: number;
  /** Временная метка обновления */
  updatedAt: number;
  /** Используемая модель */
  model: string;
  /** Имя файла (если есть) */
  fileName?: string;
}

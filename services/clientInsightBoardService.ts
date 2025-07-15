/**
 * Клиентский сервис для управления досками инсайтов
 */

import { 
  InsightBoard, 
  InsightBoardSummary,
  CreateInsightBoardParams,
  UpdateInsightBoardParams 
} from '@/types/insightBoard';
import { InsightResponse } from '@/services/aiService';

/**
 * Сервис для работы с досками инсайтов на стороне клиента
 */
export class ClientInsightBoardService {
  /**
   * Получает все доски инсайтов пользователя
   */
  static async getUserInsightBoards(): Promise<InsightBoardSummary[]> {
    try {
      const response = await fetch('/api/insightBoards', {
        credentials: 'include' // Добавляем передачу cookies
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.boardSummaries;
    } catch (error) {
      console.error('Error fetching insight boards:', error);
      throw error;
    }
  }
  
  /**
   * Получает доску инсайтов по ID
   */
  static async getInsightBoard(id: string): Promise<InsightBoard> {
    try {
      const response = await fetch(`/api/insightBoards/${id}`, {
        credentials: 'include' // Добавляем передачу cookies
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.board;
    } catch (error) {
      console.error(`Error fetching insight board ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Создает новую доску инсайтов
   */
  static async createInsightBoard(params: Omit<CreateInsightBoardParams, 'userId'>): Promise<InsightBoard> {
    try {
      const response = await fetch('/api/insightBoards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Добавляем передачу cookies
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.board;
    } catch (error) {
      console.error('Error creating insight board:', error);
      throw error;
    }
  }
  
  /**
   * Обновляет доску инсайтов
   */
  static async updateInsightBoard(params: UpdateInsightBoardParams): Promise<InsightBoard> {
    try {
      const response = await fetch(`/api/insightBoards/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Добавляем передачу cookies
        body: JSON.stringify({
          title: params.title,
          metadata: params.metadata,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.board;
    } catch (error) {
      console.error(`Error updating insight board ${params.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Удаляет доску инсайтов
   */
  static async deleteInsightBoard(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/insightBoards/${id}`, {
        method: 'DELETE',
        credentials: 'include' // Добавляем передачу cookies
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error(`Error deleting insight board ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Сохраняет результаты анализа в новой доске инсайтов
   * @param title Заголовок доски
   * @param insights Результаты анализа
   * @param sourceText Исходный текст
   * @param model Название модели
   * @param temperature Температура генерации
   * @param fileName Название файла (опционально)
   */
  static async saveInsightResults(
    title: string,
    insights: InsightResponse,
    sourceText: string,
    model: string,
    temperature: number,
    fileName?: string
  ): Promise<InsightBoard> {
    return this.createInsightBoard({
      title,
      insights,
      sourceText,
      model,
      temperature,
      fileName,
      metadata: {
        savedAt: Date.now(),
        source: fileName ? 'file' : 'text'
      }
    });
  }
}

/**
 * Сервис для управления досками инсайтов
 * Работает с базой данных PostgreSQL через Prisma ORM
 */

import { 
  CreateInsightBoardParams, 
  UpdateInsightBoardParams,
  InsightBoardSummary
} from '@/types/insightBoard';
import { DatabaseService } from './databaseService';
import { InsightBoard } from '@prisma/client';

// Идентификаторы теперь генерируются Prisma автоматически

/**
 * Сервис для управления досками инсайтов
 * Работает с базой данных через DatabaseService
 */
export class InsightBoardService {
  /**
   * Создает новую доску инсайтов
   * @param params Параметры для создания доски
   * @returns Созданная доска инсайтов
   */
  static async createInsightBoard(params: CreateInsightBoardParams): Promise<InsightBoard> {
    const board = await DatabaseService.createInsightBoard({
      title: params.title,
      insights: params.insights,
      sourceText: params.sourceText,
      fileName: params.fileName,
      userId: params.userId,
      model: params.model,
      temperature: params.temperature,
      metadata: params.metadata || {},
    });
    
    return board;
  }
  
  /**
   * Получает доску инсайтов по ID
   * @param id ID доски инсайтов
   * @returns Доска инсайтов или null, если не найдена
   */
  static async getInsightBoard(id: string): Promise<InsightBoard | null> {
    return await DatabaseService.getInsightBoard(id);
  }
  
  /**
   * Обновляет доску инсайтов
   * @param params Параметры для обновления доски
   * @returns Обновленная доска инсайтов или null, если доска не найдена
   */
  static async updateInsightBoard(params: UpdateInsightBoardParams): Promise<InsightBoard | null> {
    try {
      // Создаем объект с данными для обновления
      const updateData: Partial<InsightBoard> = {};
      
      if (params.title !== undefined) {
        updateData.title = params.title;
      }
      
      if (params.metadata !== undefined) {
        updateData.metadata = params.metadata;
      }
      
      return await DatabaseService.updateInsightBoard(params.id, updateData);
    } catch (error) {
      console.error('Error updating insight board:', error);
      return null;
    }
  }
  
  /**
   * Удаляет доску инсайтов
   * @param id ID доски инсайтов
   * @returns true если успешно удалено, false если нет
   */
  static async deleteInsightBoard(id: string): Promise<boolean> {
    try {
      await DatabaseService.deleteInsightBoard(id);
      return true;
    } catch (error) {
      console.error('Error deleting insight board:', error);
      return false;
    }
  }
  
  /**
   * Получает все доски инсайтов пользователя
   * @param userId ID пользователя
   * @returns Массив досок инсайтов
   */
  static async getUserInsightBoards(userId: string): Promise<InsightBoard[]> {
    return await DatabaseService.getUserInsightBoards(userId);
  }
  
  /**
   * Получает краткую информацию о всех досках инсайтов пользователя
   * @param userId ID пользователя
   * @returns Массив кратких данных о досках инсайтов
   */
  static async getUserInsightBoardSummaries(userId: string): Promise<InsightBoardSummary[]> {
    const boards = await this.getUserInsightBoards(userId);
    
    return boards.map(board => ({
      id: board.id,
      title: board.title,
      createdAt: board.createdAt instanceof Date ? board.createdAt.getTime() : Number(board.createdAt),
      updatedAt: board.updatedAt instanceof Date ? board.updatedAt.getTime() : Number(board.updatedAt),
      model: board.model || undefined,
      fileName: board.fileName || undefined,
    }));
  }
  
  /**
   * Удаляет все доски инсайтов пользователя
   * @param userId ID пользователя
   * @returns Количество удаленных досок
   */
  static async deleteUserInsightBoards(userId: string): Promise<number> {
    try {
      const boards = await this.getUserInsightBoards(userId);
      
      for (const board of boards) {
        await DatabaseService.deleteInsightBoard(board.id);
      }
      
      return boards.length;
    } catch (error) {
      console.error('Error deleting user insight boards:', error);
      return 0;
    }
  }
  
  /**
   * Поиск досок инсайтов по запросу
   * @param searchTerm Строка для поиска
   * @returns Массив досок инсайтов, соответствующих поиску
   */
  static async searchInsightBoards(searchTerm: string): Promise<InsightBoard[]> {
    return await DatabaseService.searchInsightBoards(searchTerm);
  }
  
  /**
   * Проверяет, принадлежит ли доска инсайтов пользователю
   * @param boardId ID доски инсайтов
   * @param userId ID пользователя
   * @returns true, если доска принадлежит пользователю
   */
  static async isInsightBoardOwnedByUser(boardId: string, userId: string): Promise<boolean> {
    return await DatabaseService.isInsightBoardOwnedByUser(boardId, userId);
  }
}

/**
 * Сервис для управления досками инсайтов
 * В текущей реализации данные хранятся в JSON файлах
 * В рабочей среде следует заменить на подключение к базе данных
 */

import { 
  InsightBoard, 
  CreateInsightBoardParams, 
  UpdateInsightBoardParams,
  InsightBoardSummary
} from '@/types/insightBoard';
import { FileStorageService } from './fileStorageService';

/**
 * Генерирует случайный идентификатор
 * @returns {string} Строковый случайный идентификатор
 */
function generateId(): string {
  // Создание рандомного идентификатора без внешних зависимостей
  return 'board_' + 
    Date.now().toString(36) + '_' + 
    Math.random().toString(36).substring(2, 15) + '_' +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Получить текущие доски инсайтов из файлового хранилища
 */
function getBoardsFromStorage(): Map<string, InsightBoard> {
  const boards = FileStorageService.readData<Record<string, InsightBoard>>('insightBoards', {});
  return new Map(Object.entries(boards));
}

/**
 * Сохранить доски инсайтов в файловое хранилище
 */
function saveBoardsToStorage(boards: Map<string, InsightBoard>): void {
  const boardsObj = Object.fromEntries(boards.entries());
  FileStorageService.saveData('insightBoards', boardsObj);
}

/**
 * Сервис для управления досками инсайтов
 */
export class InsightBoardService {
  /**
   * Создает новую доску инсайтов
   */
  static createInsightBoard(params: CreateInsightBoardParams): InsightBoard {
    const now = Date.now();
    const id = generateId();
    
    const board: InsightBoard = {
      id,
      title: params.title,
      insights: params.insights,
      sourceText: params.sourceText,
      fileName: params.fileName,
      createdAt: now,
      updatedAt: now,
      userId: params.userId,
      model: params.model,
      temperature: params.temperature,
      metadata: params.metadata || {},
    };
    
    // Загружаем текущие доски из хранилища
    const insightBoards = getBoardsFromStorage();
    
    // Сохраняем новую доску
    insightBoards.set(id, board);
    
    // Сохраняем в файловое хранилище
    saveBoardsToStorage(insightBoards);
    
    return board;
  }
  
  /**
   * Получает доску инсайтов по ID
   */
  static getInsightBoard(id: string): InsightBoard | null {
    const insightBoards = getBoardsFromStorage();
    return insightBoards.get(id) || null;
  }
  
  /**
   * Обновляет доску инсайтов
   */
  static updateInsightBoard(params: UpdateInsightBoardParams): InsightBoard | null {
    const insightBoards = getBoardsFromStorage();
    const board = insightBoards.get(params.id);
    
    if (!board) {
      return null;
    }
    
    // Обновляем поля
    if (params.title !== undefined) {
      board.title = params.title;
    }
    
    if (params.metadata !== undefined) {
      board.metadata = {
        ...board.metadata,
        ...params.metadata,
      };
    }
    
    board.updatedAt = Date.now();
    
    // Сохраняем обновленную доску
    insightBoards.set(params.id, board);
    
    // Сохраняем в файловое хранилище
    saveBoardsToStorage(insightBoards);
    
    return board;
  }
  
  /**
   * Удаляет доску инсайтов
   */
  static deleteInsightBoard(id: string): boolean {
    const insightBoards = getBoardsFromStorage();
    const result = insightBoards.delete(id);
    
    if (result) {
      // Сохраняем изменения в файловое хранилище
      saveBoardsToStorage(insightBoards);
    }
    
    return result;
  }
  
  /**
   * Получает все доски инсайтов пользователя
   */
  static getUserInsightBoards(userId: string): InsightBoard[] {
    const insightBoards = getBoardsFromStorage();
    return Array.from(insightBoards.values())
      .filter(board => board.userId === userId)
      .sort((a, b) => b.updatedAt - a.updatedAt); // Сортировка по времени обновления
  }
  
  /**
   * Получает краткую информацию о всех досках инсайтов пользователя
   */
  static getUserInsightBoardSummaries(userId: string): InsightBoardSummary[] {
    return this.getUserInsightBoards(userId).map(board => ({
      id: board.id,
      title: board.title,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      model: board.model,
      fileName: board.fileName,
    }));
  }
  
  /**
   * Удаляет все доски инсайтов пользователя
   */
  static deleteUserInsightBoards(userId: string): number {
    let count = 0;
    const insightBoards = getBoardsFromStorage();
    
    // Используем более совместимый способ итерации по Map
    const idsToDelete: string[] = [];
    
    insightBoards.forEach((board, id) => {
      if (board.userId === userId) {
        idsToDelete.push(id);
      }
    });
    
    // Удаляем доски после итерации
    idsToDelete.forEach(id => {
      insightBoards.delete(id);
      count++;
    });
    
    // Сохраняем изменения в файловое хранилище
    if (count > 0) {
      saveBoardsToStorage(insightBoards);
    }
    
    return count;
  }
}

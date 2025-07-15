import { InsightBoard } from '@prisma/client';
import { prisma } from '../lib/prisma';

/**
 * Сервис для работы с базой данных через Prisma ORM
 */
export class DatabaseService {
  /**
   * Получить доску инсайтов по ID
   * @param id ID доски инсайтов
   * @returns Доска инсайтов или null, если не найдена
   */
  static async getInsightBoard(id: string): Promise<InsightBoard | null> {
    return prisma.insightBoard.findUnique({
      where: { id }
    });
  }

  /**
   * Получить все доски инсайтов для конкретного пользователя
   * @param userId ID пользователя
   * @returns Массив досок инсайтов
   */
  static async getUserInsightBoards(userId: string): Promise<InsightBoard[]> {
    return prisma.insightBoard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Создать новую доску инсайтов
   * @param insightBoard Данные доски инсайтов
   * @returns Созданная доска инсайтов
   */
  static async createInsightBoard(insightBoard: Omit<InsightBoard, 'id' | 'createdAt' | 'updatedAt'>): Promise<InsightBoard> {
    return prisma.insightBoard.create({
      data: insightBoard
    });
  }

  /**
   * Обновить существующую доску инсайтов
   * @param id ID доски инсайтов
   * @param data Данные для обновления
   * @returns Обновленная доска инсайтов
   */
  static async updateInsightBoard(id: string, data: Partial<InsightBoard>): Promise<InsightBoard> {
    return prisma.insightBoard.update({
      where: { id },
      data
    });
  }

  /**
   * Удалить доску инсайтов
   * @param id ID доски инсайтов
   * @returns Удаленная доска инсайтов
   */
  static async deleteInsightBoard(id: string): Promise<InsightBoard> {
    return prisma.insightBoard.delete({
      where: { id }
    });
  }

  /**
   * Получить все доски инсайтов (для администрирования)
   * @returns Массив всех досок инсайтов
   */
  static async getAllInsightBoards(): Promise<InsightBoard[]> {
    return prisma.insightBoard.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Поиск досок инсайтов по заголовку
   * @param searchTerm Строка для поиска
   * @returns Массив найденных досок инсайтов
   */
  static async searchInsightBoards(searchTerm: string): Promise<InsightBoard[]> {
    return prisma.insightBoard.findMany({
      where: {
        title: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Проверить, принадлежит ли доска инсайтов пользователю
   * @param boardId ID доски инсайтов
   * @param userId ID пользователя
   * @returns true, если доска принадлежит пользователю
   */
  static async isInsightBoardOwnedByUser(boardId: string, userId: string): Promise<boolean> {
    const board = await prisma.insightBoard.findFirst({
      where: {
        id: boardId,
        userId
      }
    });
    return !!board;
  }
}

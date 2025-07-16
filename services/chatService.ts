/**
 * @fileoverview Сервис для работы с чатами и сообщениями в базе данных
 */

import { PrismaClient } from '@prisma/client';

// Используем общий экземпляр PrismaClient
import { prisma } from '@/lib/prisma';

/**
 * Типы для возвращаемых данных
 */
// Определяем типы для работы с чатами
export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  model?: string | null;
  systemPrompt?: string | null;
  temperature?: number | null;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: string;
  content: string;
  createdAt: Date;
  metadata?: Record<string, any> | null;
}

export interface ChatWithMessages extends Chat {
  messages: ChatMessage[];
}

export interface ChatSummary {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  model?: string | null;
  messageCount: number;
  lastMessageContent?: string;
  lastMessageDate?: Date;
}

/**
 * Сервис для работы с чатами
 */
export class ChatService {
  /**
   * Получение чатов пользователя
   * @param userId ID пользователя
   * @returns Массив чатов
   */
  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const chats = await prisma.chat.findMany({
        where: {
          userId
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      return chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        model: chat.model,
        messageCount: chat._count.messages,
        lastMessageContent: chat.messages[0]?.content,
        lastMessageDate: chat.messages[0]?.createdAt
      }));
    } catch (error) {
      console.error('Ошибка при получении чатов пользователя:', error);
      throw error;
    }
  }

  /**
   * Получение конкретного чата по ID
   * @param chatId ID чата
   * @param userId ID пользователя для проверки доступа
   * @returns Чат с сообщениями
   */
  static async getChat(chatId: string, userId: string): Promise<ChatWithMessages | null> {
    try {
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId // Проверка доступа: чат должен принадлежать пользователю
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' } // Сортировка сообщений по времени
          }
        }
      });

      return chat;
    } catch (error) {
      console.error(`Ошибка при получении чата с ID ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Создание нового чата
   * @param userId ID пользователя
   * @param title Название чата
   * @param model Используемая модель (опционально)
   * @param systemPrompt Системный промпт (опционально)
   * @returns Созданный чат
   */
  static async createChat(
    userId: string, 
    title: string, 
    model?: string, 
    systemPrompt?: string,
    temperature?: number
  ): Promise<Chat> {
    try {
      const chat = await prisma.chat.create({
        data: {
          userId,
          title,
          model,
          systemPrompt,
          temperature
        }
      });

      // Если есть системный промпт, создаем первое сообщение системного типа
      if (systemPrompt) {
        await prisma.chatMessage.create({
          data: {
            chatId: chat.id,
            role: 'system',
            content: systemPrompt
          }
        });
      }

      return chat;
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
      throw error;
    }
  }

  /**
   * Обновление данных чата
   * @param chatId ID чата
   * @param userId ID пользователя для проверки доступа
   * @param data Данные для обновления
   * @returns Обновленный чат
   */
  static async updateChat(
    chatId: string, 
    userId: string, 
    data: { title?: string; model?: string; systemPrompt?: string; temperature?: number }
  ): Promise<Chat | null> {
    try {
      // Проверка доступа: сначала находим чат и проверяем, что он принадлежит пользователю
      const existingChat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId
        }
      });

      if (!existingChat) {
        return null;
      }

      // Обновляем данные чата
      const updatedChat = await prisma.chat.update({
        where: { id: chatId },
        data: {
          ...data,
          updatedAt: new Date() // Принудительно обновляем дату изменения
        }
      });

      // Если обновляется системный промпт, обновляем или создаем системное сообщение
      if (data.systemPrompt !== undefined) {
        const existingSystemMessage = await prisma.chatMessage.findFirst({
          where: {
            chatId,
            role: 'system'
          }
        });

        if (existingSystemMessage) {
          // Обновляем существующее системное сообщение
          await prisma.chatMessage.update({
            where: { id: existingSystemMessage.id },
            data: { content: data.systemPrompt }
          });
        } else if (data.systemPrompt) {
          // Создаем новое системное сообщение
          await prisma.chatMessage.create({
            data: {
              chatId,
              role: 'system',
              content: data.systemPrompt
            }
          });
        }
      }

      return updatedChat;
    } catch (error) {
      console.error(`Ошибка при обновлении чата с ID ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Удаление чата
   * @param chatId ID чата
   * @param userId ID пользователя для проверки доступа
   * @returns true если чат был удален, false если чат не найден или пользователь не имеет доступа
   */
  static async deleteChat(chatId: string, userId: string): Promise<boolean> {
    try {
      // Проверяем принадлежность чата пользователю
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId
        }
      });

      if (!chat) {
        return false;
      }

      // Удаляем чат (сообщения удалятся автоматически благодаря onDelete: Cascade)
      await prisma.chat.delete({
        where: { id: chatId }
      });

      return true;
    } catch (error) {
      console.error(`Ошибка при удалении чата с ID ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Добавление сообщения в чат
   * @param chatId ID чата
   * @param role Роль отправителя (user, assistant, system)
   * @param content Содержимое сообщения
   * @param metadata Дополнительные метаданные
   * @returns Созданное сообщение
   */
  static async addMessage(
    chatId: string, 
    role: 'user' | 'assistant' | 'system', 
    content: string,
    metadata?: Record<string, any>
  ): Promise<ChatMessage> {
    try {
      // Добавляем сообщение
      const message = await prisma.chatMessage.create({
        data: {
          chatId,
          role,
          content,
          metadata: metadata ? metadata : undefined
        }
      });

      // Обновляем время последнего изменения чата
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
      });

      return message;
    } catch (error) {
      console.error(`Ошибка при добавлении сообщения в чат с ID ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Удаление сообщения из чата
   * @param messageId ID сообщения
   * @param userId ID пользователя для проверки доступа
   * @returns true если сообщение было удалено, false если сообщение не найдено или пользователь не имеет доступа
   */
  static async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      // Находим сообщение и проверяем принадлежность чата пользователю
      const message = await prisma.chatMessage.findUnique({
        where: { id: messageId },
        include: {
          chat: true
        }
      });

      if (!message || message.chat.userId !== userId) {
        return false;
      }

      // Удаляем сообщение
      await prisma.chatMessage.delete({
        where: { id: messageId }
      });

      return true;
    } catch (error) {
      console.error(`Ошибка при удалении сообщения с ID ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * Очистка истории сообщений чата
   * @param chatId ID чата
   * @param userId ID пользователя для проверки доступа
   * @param preserveSystem Сохранять ли системные сообщения (по умолчанию true)
   * @returns Количество удаленных сообщений
   */
  static async clearChatHistory(chatId: string, userId: string, preserveSystem = true): Promise<number> {
    try {
      // Проверяем принадлежность чата пользователю
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId
        }
      });

      if (!chat) {
        throw new Error('Чат не найден или у вас нет доступа');
      }

      // Определяем условие для удаления
      const whereCondition = {
        chatId,
        ...(preserveSystem ? { role: { not: 'system' } } : {})
      };

      // Удаляем сообщения
      const result = await prisma.chatMessage.deleteMany({
        where: whereCondition
      });

      return result.count;
    } catch (error) {
      console.error(`Ошибка при очистке истории чата с ID ${chatId}:`, error);
      throw error;
    }
  }
}

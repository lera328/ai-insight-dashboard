/**
 * @fileoverview Клиентский сервис для взаимодействия с API чатов
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
 * Сервис для взаимодействия с API чатов на клиентской стороне
 */
export class ClientChatService {
  /**
   * Получение списка чатов пользователя
   * @returns Список чатов пользователя
   */
  static async getUserChats(): Promise<ChatSummary[]> {
    try {
      const response = await fetch('/api/chats', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.chats;
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  }

  /**
   * Получение чата по ID
   * @param chatId ID чата
   * @returns Чат с сообщениями
   */
  static async getChat(chatId: string): Promise<ChatWithMessages> {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.chat;
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw error;
    }
  }

  /**
   * Создание нового чата
   * @param title Название чата
   * @param model Используемая модель (опционально)
   * @param systemPrompt Системный промпт (опционально)
   * @param temperature Температура генерации (опционально)
   * @returns Созданный чат
   */
  static async createChat(
    title: string,
    model?: string,
    systemPrompt?: string,
    temperature?: number
  ): Promise<Chat> {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          model,
          systemPrompt,
          temperature
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  /**
   * Обновление данных чата
   * @param chatId ID чата
   * @param updates Данные для обновления
   * @returns Обновленный чат
   */
  static async updateChat(
    chatId: string,
    updates: {
      title?: string;
      model?: string;
      systemPrompt?: string;
      temperature?: number;
    }
  ): Promise<Chat> {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.chat;
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  }

  /**
   * Удаление чата
   * @param chatId ID чата
   * @returns Успешно ли удален чат
   */
  static async deleteChat(chatId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }

  /**
   * Отправка сообщения в чат
   * @param chatId ID чата
   * @param content Содержимое сообщения
   * @param generateAiResponse Генерировать ли ответ AI (по умолчанию true)
   * @returns Добавленные сообщения (пользователя и AI, если был запрошен)
   */
  static async sendMessage(
    chatId: string,
    content: string,
    generateAiResponse = true
  ): Promise<{ message: ChatMessage; aiMessage?: ChatMessage }> {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          content,
          role: 'user',
          generateAiResponse
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return {
        message: data.message,
        aiMessage: data.aiMessage
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Очистка истории чата
   * @param chatId ID чата
   * @param preserveSystem Сохранять ли системные сообщения (по умолчанию true)
   * @returns Количество удаленных сообщений
   */
  static async clearChatHistory(
    chatId: string,
    keepSystemMessages = true
  ): Promise<number> {
    try {
      const response = await fetch(
        `/api/chats/${chatId}/messages?keepSystemMessages=${keepSystemMessages}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.deletedCount;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }
}

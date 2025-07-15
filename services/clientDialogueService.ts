/**
 * Клиентский сервис для управления диалогами
 * Обеспечивает взаимодействие с серверным API диалогов
 */

import { 
  Dialogue, 
  DialogueMessage, 
  CreateDialogueParams,
  UpdateDialogueParams,
  AddMessageParams 
} from '@/types/dialogue';

/**
 * Класс для работы с диалогами через API
 */
export class ClientDialogueService {
  /**
   * Получает все диалоги пользователя
   */
  static async getUserDialogues(): Promise<Dialogue[]> {
    try {
      const response = await fetch('/api/dialogues');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.dialogues;
    } catch (error) {
      console.error('Error fetching dialogues:', error);
      throw error;
    }
  }
  
  /**
   * Получает диалог по ID
   */
  static async getDialogue(id: string): Promise<Dialogue> {
    try {
      const response = await fetch(`/api/dialogues/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.dialogue;
    } catch (error) {
      console.error(`Error fetching dialogue ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Создает новый диалог
   */
  static async createDialogue(params: Omit<CreateDialogueParams, 'userId'>): Promise<Dialogue> {
    try {
      const response = await fetch('/api/dialogues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.dialogue;
    } catch (error) {
      console.error('Error creating dialogue:', error);
      throw error;
    }
  }
  
  /**
   * Обновляет диалог
   */
  static async updateDialogue(params: UpdateDialogueParams): Promise<Dialogue> {
    try {
      const response = await fetch(`/api/dialogues/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: params.title,
          metadata: params.metadata,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.dialogue;
    } catch (error) {
      console.error(`Error updating dialogue ${params.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Удаляет диалог
   */
  static async deleteDialogue(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/dialogues/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error(`Error deleting dialogue ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Добавляет сообщение в диалог
   */
  static async addMessage(params: Omit<AddMessageParams, 'dialogueId'> & { dialogueId: string }): Promise<DialogueMessage> {
    try {
      const response = await fetch(`/api/dialogues/${params.dialogueId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: params.content,
          role: params.role,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error(`Error adding message to dialogue ${params.dialogueId}:`, error);
      throw error;
    }
  }
  
  /**
   * Очищает все сообщения диалога
   */
  static async clearMessages(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/dialogues/${id}/messages`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error(`Error clearing messages in dialogue ${id}:`, error);
      throw error;
    }
  }
}

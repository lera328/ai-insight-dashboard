/**
 * Сервис для управления диалогами
 * В текущей реализации данные хранятся в памяти
 * В рабочей среде следует заменить на подключение к базе данных
 */

/**
 * Генерирует случайный идентификатор
 * @returns {string} Строковый случайный идентификатор
 */
function generateId(): string {
  // Создание рандомного идентификатора без внешних зависимостей
  return 'id_' + 
    Date.now().toString(36) + '_' + 
    Math.random().toString(36).substring(2, 15) + '_' +
    Math.random().toString(36).substring(2, 15);
}
import { 
  Dialogue, 
  DialogueMessage, 
  CreateDialogueParams, 
  UpdateDialogueParams,
  AddMessageParams 
} from '@/types/dialogue';

/**
 * Временное хранилище диалогов в памяти
 * Имитирует базу данных
 */
const dialogues: Map<string, Dialogue> = new Map();

/**
 * Сервис для управления диалогами
 */
export class DialogueService {
  /**
   * Создает новый диалог
   */
  static createDialogue(params: CreateDialogueParams): Dialogue {
    const now = Date.now();
    const id = generateId();
    
    const dialogue: Dialogue = {
      id,
      title: params.title,
      createdAt: now,
      updatedAt: now,
      messages: [],
      userId: params.userId,
      metadata: params.metadata || {},
    };
    
    // Если есть начальное сообщение, добавляем его
    if (params.initialMessage) {
      dialogue.messages.push({
        id: generateId(),
        content: params.initialMessage,
        role: 'user',
        timestamp: now,
      });
    }
    
    // Сохраняем диалог в памяти
    dialogues.set(id, dialogue);
    
    return dialogue;
  }
  
  /**
   * Получает диалог по ID
   */
  static getDialogue(id: string): Dialogue | null {
    return dialogues.get(id) || null;
  }
  
  /**
   * Обновляет диалог
   */
  static updateDialogue(params: UpdateDialogueParams): Dialogue | null {
    const dialogue = dialogues.get(params.id);
    
    if (!dialogue) {
      return null;
    }
    
    // Обновляем поля
    if (params.title !== undefined) {
      dialogue.title = params.title;
    }
    
    if (params.metadata !== undefined) {
      dialogue.metadata = {
        ...dialogue.metadata,
        ...params.metadata,
      };
    }
    
    dialogue.updatedAt = Date.now();
    
    // Сохраняем обновленный диалог
    dialogues.set(params.id, dialogue);
    
    return dialogue;
  }
  
  /**
   * Добавляет сообщение в диалог
   */
  static addMessage(params: AddMessageParams): DialogueMessage | null {
    const dialogue = dialogues.get(params.dialogueId);
    
    if (!dialogue) {
      return null;
    }
    
    const message: DialogueMessage = {
      id: generateId(),
      content: params.content,
      role: params.role,
      timestamp: Date.now(),
    };
    
    dialogue.messages.push(message);
    dialogue.updatedAt = message.timestamp;
    
    // Сохраняем обновленный диалог
    dialogues.set(params.dialogueId, dialogue);
    
    return message;
  }
  
  /**
   * Удаляет диалог
   */
  static deleteDialogue(id: string): boolean {
    return dialogues.delete(id);
  }
  
  /**
   * Получает все диалоги пользователя
   */
  static getUserDialogues(userId: string): Dialogue[] {
    return Array.from(dialogues.values())
      .filter(dialogue => dialogue.userId === userId)
      .sort((a, b) => b.updatedAt - a.updatedAt); // Сортировка по времени обновления
  }
  
  /**
   * Удаляет все диалоги пользователя
   */
  static deleteUserDialogues(userId: string): number {
    let count = 0;
    
    // Используем более совместимый способ итерации по Map
    const idsToDelete: string[] = [];
    
    dialogues.forEach((dialogue, id) => {
      if (dialogue.userId === userId) {
        idsToDelete.push(id);
      }
    });
    
    // Удаляем диалоги после итерации, чтобы избежать проблем с изменением коллекции во время перебора
    idsToDelete.forEach(id => {
      dialogues.delete(id);
      count++;
    });
    
    return count;
  }
  
  /**
   * Очищает сообщения диалога
   */
  static clearDialogueMessages(id: string): boolean {
    const dialogue = dialogues.get(id);
    
    if (!dialogue) {
      return false;
    }
    
    dialogue.messages = [];
    dialogue.updatedAt = Date.now();
    dialogues.set(id, dialogue);
    
    return true;
  }
}

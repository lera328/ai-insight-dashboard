/**
 * Типы и интерфейсы для работы с диалогами
 */

/**
 * Сообщение в диалоге
 */
export interface DialogueMessage {
  /** Уникальный идентификатор сообщения */
  id: string;
  /** Содержимое сообщения */
  content: string;
  /** Роль отправителя: 'user' или 'assistant' */
  role: 'user' | 'assistant';
  /** Временная метка создания */
  timestamp: number;
}

/**
 * Диалог между пользователем и AI
 */
export interface Dialogue {
  /** Уникальный идентификатор диалога */
  id: string;
  /** Заголовок диалога */
  title: string;
  /** Временная метка создания */
  createdAt: number;
  /** Временная метка последнего обновления */
  updatedAt: number;
  /** Сообщения в диалоге */
  messages: DialogueMessage[];
  /** ID пользователя */
  userId: string;
  /** Метаданные диалога (для дополнительной информации) */
  metadata?: Record<string, any>;
}

/**
 * Параметры создания нового диалога
 */
export interface CreateDialogueParams {
  /** Заголовок диалога */
  title: string;
  /** Начальное сообщение пользователя (если есть) */
  initialMessage?: string;
  /** ID пользователя */
  userId: string;
  /** Метаданные диалога */
  metadata?: Record<string, any>;
}

/**
 * Параметры обновления диалога
 */
export interface UpdateDialogueParams {
  /** ID диалога */
  id: string;
  /** Новый заголовок (если изменился) */
  title?: string;
  /** Новые метаданные (если изменились) */
  metadata?: Record<string, any>;
}

/**
 * Параметры добавления сообщения в диалог
 */
export interface AddMessageParams {
  /** ID диалога */
  dialogueId: string;
  /** Содержимое сообщения */
  content: string;
  /** Роль отправителя */
  role: 'user' | 'assistant';
}

/**
 * Сервис для взаимодействия с API Ollama для генерации ответов ИИ
 */
export interface ChatCompletionParams {
  messages: { role: string; content: string }[];
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OllamaService {
  /**
   * Получает URL API Ollama из переменных окружения или использует значение по умолчанию
   */
  private static getApiUrl(): string {
    return process.env.OLLAMA_API_URL || 'http://localhost:11434';
  }

  /**
   * Генерирует ответ на основе истории сообщений чата
   */
  static async generateChatCompletion(params: ChatCompletionParams): Promise<string> {
    const apiUrl = this.getApiUrl();
    
    try {
      // Подготавливаем сообщения для запроса
      const messages = [...params.messages];
      
      // Добавляем системный промпт, если он предоставлен
      if (params.systemPrompt) {
        messages.unshift({ role: 'system', content: params.systemPrompt });
      }
      
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: params.model,
          messages,
          temperature: params.temperature || 0.7,
          max_tokens: params.maxTokens || 2000,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.message?.content || '';
    } catch (error) {
      console.error('Error calling Ollama API:', error);
      throw new Error(`Failed to generate AI response: ${(error as Error).message}`);
    }
  }
}

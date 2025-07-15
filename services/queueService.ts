import { InsightResponse } from "@/services/aiService";

// Определяем тип для запроса инсайтов
type InsightRequest = {
  topic: string;
  modelParams: {
    model: string;
    temperature: number;
  };
};

type QueueItem = {
  id: string;
  request: InsightRequest;
  onProgress?: (progress: number) => void;
  onComplete: (response: InsightResponse) => void;
  onError: (error: Error) => void;
};

class QueueService {
  private queue: QueueItem[] = [];
  private isProcessing: boolean = false;
  private readonly MAX_CONCURRENT_REQUESTS = 1; // Может быть увеличено при необходимости
  private activeRequests: number = 0;

  /**
   * Добавляет запрос к ИИ в очередь
   */
  enqueue(
    request: InsightRequest, 
    onComplete: (response: InsightResponse) => void,
    onError: (error: Error) => void,
    onProgress?: (progress: number) => void
  ): string {
    const id = Math.random().toString(36).substring(2, 9);
    
    this.queue.push({
      id,
      request,
      onComplete,
      onError,
      onProgress
    });
    
    // Запуск обработки, если она еще не идет
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return id;
  }

  /**
   * Отменяет запрос в очереди по его ID
   */
  cancel(id: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(item => item.id !== id);
    return initialLength > this.queue.length;
  }

  /**
   * Обрабатывает очередь запросов
   */
  private async processQueue() {
    if (this.queue.length === 0 || this.activeRequests >= this.MAX_CONCURRENT_REQUESTS) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    this.activeRequests++;

    const item = this.queue.shift()!;
    
    try {
      // Имитация индикатора прогресса
      if (item.onProgress) {
        const progressInterval = setInterval(() => {
          const randomProgress = Math.floor(Math.random() * 20) + 5; // 5-25% за раз
          item.onProgress?.(randomProgress);
        }, 1000);
        
        // Очистим интервал после обработки
        setTimeout(() => clearInterval(progressInterval), 10000);
      }
      
      // Выполнение запроса к ИИ
      const response = await this.executeRequest(item.request);
      item.onComplete(response);
    } catch (error) {
      item.onError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.activeRequests--;
      // Продолжаем обработку очереди
      this.processQueue();
    }
  }

  /**
   * Выполняет запрос к ИИ API
   */
  private async executeRequest(request: InsightRequest): Promise<InsightResponse> {
    const response = await fetch('/api/insight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// Экспорт синглтона
export const queueService = new QueueService();

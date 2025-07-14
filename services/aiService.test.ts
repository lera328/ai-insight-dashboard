/**
 * @fileoverview Модульные тесты для сервиса AI анализа текста
 * Проверяет корректность работы функций из aiService.ts
 */

import { 
  analyzeText, 
  validateAnalysisRequest,
  AIServiceError,
  AIServiceConfig,
  InsightResponse,
  AnalysisRequest
} from './aiService';

// Мокаем глобальный fetch
global.fetch = jest.fn() as jest.Mock;

// Мокаем setTimeout для синхронного выполнения тестов
jest.useFakeTimers();

/**
 * Вспомогательная функция для создания тестовых данных ответа
 */
function createMockInsightResponse(): InsightResponse {
  return {
    summary: 'Тестовый текст анализа.',
    keyConcepts: [
      { name: 'Тестирование', color: 'blue' },
      { name: 'AI сервис', color: 'green' }
    ],
    relatedLinks: [
      { title: 'Документация по Jest', url: 'https://jestjs.io/docs/getting-started' }
    ],
    generationTimeMs: 123
  };
}

/**
 * Вспомогательная функция для сброса моков перед каждым тестом
 */
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('validateAnalysisRequest', () => {
  test('должна успешно пропускать валидные данные', () => {
    const validRequest = { topic: 'Тестовая тема для анализа' };
    expect(() => validateAnalysisRequest(validRequest)).not.toThrow();
  });

  test('должна выбросить ошибку при отсутствии темы', () => {
    const invalidRequest = {} as Partial<AnalysisRequest>;
    expect(() => validateAnalysisRequest(invalidRequest))
      .toThrow(new AIServiceError('Требуется валидная тема для анализа', 400));
  });

  test('должна выбросить ошибку при пустой теме', () => {
    const invalidRequest = { topic: '' } as Partial<AnalysisRequest>;
    expect(() => validateAnalysisRequest(invalidRequest))
      .toThrow(new AIServiceError('Требуется валидная тема для анализа', 400));
  });

  test('должна выбросить ошибку при слишком короткой теме', () => {
    const invalidRequest = { topic: 'AB' } as Partial<AnalysisRequest>;
    expect(() => validateAnalysisRequest(invalidRequest))
      .toThrow(new AIServiceError('Текст слишком короткий для анализа (минимум 3 символа)', 400));
  });

  test('должна выбросить ошибку при слишком длинной теме', () => {
    // Создаем строку длиннее максимального лимита
    const longString = 'A'.repeat(10001);
    const invalidRequest = { topic: longString } as Partial<AnalysisRequest>;
    
    expect(() => validateAnalysisRequest(invalidRequest))
      .toThrow(new AIServiceError('Текст превышает максимально допустимый размер (10000 символов)', 400));
  });

  test('должна работать с кастомными параметрами валидации', () => {
    const request = { topic: 'ABC' } as Partial<AnalysisRequest>;
    const customOptions = { minLength: 5, maxLength: 100 };
    
    expect(() => validateAnalysisRequest(request, customOptions))
      .toThrow(new AIServiceError(`Текст слишком короткий для анализа (минимум 5 символа)`, 400));
  });
});

describe('analyzeText', () => {
  test('должна вернуть корректный результат', async () => {
    // Создаём мок функции generateMockInsights вместо реального вызова
    const mockInsights = {
      summary: 'Тестовый обзор',
      keyConcepts: [
        { name: 'Понятие 1', color: 'blue' },
        { name: 'Понятие 2', color: 'green' }
      ],
      relatedLinks: [
        { title: 'Ссылка 1', url: 'https://example.com/1' }
      ]
    };
    
    // Мокаем успешный ответ от API
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInsights
    });

    // Вызываем функцию анализа
    const request: AnalysisRequest = { topic: 'Тестовая тема' };
    const config: AIServiceConfig = { 
      baseUrl: 'https://example.com/api',
      apiKey: 'test-key',
      useMockData: false // Используем реальный API, но он мокирован
    };
    
    const result = await analyzeText(request, config);
    
    // Проверяем результат
    expect(result.summary).toBe(mockInsights.summary);
    expect(result.keyConcepts).toEqual(mockInsights.keyConcepts);
    expect(result.relatedLinks).toEqual(mockInsights.relatedLinks);
    expect(result.generationTimeMs).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.requestLength).toBe(request.topic.length);
  });

  test('должна правильно обрабатывать реальный API запрос с успешным ответом', async () => {
    // Мокаем успешный ответ от API
    const mockResponse = createMockInsightResponse();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Подготавливаем запрос для реального API
    const request: AnalysisRequest = { topic: 'Тестовая тема для анализа API' };
    const config: AIServiceConfig = { 
      baseUrl: 'https://test.example.com',
      apiKey: 'test-api-key',
      useMockData: false
    };

    // Выполняем тестируемую функцию
    const result = await analyzeText(request, config);

    // Проверяем, что fetch был вызван с правильными параметрами
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${config.baseUrl}/analyze`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        }),
        body: expect.any(String)
      })
    );

    // Проверяем результат
    expect(result).toEqual(expect.objectContaining(mockResponse));
    expect(result.generationTimeMs).toBeDefined();
  });

  test('должна выбросить ошибку при отсутствии API ключа в конфигурации', async () => {
    // Мокаем ответ API с ошибкой аутентификации
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    // Подготавливаем запрос без API ключа
    const request: AnalysisRequest = { topic: 'Тест без API ключа' };
    const config: AIServiceConfig = { 
      baseUrl: 'https://test.example.com',
      useMockData: false
    };

    // Проверяем, что функция выбрасывает ошибку
    await expect(analyzeText(request, config))
      .rejects
      .toThrow(/Ошибка при генерации инсайтов: Ошибка API: 401 Unauthorized/);

    // Проверяем, что fetch был вызван без заголовка авторизации
    expect(fetch).toHaveBeenCalledTimes(1);
    const fetchCall = (fetch as jest.Mock).mock.calls[0][1];
    const headers = fetchCall.headers;
    expect(headers).not.toHaveProperty('Authorization');
  });

  test('должна правильно обрабатывать ошибку от API сервиса', async () => {
    // Мокаем ответ API с ошибкой сервера
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    // Подготавливаем запрос
    const request: AnalysisRequest = { topic: 'Тестовая тема для ошибки сервера' };
    const config: AIServiceConfig = { 
      baseUrl: 'https://test.example.com',
      apiKey: 'test-api-key',
      useMockData: false
    };

    // Проверяем, что функция выбрасывает ошибку
    await expect(analyzeText(request, config))
      .rejects
      .toThrow(/Ошибка при генерации инсайтов: Ошибка API: 500 Internal Server Error/);
  });

  test('должна обрабатывать таймаут запроса', async () => {
    // Мокаем ошибку таймаута
    const abortError = new Error('The request was aborted');
    abortError.name = 'AbortError';
    (fetch as jest.Mock).mockRejectedValueOnce(abortError);

    // Подготавливаем запрос с низким таймаутом
    const request: AnalysisRequest = { topic: 'Тест таймаута' };
    const config: AIServiceConfig = { 
      baseUrl: 'https://test.example.com',
      apiKey: 'test-api-key',
      timeoutMs: 100,
      useMockData: false
    };

    // Проверяем, что функция выбрасывает ошибку таймаута
    await expect(analyzeText(request, config))
      .rejects
      .toThrow(/Ошибка при генерации инсайтов: Тайм-аут запроса \(100ms\)/);
  });

  test('должна обрабатывать некорректный ответ API', async () => {
    // Мокаем ответ с некорректным форматом JSON
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    // Подготавливаем запрос
    const request: AnalysisRequest = { topic: 'Тест некорректного JSON' };
    const config: AIServiceConfig = { 
      baseUrl: 'https://test.example.com',
      apiKey: 'test-api-key',
      useMockData: false
    };

    // Проверяем, что функция выбрасывает корректную ошибку
    await expect(analyzeText(request, config))
      .rejects
      .toThrow(new AIServiceError('Ошибка при генерации инсайтов: Invalid JSON', 500));
  });
});

describe('AIServiceError', () => {
  test('должна корректно создавать экземпляр ошибки', () => {
    const error = new AIServiceError('Тестовая ошибка', 404);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AIServiceError');
    expect(error.message).toBe('Тестовая ошибка');
    expect(error.statusCode).toBe(404);
  });
});

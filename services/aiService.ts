/**
 * @fileoverview Сервис для взаимодействия с внешним ИИ API
 * Предоставляет методы для генерации инсайтов на основе входного текста
 */

// ------------------- Типы и интерфейсы -------------------

/**
 * Настройки для API запросов к внешнему сервису ИИ
 */
export interface AIServiceConfig {
  /** Базовый URL для API запросов */
  baseUrl: string;
  /** API ключ для аутентификации */
  apiKey?: string;
  /** Таймаут запроса в миллисекундах */
  timeoutMs?: number;
  /** Флаг для использования режима заглушки вместо реальных API запросов */
  useMockData: boolean;
}

/**
 * Интерфейс для информации о загруженном файле
 */
export interface FileInfo {
  /** Имя файла */
  name: string;
  /** Размер файла в форматированном виде */
  size: string;
  /** Количество символов в файле */
  chars: number;
}

/**
 * Интерфейс для входных данных запроса на анализ текста
 */
export interface AnalysisRequest {
  /** Текст или тема для анализа */
  topic: string;
  /** Язык ответа (по умолчанию "ru") */
  language?: string;
  /** Параметры модели ИИ */
  modelParams?: Record<string, any>;
  /** Информация о загруженном файле (если анализируется файл) */
  fileInfo?: FileInfo;
}

/**
 * Интерфейс для представления связанных ссылок
 */
export interface RelatedLink {
  /** URL ссылки */
  url: string;
  /** Заголовок ссылки */
  title: string;
}

/**
 * Интерфейс для представления ключевых понятий
 */
export interface KeyConcept {
  /** Название понятия */
  name: string;
  /** Цвет для визуализации (используется в UI) */
  color: string;
  /** Опциональное краткое описание понятия */
  description?: string;
}

/**
 * Структура полного ответа от API генерации инсайтов
 */
export interface InsightResponse {
  /** Обзорная аналитика текста */
  summary: string;
  /** Список ключевых понятий */
  keyConcepts: KeyConcept[];
  /** Список рекомендуемых материалов для дополнительного чтения */
  relatedLinks: RelatedLink[];
  /** Время генерации в миллисекундах */
  generationTimeMs?: number;
  /** Метаданные о запросе */
  metadata?: Record<string, any>;
}

/**
 * Параметры валидации для текстовых запросов
 */
export interface ValidationOptions {
  /** Минимальная длина текста */
  minLength: number;
  /** Максимальная длина текста */
  maxLength: number;
}

/**
 * Ошибка взаимодействия с ИИ сервисом
 */
export class AIServiceError extends Error {
  /** Код статуса HTTP (если применимо) */
  statusCode?: number;
  
  /**
   * Создает новую ошибку ИИ сервиса
   * @param message - Сообщение об ошибке
   * @param statusCode - Код статуса HTTP (опционально)
   */
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'AIServiceError';
    this.statusCode = statusCode;
  }
}

// ------------------- Конфигурационные константы -------------------

/**
 * Дефолтные настройки валидации текста
 */
const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  minLength: 3,
  maxLength: 10000
};

/**
 * Дефолтные настройки сервиса ИИ
 */
const DEFAULT_SERVICE_CONFIG: AIServiceConfig = {
  baseUrl: 'http://localhost:11434/api', // Ollama API URL
  timeoutMs: 30000,
  useMockData: false // Теперь используем реальный API Ollama
};

// ------------------- Утилиты и валидация -------------------

/**
 * Валидирует входные данные для анализа
 * 
 * @param request - Запрос на анализ
 * @param options - Параметры валидации
 * @throws {AIServiceError} Если данные не проходят валидацию
 */
export function validateAnalysisRequest(
  request: Partial<AnalysisRequest>, 
  options: ValidationOptions = DEFAULT_VALIDATION_OPTIONS
): asserts request is AnalysisRequest {
  // Проверяем наличие темы
  if (!request.topic || typeof request.topic !== 'string' || !request.topic.trim()) {
    throw new AIServiceError('Требуется валидная тема для анализа', 400);
  }
  
  // Проверяем длину темы
  if (request.topic.length < options.minLength) {
    throw new AIServiceError(`Текст слишком короткий для анализа (минимум ${options.minLength} символа)`, 400);
  }
  
  if (request.topic.length > options.maxLength) {
    throw new AIServiceError(`Текст превышает максимально допустимый размер (${options.maxLength} символов)`, 400);
  }
}

// ------------------- Основной сервисный модуль -------------------

/**
 * Генерирует инсайты по заданной теме с использованием ИИ
 * 
 * @param request - Запрос на анализ текста или темы
 * @param config - Настройки сервиса ИИ API
 * @param validationOptions - Настройки валидации входного текста
 * @returns Promise с результатом анализа
 * @throws {AIServiceError} Ошибка при взаимодействии с ИИ сервисом
 */
export async function analyzeText(
  request: Partial<AnalysisRequest>, 
  config: AIServiceConfig = DEFAULT_SERVICE_CONFIG,
  validationOptions: ValidationOptions = DEFAULT_VALIDATION_OPTIONS
): Promise<InsightResponse> {
  try {
    // Валидируем входные данные
    validateAnalysisRequest(request, validationOptions);
    
    // Засекаем время выполнения
    const startTime = performance.now();
    
    // Результат анализа
    let result: InsightResponse;
    
    // Используем мок-данные или реальный API запрос
    if (config.useMockData) {
      // Если указано использовать заглушки, генерируем локально
      // Имитируем задержку для реалистичности
      await simulateNetworkDelay();
      
      // Генерируем тестовые данные
      result = generateMockInsights(request);
    } else {
      // Отправляем запрос к внешнему API
      result = await callExternalAiService(request, config);
    }
    
    // Рассчитываем время выполнения
    const endTime = performance.now();
    
    // Добавляем дополнительные метаданные
    result.generationTimeMs = Math.round(endTime - startTime);
    result.metadata = {
      ...result.metadata,
      requestLength: request.topic.length,
      timestamp: new Date().toISOString()
    };
    
    return result;
  } catch (error: unknown) {
    // Если это уже наша ошибка, просто пробрасываем ее дальше
    if (error instanceof AIServiceError) {
      throw error;
    }
    
    // Иначе оборачиваем в нашу ошибку
    throw new AIServiceError(
      `Ошибка при генерации инсайтов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, 
      500
    );
  }
}

/**
 * Обертка для обратной совместимости с ранее созданным кодом
 * 
 * @param topic - Тема или текст для анализа
 * @returns Promise с результатом анализа
 * @throws {AIServiceError} Ошибка при взаимодействии с ИИ сервисом
 */
export function generateInsights(topic: string): Promise<InsightResponse> {
  return analyzeText({ topic });
}

// ------------------- Вспомогательные функции -------------------

/**
 * Имитирует задержку сетевого запроса
 * 
 * @param minMs - Минимальная задержка в миллисекундах
 * @param maxMs - Максимальная задержка в миллисекундах
 */
async function simulateNetworkDelay(minMs = 800, maxMs = 2000): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Вызывает Ollama API для генерации инсайтов
 * 
 * @param request - Запрос на анализ
 * @param config - Конфигурация сервиса
 * @returns Promise с результатом анализа
 */
async function callExternalAiService(
  request: Partial<AnalysisRequest>,
  config: AIServiceConfig
): Promise<InsightResponse> {
  if (!request.topic) {
    throw new AIServiceError('Пустой запрос. Пожалуйста, укажите текст или тему для анализа.', 400);
  }

  const language = request.language || 'ru';
  
  // Формируем дополнительный контекст для промпта, если есть информация о файле
  let fileContext = '';
  if (request.fileInfo) {
    fileContext = `Ты анализируешь содержимое файла "${request.fileInfo.name}", размером ${request.fileInfo.size} (${request.fileInfo.chars} символов). 
При анализе файла обрати особое внимание на его тип и структуру.
Выдели ключевые темы и структурные элементы файла.
`;
  }

  // Системный промпт для Ollama, инструктирующий модель выдавать структурированный JSON
  const systemPrompt = `Ты эксперт по анализу текста. Твоя задача - проанализировать предоставленный текст или тему и предоставить структурированные инсайты.

${fileContext}
Отвечай на языке: ${language}.

Ты ДОЛЖЕН вернуть только валидный JSON объект в следующем формате:

{
  "summary": "Подробный обзор темы или файла, с основными выводами и точками зрения (300-600 символов)",
  "keyConcepts": [
    { "name": "Ключевое понятие 1", "color": "цвет в CSS-формате или название", "description": "Краткое описание понятия" },
    { "name": "Ключевое понятие 2", "color": "цвет" },
    // ещё 3-6 ключевых понятий
  ],
  "relatedLinks": [
    { "title": "Название ресурса 1", "url": "http://example.com/resource1" },
    { "title": "Название ресурса 2", "url": "http://example.com/resource2" },
    // ещё 2-4 ссылки на полезные ресурсы
  ]
}

Используй реальные URL для ссылок, и указывай только надежные ресурсы. Для цветов используй стандартные названия CSS-цветов или классы цветов в формате "bg-blue-500".

Если ты анализируешь файл, включи в свой анализ особенности формата файла, его структуру и основные компоненты.`;

  try {
    // Создаем контроллер для ограничения времени ожидания ответа
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 30000);
    
    // Формируем запрос к Ollama API
    const response = await fetch(`${config.baseUrl}/generate`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.modelParams?.model || 'llama3.2:latest', // По умолчанию используем llama3.2
        prompt: request.topic,
        system: systemPrompt,
        format: 'json',
        options: {
          temperature: request.modelParams?.temperature || 0.7
        },
        stream: false
      })
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new AIServiceError(
        `Ошибка Ollama API: ${response.status} ${response.statusText}`,
        response.status
      );
    }
    
    const ollamaResponse = await response.json();
    
    // Преобразуем ответ Ollama в формат InsightResponse
    let insightData: InsightResponse;
    try {
      // Предполагаем, что Ollama вернет JSON строку в поле response
      const jsonContent = ollamaResponse.response;
      // Пробуем распарсить JSON из ответа модели
      const parsedData = JSON.parse(jsonContent);
      
      // Проверяем, что в ответе есть все необходимые поля
      if (!parsedData.summary || !Array.isArray(parsedData.keyConcepts) || !Array.isArray(parsedData.relatedLinks)) {
        throw new Error('Неверный формат ответа от модели');
      }
      
      insightData = {
        summary: parsedData.summary,
        keyConcepts: parsedData.keyConcepts,
        relatedLinks: parsedData.relatedLinks,
        metadata: {
          model: ollamaResponse.model,
          total_duration: ollamaResponse.total_duration,
          load_duration: ollamaResponse.load_duration,
          prompt_eval_count: ollamaResponse.prompt_eval_count,
          eval_count: ollamaResponse.eval_count
        }
      };
    } catch (parseError) {
      console.error('Ошибка при парсинге ответа Ollama:', parseError);
      
      // Если не удалось распарсить JSON, создаем базовую структуру с исходным ответом
      insightData = {
        summary: 'Модель вернула ответ в неправильном формате. Пожалуйста, попробуйте еще раз.',
        keyConcepts: [{ name: 'Ошибка формата', color: 'red', description: 'Модель не смогла сгенерировать корректный JSON' }],
        relatedLinks: [{ title: 'Документация Ollama', url: 'https://ollama.com/docs' }],
        metadata: { rawResponse: ollamaResponse.response }
      };
    }
    
    return insightData;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIServiceError(`Тайм-аут запроса к Ollama (${config.timeoutMs || 30000}ms)`, 408);
    }
    throw error;
  }
}

/**
 * Генерирует тестовые инсайты на основе запроса
 * 
 * @param request - Запрос на анализ
 * @returns Сгенерированные тестовые инсайты
 */
function generateMockInsights(request: AnalysisRequest): InsightResponse {
  return {
    summary: generatePlaceholderSummary(request.topic),
    keyConcepts: generatePlaceholderConcepts(request.topic),
    relatedLinks: generatePlaceholderLinks(request.topic)
  };
}

/**
 * Генерирует тестовый текст обзора на основе темы
 * 
 * @param topic - Тема для генерации обзора
 * @returns Сгенерированный текст обзора
 * @private
 */
function generatePlaceholderSummary(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  // Определяем базовую тему
  let domain = 'технологии';
  if (topicLower.includes('искусственн') || topicLower.includes('ии') || topicLower.includes('ai')) {
    domain = 'искусственный интеллект';
  } else if (topicLower.includes('язык') || topicLower.includes('перевод') || topicLower.includes('nlp')) {
    domain = 'обработка естественного языка';
  } else if (topicLower.includes('данн') || topicLower.includes('аналит') || topicLower.includes('stat')) {
    domain = 'анализ данных';
  }
  
  // Генерируем текст обзора в зависимости от тематики
  return `Данный текст содержит анализ основных концепций ${domain} и их практическое применение. 
  Рассмотрены ключевые методы и инструменты, используемые в этой области, а также современные тенденции развития. 
  Особое внимание уделено практическим аспектам и применению технологий ${domain} в бизнесе и научных исследованиях.
  Текст предназначен для специалистов среднего уровня подготовки и предполагает базовое знакомство с предметной областью.`;
}

/**
 * Генерирует тестовый список ключевых понятий на основе темы
 * 
 * @param topic - Тема для генерации понятий
 * @returns Массив ключевых понятий
 * @private
 */
function generatePlaceholderConcepts(topic: string): KeyConcept[] {
  const topicLower = topic.toLowerCase();
  
  const commonConcepts: KeyConcept[] = [
    { name: 'Аналитика данных', color: 'blue' },
    { name: 'Машинное обучение', color: 'purple' },
    { name: 'Алгоритмическая эффективность', color: 'green' },
    { name: 'Цифровая трансформация', color: 'yellow' },
    { name: 'Этика технологий', color: 'red' }
  ];
  
  const aiConcepts: KeyConcept[] = [
    { name: 'Нейронные сети', color: 'blue' },
    { name: 'Трансформеры', color: 'purple' },
    { name: 'Машинное обучение', color: 'green' },
    { name: 'Генеративный ИИ', color: 'yellow' },
    { name: 'Этика ИИ', color: 'red' }
  ];
  
  const nlpConcepts: KeyConcept[] = [
    { name: 'Обработка естественного языка', color: 'blue' },
    { name: 'Анализ тональности', color: 'purple' },
    { name: 'Многоязычные модели', color: 'green' },
    { name: 'Языковые трансформеры', color: 'yellow' },
    { name: 'Семантический анализ', color: 'red' }
  ];
  
  if (topicLower.includes('искусственн') || topicLower.includes('ии') || topicLower.includes('ai')) {
    return aiConcepts;
  } else if (topicLower.includes('язык') || topicLower.includes('перевод') || topicLower.includes('nlp')) {
    return nlpConcepts;
  }
  
  return commonConcepts;
}

/**
 * Генерирует тестовые ссылки на основе темы
 * 
 * @param topic - Тема для генерации ссылок
 * @returns Массив связанных ссылок
 * @private
 */
function generatePlaceholderLinks(topic: string): RelatedLink[] {
  const topicLower = topic.toLowerCase();
  
  const commonLinks: RelatedLink[] = [
    { title: 'Введение в анализ данных', url: 'https://example.com/data-analysis-intro' },
    { title: 'Современные технологии обработки информации', url: 'https://example.com/modern-tech' },
    { title: 'Этические аспекты использования технологий', url: 'https://example.com/tech-ethics' }
  ];
  
  const aiLinks: RelatedLink[] = [
    { title: 'Основы искусственного интеллекта', url: 'https://example.com/ai-basics' },
    { title: 'Нейронные сети и глубокое обучение', url: 'https://example.com/neural-networks' },
    { title: 'Этические проблемы в развитии ИИ', url: 'https://example.com/ai-ethics' }
  ];
  
  const nlpLinks: RelatedLink[] = [
    { title: 'Введение в обработку естественного языка', url: 'https://example.com/nlp-intro' },
    { title: 'Трансформеры и языковые модели', url: 'https://example.com/transformers' },
    { title: 'Многоязычный анализ текста', url: 'https://example.com/multilingual-nlp' }
  ];
  
  if (topicLower.includes('искусственн') || topicLower.includes('ии') || topicLower.includes('ai')) {
    return aiLinks;
  } else if (topicLower.includes('язык') || topicLower.includes('перевод') || topicLower.includes('nlp')) {
    return nlpLinks;
  }
  
  return commonLinks;
}

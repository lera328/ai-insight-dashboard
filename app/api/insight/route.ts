/**
 * @fileoverview API маршрут для генерации инсайтов с использованием ИИ
 * Обрабатывает POST-запросы и возвращает структурированную аналитику
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeText, AIServiceError, InsightResponse, AnalysisRequest } from '@/services/aiService';

/**
 * Обрабатывает POST запросы к API эндпоинту /api/insight
 * Принимает тему для анализа и возвращает сгенерированные инсайты
 * 
 * @param request - Входящий HTTP запрос
 * @returns NextResponse с результатами анализа или сообщением об ошибке
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Парсинг JSON из тела запроса
    const body = await request.json() as Partial<AnalysisRequest>;
    
    // Проверка наличия обязательных полей в запросе
    if (!body || !body.topic) {
      return NextResponse.json(
        { error: 'Отсутствует обязательное поле "topic" в запросе' },
        { status: 400 }
      );
    }
    
    // Логируем входящий запрос для отладки
    console.log(`Получен запрос на анализ: ${body.topic.substring(0, 30)}${
      body.topic.length > 30 ? '...' : ''
    }`);
    
    // Создаем объект запроса с обязательными и опциональными полями
    const analysisRequest: AnalysisRequest = {
      topic: body.topic,
      language: body.language || 'ru',
      modelParams: body.modelParams,
      fileInfo: body.fileInfo
    };
    
    // Если переданы параметры модели, логируем их
    if (body.modelParams) {
      console.log(`Используемая модель Ollama: ${body.modelParams.model || 'llama3.2:latest'}, Температура: ${body.modelParams.temperature || 0.7}`);
    }
    
    // Если передана информация о файле, логируем её
    if (body.fileInfo) {
      console.log(`Анализируем файл: ${body.fileInfo.name}, Размер: ${body.fileInfo.size}, Символов: ${body.fileInfo.chars}`);
    }
    
    // Вызов модульного сервиса для анализа с запросом
    const insightResult: InsightResponse = await analyzeText(analysisRequest);
    
    // Логирование успешного запроса
    console.log(`Успешно сгенерированы инсайты ${insightResult.generationTimeMs ? 
      `(время: ${insightResult.generationTimeMs}ms)` : ''}`);
    
    // Возвращаем результат
    return NextResponse.json(insightResult, { status: 200 });
    
  } catch (error) {
    // Обработка ошибок
    console.error('Ошибка API insight:', error);
    
    // Определяем тип ошибки и соответствующий код ответа
    if (error instanceof AIServiceError) {
      // Используем код статуса из ошибки, если он есть
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }
    
    // Для неизвестных ошибок
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при генерации инсайтов' },
      { status: 500 }
    );
  }
}

/**
 * Обработчик для неподдерживаемых HTTP методов
 * 
 * @param request - Входящий HTTP запрос
 * @returns Сообщение о неподдерживаемом методе
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return methodNotAllowed(request);
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  return methodNotAllowed(request);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  return methodNotAllowed(request);
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return methodNotAllowed(request);
}

/**
 * Создает стандартный ответ для неподдерживаемых HTTP методов
 * 
 * @param request - Входящий HTTP запрос
 * @returns NextResponse с ошибкой 405 Method Not Allowed
 */
function methodNotAllowed(request: NextRequest): NextResponse {
  return NextResponse.json(
    { error: `Метод ${request.method} не поддерживается для этого эндпоинта` },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

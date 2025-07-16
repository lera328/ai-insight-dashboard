import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ChatMessage, ChatCompletionRequest, createChatCompletion } from '@/services/aiService';

interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

/**
 * API обработчик запросов чата
 */
export async function POST(request: Request) {
  // Проверка аутентификации
  const token = await getToken({ req: request as any, secret: "development-secret-key-do-not-use-in-production" });
  if (!token || !token.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const data: ChatRequest = await request.json();
    const { message, history } = data;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // Добавляем новое сообщение пользователя в историю
    const messages = [...history, { role: 'user' as const, content: message }];
    
    // Получаем значения из переменных окружения для конфигурации AI
    const ollamaApiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';
    const defaultModel = process.env.DEFAULT_AI_MODEL || 'llama3';
    
    // Создаем запрос к модели
    const chatRequest: ChatCompletionRequest = {
      messages,
      model: defaultModel,
      temperature: 0.7
    };
    
    // Вызываем AI сервис для генерации ответа
    try {
      const response = await createChatCompletion(chatRequest, {
        baseUrl: ollamaApiUrl,
        timeoutMs: 60000,
        useMockData: !ollamaApiUrl.startsWith('http') // Используем заглушку, если API URL не настроен
      });
      
      return NextResponse.json({ reply: response.content, model: response.model });
    } catch (aiError: any) {
      console.error('AI Service error:', aiError);
      
      // Если не удалось получить ответ от AI модели, возвращаем запасной ответ
      return NextResponse.json({ 
        reply: `К сожалению, не удалось получить ответ от AI-модели: ${aiError.message}. Пожалуйста, проверьте настройки Ollama API или попробуйте позже.`,
        error: aiError.message
      }, { status: 200 }); // Все равно возвращаем 200, чтобы UI мог показать сообщение об ошибке
    }
  } catch (error: any) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: `Failed to process chat request: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

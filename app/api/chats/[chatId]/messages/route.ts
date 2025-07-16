import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ChatService } from '@/services/chatService';
import { OllamaService } from '@/services/ollamaService';

/**
 * Получение сообщений конкретного чата по ID
 */
export async function GET(
  request: Request, 
  { params }: { params: { chatId: string } }
) {
  try {
    // Проверка аутентификации
    const token = await getToken({ req: request as any, secret: "development-secret-key-do-not-use-in-production" });
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub;
    const { chatId } = params;
    
    // Получаем чат с сообщениями и проверкой владельца
    const chat = await ChatService.getChat(chatId, userId);
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found or not owned by user' }, { status: 404 });
    }
    
    return NextResponse.json({ messages: chat.messages });
  } catch (error: any) {
    console.error(`Error fetching messages for chat ${params.chatId}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch messages: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * Отправка нового сообщения в чат
 */
export async function POST(
  request: Request, 
  { params }: { params: { chatId: string } }
) {
  try {
    // Проверка аутентификации
    const token = await getToken({ req: request as any, secret: "development-secret-key-do-not-use-in-production" });
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub;
    const { chatId } = params;
    
    // Получаем данные из запроса
    const data = await request.json();
    const { content, generateAiResponse } = data;
    
    // Валидация
    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }
    
    // Проверяем наличие чата и доступ пользователя
    const chat = await ChatService.getChat(chatId, userId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found or not owned by user' }, { status: 404 });
    }
    
    // Отправляем сообщение пользователя
    const message = await ChatService.addMessage(chatId, 'user', content);
    
    // Если требуется генерация ответа ИИ
    let aiMessage = null;
    if (generateAiResponse) {
      // Получаем историю сообщений для передачи в модель
      const updatedChat = await ChatService.getChat(chatId, userId);
      const chatHistory = updatedChat?.messages;
      
      // Системный промпт из настроек чата
      const systemPrompt = chat.systemPrompt || undefined;
      
      // Форматируем историю для отправки в модель
      const formattedHistory = chatHistory?.map(msg => ({
        role: msg.role,
        content: msg.content
      })) || [];
      
      try {
        // Получаем ответ от модели через сервис Ollama
        const aiResponse = await OllamaService.generateChatCompletion({
          messages: formattedHistory,
          model: chat.model || process.env.DEFAULT_AI_MODEL || 'llama2',
          systemPrompt: systemPrompt,
          temperature: chat.temperature || 0.7
        });
        
        // Сохраняем ответ ИИ в базе данных
        if (aiResponse) {
          aiMessage = await ChatService.addMessage(chatId, 'assistant', aiResponse);
        }
      } catch (aiError) {
        console.error('Error generating AI response:', aiError);
        // Создаем сообщение об ошибке от ИИ
        aiMessage = await ChatService.addMessage(
          chatId, 
          'assistant', 
          'Извините, произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.'
        );
      }
    }
    
    return NextResponse.json({ 
      message,
      aiMessage
    }, { status: 201 });
  } catch (error: any) {
    console.error(`Error sending message to chat ${params.chatId}:`, error);
    return NextResponse.json(
      { error: `Failed to send message: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * Удаление всех сообщений из чата (очистка истории)
 */
export async function DELETE(
  request: Request, 
  { params }: { params: { chatId: string } }
) {
  try {
    // Проверка аутентификации
    const token = await getToken({ req: request as any, secret: "development-secret-key-do-not-use-in-production" });
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub;
    const { chatId } = params;
    
    // Получаем параметр для сохранения системных сообщений
    const url = new URL(request.url);
    const keepSystemMessages = url.searchParams.get('keepSystemMessages') === 'true';
    
    // Удаляем сообщения с проверкой владельца
    const deletedCount = await ChatService.clearChatHistory(chatId, userId, keepSystemMessages);
    
    if (deletedCount === null) {
      return NextResponse.json({ error: 'Chat not found or not owned by user' }, { status: 404 });
    }
    
    return NextResponse.json({ deletedCount });
  } catch (error: any) {
    console.error(`Error clearing messages for chat ${params.chatId}:`, error);
    return NextResponse.json(
      { error: `Failed to clear chat history: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

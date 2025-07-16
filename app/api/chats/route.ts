import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ChatService } from '@/services/chatService';

/**
 * Получение списка чатов пользователя
 */
export async function GET(request: Request) {
  try {
    // Проверка аутентификации
    const token = await getToken({ req: request as any, secret: "development-secret-key-do-not-use-in-production" });
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub;
    
    // Получаем чаты пользователя
    const chats = await ChatService.getUserChats(userId);
    
    return NextResponse.json({ chats });
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: `Failed to fetch chats: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * Создание нового чата
 */
export async function POST(request: Request) {
  try {
    // Проверка аутентификации
    const token = await getToken({ req: request as any, secret: "development-secret-key-do-not-use-in-production" });
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub;
    
    // Получаем данные из запроса
    const data = await request.json();
    const { title, model, systemPrompt, temperature } = data;
    
    // Валидация
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Создаем чат
    const chat = await ChatService.createChat(
      userId,
      title,
      model,
      systemPrompt,
      temperature
    );
    
    return NextResponse.json({ chat }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: `Failed to create chat: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

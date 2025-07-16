import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ChatService } from '@/services/chatService';

/**
 * Получение конкретного чата по ID
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
    
    // Включаем сообщения в ответ
    const includeMessages = new URL(request.url).searchParams.get('includeMessages') === 'true';
    
    // Получаем чат с проверкой владельца
    const chat = await ChatService.getChatById(chatId, userId, includeMessages);
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    return NextResponse.json({ chat });
  } catch (error: any) {
    console.error(`Error fetching chat ${params.chatId}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch chat: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * Обновление существующего чата
 */
export async function PUT(
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
    const { title, model, systemPrompt, temperature } = data;
    
    // Обновляем чат с проверкой владельца
    const updatedChat = await ChatService.updateChat(
      chatId,
      userId,
      { title, model, systemPrompt, temperature }
    );
    
    if (!updatedChat) {
      return NextResponse.json({ error: 'Chat not found or not owned by user' }, { status: 404 });
    }
    
    return NextResponse.json({ chat: updatedChat });
  } catch (error: any) {
    console.error(`Error updating chat ${params.chatId}:`, error);
    return NextResponse.json(
      { error: `Failed to update chat: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * Удаление чата
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
    
    // Удаляем чат с проверкой владельца
    const result = await ChatService.deleteChat(chatId, userId);
    
    if (!result) {
      return NextResponse.json({ error: 'Chat not found or not owned by user' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting chat ${params.chatId}:`, error);
    return NextResponse.json(
      { error: `Failed to delete chat: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

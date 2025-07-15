import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { DialogueService } from '@/services/dialogueService';

/**
 * Добавление сообщения в диалог
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Получение токена пользователя
    const token = await getToken({ req: request as any });
    
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Проверяем существование диалога
    const dialogue = DialogueService.getDialogue(params.id);
    
    if (!dialogue) {
      return NextResponse.json(
        { error: 'Dialogue not found' },
        { status: 404 }
      );
    }
    
    // Проверяем, что диалог принадлежит пользователю
    if (dialogue.userId !== token.sub) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Получение данных из запроса
    const { content, role } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }
    
    if (role !== 'user' && role !== 'assistant') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "user" or "assistant"' },
        { status: 400 }
      );
    }
    
    // Добавление сообщения
    const message = DialogueService.addMessage({
      dialogueId: params.id,
      content,
      role,
    });
    
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

/**
 * Очистка всех сообщений в диалоге
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Получение токена пользователя
    const token = await getToken({ req: request as any });
    
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Проверяем существование диалога
    const dialogue = DialogueService.getDialogue(params.id);
    
    if (!dialogue) {
      return NextResponse.json(
        { error: 'Dialogue not found' },
        { status: 404 }
      );
    }
    
    // Проверяем, что диалог принадлежит пользователю
    if (dialogue.userId !== token.sub) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Очистка сообщений
    const success = DialogueService.clearDialogueMessages(params.id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to clear messages' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error clearing messages:', error);
    return NextResponse.json(
      { error: 'Failed to clear messages' },
      { status: 500 }
    );
  }
}

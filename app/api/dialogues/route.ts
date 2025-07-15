import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { DialogueService } from '@/services/dialogueService';

/**
 * Получение всех диалогов пользователя
 */
export async function GET(request: Request) {
  try {
    // Получение токена пользователя
    const token = await getToken({ req: request as any });
    
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Получение диалогов пользователя
    const dialogues = DialogueService.getUserDialogues(token.sub);
    
    return NextResponse.json({ dialogues });
  } catch (error) {
    console.error('Error fetching dialogues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dialogues' },
      { status: 500 }
    );
  }
}

/**
 * Создание нового диалога
 */
export async function POST(request: Request) {
  try {
    // Получение токена пользователя
    const token = await getToken({ req: request as any });
    
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Получение данных из запроса
    const { title, initialMessage, metadata } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Создание диалога
    const dialogue = DialogueService.createDialogue({
      title,
      initialMessage,
      userId: token.sub,
      metadata,
    });
    
    return NextResponse.json({ dialogue }, { status: 201 });
  } catch (error) {
    console.error('Error creating dialogue:', error);
    return NextResponse.json(
      { error: 'Failed to create dialogue' },
      { status: 500 }
    );
  }
}

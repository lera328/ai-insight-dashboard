import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { DialogueService } from '@/services/dialogueService';

/**
 * Получение диалога по ID
 */
export async function GET(
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
    
    // Получение диалога
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
    
    return NextResponse.json({ dialogue });
  } catch (error) {
    console.error('Error fetching dialogue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dialogue' },
      { status: 500 }
    );
  }
}

/**
 * Обновление диалога
 */
export async function PUT(
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
    const existingDialogue = DialogueService.getDialogue(params.id);
    
    if (!existingDialogue) {
      return NextResponse.json(
        { error: 'Dialogue not found' },
        { status: 404 }
      );
    }
    
    // Проверяем, что диалог принадлежит пользователю
    if (existingDialogue.userId !== token.sub) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Получение данных из запроса
    const { title, metadata } = await request.json();
    
    // Обновление диалога
    const dialogue = DialogueService.updateDialogue({
      id: params.id,
      title,
      metadata,
    });
    
    return NextResponse.json({ dialogue });
  } catch (error) {
    console.error('Error updating dialogue:', error);
    return NextResponse.json(
      { error: 'Failed to update dialogue' },
      { status: 500 }
    );
  }
}

/**
 * Удаление диалога
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
    const existingDialogue = DialogueService.getDialogue(params.id);
    
    if (!existingDialogue) {
      return NextResponse.json(
        { error: 'Dialogue not found' },
        { status: 404 }
      );
    }
    
    // Проверяем, что диалог принадлежит пользователю
    if (existingDialogue.userId !== token.sub) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Удаление диалога
    const success = DialogueService.deleteDialogue(params.id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete dialogue' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting dialogue:', error);
    return NextResponse.json(
      { error: 'Failed to delete dialogue' },
      { status: 500 }
    );
  }
}

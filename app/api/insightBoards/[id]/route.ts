import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { InsightBoardService } from '@/services/insightBoardService';

/**
 * Получение доски инсайтов по ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Получение токена пользователя с секретным ключом
    const token = await getToken({
      req: request as any,
      secret: "development-secret-key-do-not-use-in-production"
    });
    
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Получение доски инсайтов (асинхронно)
    const board = await InsightBoardService.getInsightBoard(params.id);
    
    if (!board) {
      return NextResponse.json(
        { error: 'Insight board not found' },
        { status: 404 }
      );
    }
    
    // Проверяем, что доска принадлежит пользователю
    // Используем специальный метод для проверки принадлежности
    const isOwned = await InsightBoardService.isInsightBoardOwnedByUser(params.id, token.sub);
    if (!isOwned) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ board });
  } catch (error) {
    console.error('Error fetching insight board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insight board' },
      { status: 500 }
    );
  }
}

/**
 * Обновление доски инсайтов
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Получение токена пользователя с секретным ключом
    const token = await getToken({
      req: request as any,
      secret: "development-secret-key-do-not-use-in-production"
    });
    
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Проверяем существование доски (асинхронно)
    const existingBoard = await InsightBoardService.getInsightBoard(params.id);
    
    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Insight board not found' },
        { status: 404 }
      );
    }
    
    // Проверяем, что доска принадлежит пользователю
    const isOwned = await InsightBoardService.isInsightBoardOwnedByUser(params.id, token.sub);
    if (!isOwned) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Получение данных из запроса
    const { title, metadata } = await request.json();
    
    // Обновление доски (асинхронно)
    const board = await InsightBoardService.updateInsightBoard({
      id: params.id,
      title,
      metadata,
    });
    
    return NextResponse.json({ board });
  } catch (error) {
    console.error('Error updating insight board:', error);
    return NextResponse.json(
      { error: 'Failed to update insight board' },
      { status: 500 }
    );
  }
}

/**
 * Удаление доски инсайтов
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Получение токена пользователя с секретным ключом
    const token = await getToken({
      req: request as any,
      secret: "development-secret-key-do-not-use-in-production"
    });
    
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Проверяем, существует ли доска (асинхронно)
    const existingBoard = await InsightBoardService.getInsightBoard(params.id);
    
    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Insight board not found' },
        { status: 404 }
      );
    }
    
    // Проверяем, что доска принадлежит пользователю
    const isOwned = await InsightBoardService.isInsightBoardOwnedByUser(params.id, token.sub);
    if (!isOwned) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Удаление доски (асинхронно)
    const success = await InsightBoardService.deleteInsightBoard(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting insight board:', error);
    return NextResponse.json(
      { error: 'Failed to delete insight board' },
      { status: 500 }
    );
  }
}

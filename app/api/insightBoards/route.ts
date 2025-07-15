import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { InsightBoardService } from '@/services/insightBoardService';

/**
 * Получение всех досок инсайтов пользователя
 */
export async function GET(request: Request) {
  try {
    // Получение токена пользователя с указанием секретного ключа
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
    
    // Получение кратких сведений о досках пользователя с использованием асинхронного метода
    const boardSummaries = await InsightBoardService.getUserInsightBoardSummaries(token.sub);
    
    return NextResponse.json({ boardSummaries });
  } catch (error) {
    console.error('Error fetching insight boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insight boards' },
      { status: 500 }
    );
  }
}

/**
 * Создание новой доски инсайтов
 */
export async function POST(request: Request) {
  try {
    // Получение токена пользователя с указанием секретного ключа
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
    
    // Получение данных из запроса
    const { 
      title, 
      insights, 
      sourceText, 
      fileName, 
      model,
      temperature,
      metadata 
    } = await request.json();
    
    if (!title || !insights || !sourceText) {
      return NextResponse.json(
        { error: 'Title, insights, and sourceText are required' },
        { status: 400 }
      );
    }
    
    // Проверяем, существует ли пользователь в базе данных
    try {
      // Импортируем Prisma клиент
      const { prisma } = await import('@/lib/prisma');
      
      // Проверяем, есть ли пользователь с указанным ID
      const user = await prisma.user.findUnique({
        where: { id: token.sub }
      });

      if (!user) {
        console.log(`Создание пользователя с ID: ${token.sub}`);
        // Создаем пользователя, если он не существует
        await prisma.user.create({
          data: {
            id: token.sub,
            name: token.name || 'Пользователь',
            email: token.email || `user-${token.sub}@example.com`,
            role: 'user'
          }
        });
      }
      
      // Создание доски инсайтов с использованием асинхронного метода
      const board = await InsightBoardService.createInsightBoard({
        title,
        insights,
        sourceText,
        fileName,
        userId: token.sub,
        model,
        temperature,
        metadata
      });
      
      return NextResponse.json({ board }, { status: 201 });
    } catch (error: any) {
      console.error('Error creating insight board:', error);
      return NextResponse.json(
        { error: `Failed to create insight board: ${error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating insight board:', error);
    return NextResponse.json(
      { error: `Failed to create insight board: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

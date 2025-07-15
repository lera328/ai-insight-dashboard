import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { InsightBoardService } from '@/services/insightBoardService';

/**
 * РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… РґРѕСЃРѕРє РёРЅСЃР°Р№С‚РѕРІ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
 */
export async function GET(request: Request) {
  try {
    // РџРѕР»СѓС‡РµРЅРёРµ С‚РѕРєРµРЅР° РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ СЃ СѓРєР°Р·Р°РЅРёРµРј СЃРµРєСЂРµС‚РЅРѕРіРѕ РєР»СЋС‡Р°
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
    
    // РџРѕР»СѓС‡РµРЅРёРµ РєСЂР°С‚РєРёС… СЃРІРµРґРµРЅРёР№ Рѕ РґРѕСЃРєР°С… РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
    const boardSummaries = InsightBoardService.getUserInsightBoardSummaries(token.sub);
    
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
 * РЎРѕР·РґР°РЅРёРµ РЅРѕРІРѕР№ РґРѕСЃРєРё РёРЅСЃР°Р№С‚РѕРІ
 */
export async function POST(request: Request) {
  try {
    // РџРѕР»СѓС‡РµРЅРёРµ С‚РѕРєРµРЅР° РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ СЃ СѓРєР°Р·Р°РЅРёРµРј СЃРµРєСЂРµС‚РЅРѕРіРѕ РєР»СЋС‡Р°
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
    
    // РџРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… РёР· Р·Р°РїСЂРѕСЃР°
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
    
    // РЎРѕР·РґР°РЅРёРµ РґРѕСЃРєРё РёРЅСЃР°Р№С‚РѕРІ
    const board = InsightBoardService.createInsightBoard({
      title,
      insights,
      sourceText,
      fileName,
      userId: token.sub,
      model,
      temperature,
      metadata,
    });
    
    return NextResponse.json({ board }, { status: 201 });
  } catch (error) {
    console.error('Error creating insight board:', error);
    return NextResponse.json(
      { error: 'Failed to create insight board' },
      { status: 500 }
    );
  }
}

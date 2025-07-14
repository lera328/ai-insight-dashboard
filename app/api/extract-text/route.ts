/**
 * API маршрут для извлечения текста из файлов различных форматов
 * Поддерживается обработка текстовых файлов, PDF, DOC/DOCX и ODT
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import os from 'os';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { parseXml } from 'odt2html';

// Явно указываем, что маршрут должен работать в среде Node.js
export const runtime = 'nodejs';

/**
 * Обрабатывает POST запрос с файлом для извлечения текста
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем файл из формы
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден в запросе' },
        { status: 400 }
      );
    }

    // Читаем файл в буфер
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Определяем формат по расширению
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop() || '';

    // Извлекаем текст в зависимости от формата
    let text = '';
    let format = extension;
    let stats: Record<string, any> = {};

    // Текстовые форматы
    if (['txt', 'md', 'json', 'csv', 'html', 'xml', 'js', 'jsx', 'ts', 'tsx', 'css', 'scss'].includes(extension)) {
      text = buffer.toString('utf-8');
      format = 'text';
    } 
    // PDF формат
    else if (extension === 'pdf') {
      try {
        console.log('Обработка PDF файла...');
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
        format = 'pdf';
        stats = {
          pageCount: pdfData.numpages,
          info: pdfData.info
        };
      } catch (pdfError) {
        console.error('Ошибка при извлечении текста из PDF:', pdfError);
        throw new Error(`Не удалось извлечь текст из PDF файла: ${pdfError instanceof Error ? pdfError.message : 'Неизвестная ошибка'}`);
      }
    } 
    // Word форматы (DOC/DOCX)
    else if (['doc', 'docx'].includes(extension)) {
      try {
        console.log('Обработка Word файла...');
        // Сохраняем файл во временную директорию
        const tempFilePath = path.join(os.tmpdir(), `${randomUUID()}.${extension}`);
        await writeFile(tempFilePath, buffer);
        
        const result = await mammoth.extractRawText({ path: tempFilePath });
        text = result.value;
        format = 'doc';
        stats = {
          messages: result.messages
        };
      } catch (docError) {
        console.error('Ошибка при извлечении текста из DOC/DOCX:', docError);
        throw new Error(`Не удалось извлечь текст из DOC/DOCX файла: ${docError instanceof Error ? docError.message : 'Неизвестная ошибка'}`);
      }
    } 
    // ODT формат
    else if (extension === 'odt') {
      try {
        console.log('Обработка ODT файла...');
        const xmlContent = await parseXml(buffer);
        // Удаляем XML-теги и получаем чистый текст
        text = xmlContent
          .replace(/<[^>]+>/g, ' ')  // Заменяем XML-теги на пробелы
          .replace(/\s+/g, ' ')      // Объединяем множественные пробелы в один
          .trim();                   // Удаляем начальные и конечные пробелы
        format = 'odt';
      } catch (odtError) {
        console.error('Ошибка при извлечении текста из ODT:', odtError);
        throw new Error(`Не удалось извлечь текст из ODT файла: ${odtError instanceof Error ? odtError.message : 'Неизвестная ошибка'}`);
      }
    } 
    // RTF формат
    else if (extension === 'rtf') {
      // Пока не реализована поддержка RTF
      return NextResponse.json(
        { error: 'Формат RTF пока не поддерживается' },
        { status: 400 }
      );
    } 
    // Неизвестный формат
    else {
      return NextResponse.json(
        { error: `Неподдерживаемый формат файла: ${extension}` },
        { status: 400 }
      );
    }

    // Возвращаем результат
    return NextResponse.json({
      text,
      format,
      fileName: file.name,
      size: formatFileSize(file.size),
      chars: text.length,
      stats
    });
  } 
  catch (error) {
    console.error('Ошибка при обработке файла:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Неизвестная ошибка при обработке файла' },
      { status: 500 }
    );
  }
}

/**
 * Форматирует размер файла в человекочитаемый вид
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

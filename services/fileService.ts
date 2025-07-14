/**
 * @fileoverview Сервис для работы с файлами различных форматов
 * Обеспечивает извлечение текста из различных типов файлов (txt, pdf, doc, odt)
 */

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { parseXml } from 'odt2html';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Интерфейс для результата извлечения текста из файла
 */
export interface FileTextExtractionResult {
  /** Извлеченный текст */
  text: string;
  /** Формат файла */
  format: string;
  /** Статистика по файлу (например, количество страниц для PDF) */
  stats?: Record<string, any>;
}

/**
 * Извлекает текст из файла в зависимости от его формата
 * 
 * @param file - Объект файла
 * @returns Promise с результатом извлечения текста
 * @throws Error если формат файла не поддерживается или при ошибке обработки
 */
export async function extractTextFromFile(file: File): Promise<FileTextExtractionResult> {
  try {
    // Получаем содержимое файла как ArrayBuffer
    const buffer = await file.arrayBuffer();
    
    // Определяем тип файла по его содержимому
    const fileType = await fileTypeFromBuffer(Buffer.from(buffer)) || {
      mime: getMimeTypeFromExtension(file.name)
    };
    
    // Извлекаем текст в зависимости от типа файла
    if (fileType.mime === 'text/plain') {
      const text = await extractFromTextFile(buffer);
      return { text, format: 'text' };
    } 
    else if (fileType.mime === 'application/pdf') {
      return await extractFromPdfFile(buffer);
    } 
    else if (fileType.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractFromDocxFile(buffer);
    } 
    else if (fileType.mime === 'application/vnd.oasis.opendocument.text') {
      return await extractFromOdtFile(buffer);
    }
    // Если не смогли определить тип, пробуем как текстовый файл
    else {
      try {
        const text = await extractFromTextFile(buffer);
        return { text, format: 'text' };
      } catch (error) {
        throw new Error(`Неподдерживаемый формат файла: ${fileType.mime}`);
      }
    }
  } catch (error) {
    console.error('Ошибка при извлечении текста из файла:', error);
    throw new Error(`Ошибка при извлечении текста: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
}

/**
 * Определяет MIME-тип по расширению файла
 * 
 * @param fileName - Имя файла
 * @returns MIME-тип файла
 */
function getMimeTypeFromExtension(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const mimeTypes: Record<string, string> = {
    'txt': 'text/plain',
    'md': 'text/markdown',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'odt': 'application/vnd.oasis.opendocument.text',
    'rtf': 'application/rtf',
    'json': 'application/json',
    'xml': 'application/xml',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'ts': 'text/typescript',
    'csv': 'text/csv'
  };
  
  return mimeTypes[extension] || 'text/plain';
}

/**
 * Извлекает текст из текстового файла
 * 
 * @param buffer - Содержимое файла
 * @returns Извлеченный текст
 */
async function extractFromTextFile(buffer: ArrayBuffer): Promise<string> {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
}

/**
 * Извлекает текст из PDF файла
 * 
 * @param buffer - Содержимое файла
 * @returns Результат извлечения текста
 */
async function extractFromPdfFile(buffer: ArrayBuffer): Promise<FileTextExtractionResult> {
  const data = await pdfParse(Buffer.from(buffer));
  return {
    text: data.text,
    format: 'pdf',
    stats: {
      pageCount: data.numpages,
      info: data.info
    }
  };
}

/**
 * Извлекает текст из DOCX файла
 * 
 * @param buffer - Содержимое файла
 * @returns Результат извлечения текста
 */
async function extractFromDocxFile(buffer: ArrayBuffer): Promise<FileTextExtractionResult> {
  const result = await mammoth.extractRawText({
    arrayBuffer: buffer
  });
  
  return {
    text: result.value,
    format: 'docx',
    stats: {
      messages: result.messages
    }
  };
}

/**
 * Извлекает текст из ODT файла
 * 
 * @param buffer - Содержимое файла
 * @returns Результат извлечения текста
 */
async function extractFromOdtFile(buffer: ArrayBuffer): Promise<FileTextExtractionResult> {
  // Извлекаем XML из ODT файла (формат ODT - это по сути ZIP с XML внутри)
  const xmlContent = await parseOdtToXml(buffer);
  
  // Извлекаем текст из XML
  return {
    text: extractTextFromOdtXml(xmlContent),
    format: 'odt'
  };
}

/**
 * Извлекает XML из ODT файла
 * 
 * @param buffer - Содержимое файла
 * @returns XML-содержимое файла
 */
async function parseOdtToXml(buffer: ArrayBuffer): Promise<string> {
  try {
    // Используем odt2html для извлечения содержимого
    const odtContent = await parseXml(Buffer.from(buffer));
    return odtContent;
  } catch (error) {
    console.error('Ошибка при извлечении XML из ODT:', error);
    throw new Error('Не удалось извлечь содержимое из ODT файла');
  }
}

/**
 * Извлекает текст из XML-содержимого ODT файла
 * 
 * @param xmlContent - XML-содержимое файла
 * @returns Извлеченный текст
 */
function extractTextFromOdtXml(xmlContent: string): string {
  // Удаляем XML-теги и оставляем только текст
  // Это упрощенный подход, в реальных проектах стоит использовать XML-парсер
  return xmlContent
    .replace(/<[^>]+>/g, ' ')  // Заменяем XML-теги на пробелы
    .replace(/\s+/g, ' ')      // Объединяем множественные пробелы в один
    .trim();                   // Удаляем начальные и конечные пробелы
}

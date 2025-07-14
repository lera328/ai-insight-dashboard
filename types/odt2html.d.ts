declare module 'odt2html' {
  /**
   * Парсит XML-содержимое из ODT файла
   * @param buffer - Buffer с содержимым ODT файла
   * @returns Promise с XML-содержимым
   */
  export function parseXml(buffer: Buffer): Promise<string>;
  
  /**
   * Конвертирует ODT содержимое в HTML
   * @param buffer - Buffer с содержимым ODT файла
   * @returns Promise с HTML-содержимым
   */
  export function toHtml(buffer: Buffer): Promise<string>;
}

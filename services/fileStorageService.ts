/**
 * Сервис для хранения данных в файлах
 * Временное решение для хранения данных между перезапусками сервера
 */

import fs from 'fs';
import path from 'path';

export class FileStorageService {
  private static dataDir = path.join(process.cwd(), 'data');

  /**
   * Инициализация хранилища
   */
  static init() {
    // Создаем папку для данных, если она не существует
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Сохранение данных в файл
   */
  static saveData<T>(filename: string, data: T): void {
    this.init();
    const filePath = path.join(this.dataDir, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  /**
   * Чтение данных из файла
   */
  static readData<T>(filename: string, defaultValue: T): T {
    this.init();
    const filePath = path.join(this.dataDir, `${filename}.json`);
    
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data) as T;
      }
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
    }
    
    return defaultValue;
  }
}

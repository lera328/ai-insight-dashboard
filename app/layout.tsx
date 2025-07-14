import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Определяем шрифт Inter для использования во всем приложении
const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Метаданные приложения для SEO и отображения в браузере
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  title: 'AI-Insight Dashboard',
  description: 'Интеллектуальная панель аналитики с использованием ИИ для анализа текста и данных',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#ffffff',
  icons: {
    icon: '/favicon.ico',
  },
};

/**
 * Корневой макет приложения
 * Содержит базовую HTML-структуру, включая тег <html>, <head> с мета-тегами и <body>
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты для рендеринга внутри макета
 * @returns {JSX.Element} Корневой макет приложения
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          {children}
        </main>
      </body>
    </html>
  );
}

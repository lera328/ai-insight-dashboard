"use client";

import React from 'react';
import RouteGuard from '@/components/RouteGuard';
import ChatInterface from '@/components/ChatInterface';

/**
 * Страница чата с ИИ
 */
export default function ChatPage() {
  return (
    <RouteGuard>
      <div className="container mx-auto py-6 px-4 h-[calc(100vh-80px)]">
        <h1 className="text-2xl font-bold mb-4">Чат с ИИ</h1>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg h-[calc(100%-60px)]">
          <ChatInterface />
        </div>
      </div>
    </RouteGuard>
  );
}

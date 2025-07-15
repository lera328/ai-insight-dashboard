"use client";

import React from 'react';
import RouteGuard from '@/components/RouteGuard';
import DialogueManager from '@/components/DialogueManager';

/**
 * Страница диалогов с AI
 */
export default function DialoguesPage() {
  return (
    <RouteGuard>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">История диалогов с AI</h1>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <DialogueManager />
        </div>
      </div>
    </RouteGuard>
  );
}

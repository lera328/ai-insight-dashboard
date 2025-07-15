/**
 * Компонент для управления диалогами
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ClientDialogueService } from '@/services/clientDialogueService';
import { Dialogue, DialogueMessage } from '@/types/dialogue';
import Link from 'next/link';

/**
 * Компонент отдельного диалога в списке
 */
const DialogueItem = ({ dialogue, onSelect, isActive }: { 
  dialogue: Dialogue; 
  onSelect: (id: string) => void;
  isActive: boolean;
}) => (
  <div 
    className={`cursor-pointer p-3 border-b hover:bg-gray-100 ${isActive ? 'bg-blue-50' : ''}`}
    onClick={() => onSelect(dialogue.id)}
  >
    <h3 className="font-medium text-md">{dialogue.title}</h3>
    <div className="text-sm text-gray-500">
      {new Date(dialogue.updatedAt).toLocaleString()}
    </div>
    <div className="text-sm truncate text-gray-600">
      {dialogue.messages.length > 0 
        ? `${dialogue.messages[dialogue.messages.length - 1].content.slice(0, 50)}...` 
        : 'Нет сообщений'}
    </div>
  </div>
);

/**
 * Компонент сообщения в диалоге
 */
const MessageItem = ({ message }: { message: DialogueMessage }) => (
  <div className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
    <div className={`inline-block max-w-[70%] p-3 rounded-lg ${
      message.role === 'user' 
        ? 'bg-blue-500 text-white rounded-br-none' 
        : 'bg-gray-200 text-gray-800 rounded-bl-none'
    }`}>
      {message.content}
    </div>
    <div className="text-xs text-gray-500 mt-1">
      {new Date(message.timestamp).toLocaleString()}
    </div>
  </div>
);

/**
 * Основной компонент управления диалогами
 */
export default function DialogueManager() {
  const { data: session, status } = useSession();
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [selectedDialogue, setSelectedDialogue] = useState<Dialogue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newDialogueTitle, setNewDialogueTitle] = useState('');
  const [showNewDialogueForm, setShowNewDialogueForm] = useState(false);
  
  // Загрузка диалогов
  const loadDialogues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userDialogues = await ClientDialogueService.getUserDialogues();
      setDialogues(userDialogues);
      
      // Если есть диалоги, выбираем первый по умолчанию
      if (userDialogues.length > 0 && !selectedDialogue) {
        setSelectedDialogue(userDialogues[0]);
      }
    } catch (err) {
      setError('Не удалось загрузить диалоги');
      console.error('Error loading dialogues:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка диалогов при монтировании и изменении статуса сессии
  useEffect(() => {
    if (status === 'authenticated') {
      loadDialogues();
    }
  }, [status]);
  
  // Обработчик отправки сообщения
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedDialogue) return;
    
    try {
      // Добавляем сообщение пользователя
      await ClientDialogueService.addMessage({
        dialogueId: selectedDialogue.id,
        content: newMessage,
        role: 'user'
      });
      
      setNewMessage('');
      
      // Обновляем выбранный диалог
      const updatedDialogue = await ClientDialogueService.getDialogue(selectedDialogue.id);
      setSelectedDialogue(updatedDialogue);
      
      // Обновляем список диалогов
      loadDialogues();
      
      // TODO: Здесь будет логика отправки сообщения в AI и получения ответа
      // Имитация ответа от AI через 1 секунду
      setTimeout(async () => {
        await ClientDialogueService.addMessage({
          dialogueId: selectedDialogue.id,
          content: 'Это автоматический ответ. В реальном приложении здесь будет ответ от AI.',
          role: 'assistant'
        });
        
        // Обновляем выбранный диалог
        const updatedDialogue = await ClientDialogueService.getDialogue(selectedDialogue.id);
        setSelectedDialogue(updatedDialogue);
        
        // Обновляем список диалогов
        loadDialogues();
      }, 1000);
      
    } catch (err) {
      setError('Не удалось отправить сообщение');
      console.error('Error sending message:', err);
    }
  };
  
  // Обработчик создания нового диалога
  const handleCreateDialogue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDialogueTitle.trim()) return;
    
    try {
      await ClientDialogueService.createDialogue({
        title: newDialogueTitle,
        metadata: {
          source: 'manual',
          createdBy: 'user'
        }
      });
      
      setNewDialogueTitle('');
      setShowNewDialogueForm(false);
      
      // Обновляем список диалогов
      await loadDialogues();
    } catch (err) {
      setError('Не удалось создать диалог');
      console.error('Error creating dialogue:', err);
    }
  };
  
  // Обработчик удаления диалога
  const handleDeleteDialogue = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот диалог?')) return;
    
    try {
      await ClientDialogueService.deleteDialogue(id);
      
      // Если удалили выбранный диалог, сбрасываем выбор
      if (selectedDialogue?.id === id) {
        setSelectedDialogue(null);
      }
      
      // Обновляем список диалогов
      await loadDialogues();
    } catch (err) {
      setError('Не удалось удалить диалог');
      console.error('Error deleting dialogue:', err);
    }
  };
  
  // Обработчик очистки истории сообщений
  const handleClearMessages = async () => {
    if (!selectedDialogue || !window.confirm('Вы уверены, что хотите очистить историю сообщений?')) return;
    
    try {
      await ClientDialogueService.clearMessages(selectedDialogue.id);
      
      // Обновляем выбранный диалог
      const updatedDialogue = await ClientDialogueService.getDialogue(selectedDialogue.id);
      setSelectedDialogue(updatedDialogue);
      
      // Обновляем список диалогов
      await loadDialogues();
    } catch (err) {
      setError('Не удалось очистить историю сообщений');
      console.error('Error clearing messages:', err);
    }
  };
  
  // Если пользователь не авторизован
  if (status === 'unauthenticated') {
    return (
      <div className="text-center p-6">
        <p className="mb-4">Для управления диалогами необходимо войти в систему</p>
        <Link 
          href="/auth/signin" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Войти
        </Link>
      </div>
    );
  }
  
  // Если статус загрузки
  if (status === 'loading' || loading) {
    return <div className="text-center p-6">Загрузка...</div>;
  }
  
  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Боковая панель с диалогами */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold mb-2">Диалоги</h2>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
            onClick={() => setShowNewDialogueForm(!showNewDialogueForm)}
          >
            {showNewDialogueForm ? 'Отмена' : 'Новый диалог'}
          </button>
          
          {showNewDialogueForm && (
            <form onSubmit={handleCreateDialogue} className="mt-4">
              <input
                type="text"
                value={newDialogueTitle}
                onChange={(e) => setNewDialogueTitle(e.target.value)}
                placeholder="Название диалога"
                className="w-full p-2 border rounded mb-2"
                required
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                Создать
              </button>
            </form>
          )}
        </div>
        
        <div>
          {dialogues.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Нет доступных диалогов
            </div>
          ) : (
            dialogues.map(dialogue => (
              <DialogueItem
                key={dialogue.id}
                dialogue={dialogue}
                onSelect={(id) => {
                  const dialogue = dialogues.find(d => d.id === id);
                  if (dialogue) {
                    setSelectedDialogue(dialogue);
                  }
                }}
                isActive={selectedDialogue?.id === dialogue.id}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Область сообщений */}
      <div className="w-2/3 flex flex-col">
        {selectedDialogue ? (
          <>
            {/* Шапка диалога */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">{selectedDialogue.title}</h2>
              <div>
                <button
                  onClick={handleClearMessages}
                  className="mr-2 text-red-500 hover:text-red-700"
                  title="Очистить историю"
                >
                  Очистить
                </button>
                <button
                  onClick={() => handleDeleteDialogue(selectedDialogue.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Удалить диалог"
                >
                  Удалить
                </button>
              </div>
            </div>
            
            {/* Сообщения */}
            <div className="flex-1 p-4 overflow-y-auto">
              {selectedDialogue.messages.length === 0 ? (
                <div className="text-center text-gray-500 my-8">
                  Нет сообщений. Начните диалог!
                </div>
              ) : (
                selectedDialogue.messages.map(message => (
                  <MessageItem key={message.id} message={message} />
                ))
              )}
            </div>
            
            {/* Форма отправки сообщения */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1 p-2 border rounded-l"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r"
                >
                  Отправить
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {dialogues.length === 0
              ? 'Создайте новый диалог, чтобы начать общение'
              : 'Выберите диалог из списка слева'}
          </div>
        )}
      </div>
      
      {/* Сообщение об ошибке */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Ошибка</p>
              <p>{error}</p>
            </div>
            <button 
              className="ml-auto pl-3" 
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Paperclip, RefreshCcw, Folder, Plus, Edit, Settings, Save, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ClientChatService, ChatSummary, ChatWithMessages } from '@/services/clientChatService';

// Типы сообщений
type MessageRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Компонент отдельного сообщения в чате
 */
const MessageItem = ({ message }: { message: ChatMessage }) => (
  <div className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
    <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
      message.role === 'user' 
        ? 'bg-blue-500 text-white rounded-br-none' 
        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-none'
    }`}>
      {message.role === 'assistant' ? (
        <div className="prose dark:prose-invert prose-sm max-w-none">
          <ReactMarkdown>
            {message.content}
          </ReactMarkdown>
        </div>
      ) : (
        <div>{message.content}</div>
      )}
    </div>
    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
      {message.timestamp.toLocaleTimeString()}
    </div>
  </div>
);

/**
 * Основной компонент интерфейса чата
 */
export default function ChatInterface() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Привет! Я ваш ИИ-ассистент. Чем я могу вам помочь сегодня?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Состояние для работы с чатами
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatWithMessages | null>(null);
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [chatTitle, setChatTitle] = useState('Новый чат');
  const [isSavingChat, setIsSavingChat] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Автопрокрутка до последнего сообщения
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Загрузка списка чатов при инициализации
  useEffect(() => {
    if (session?.user) {
      loadUserChats();
    }
  }, [session]);
  
  // Загрузка чатов пользователя
  const loadUserChats = async () => {
    if (!session?.user) return;
    
    try {
      setIsChatsLoading(true);
      const userChats = await ClientChatService.getUserChats();
      setChats(userChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsChatsLoading(false);
    }
  };
  
  // Загрузка конкретного чата
  const loadChat = async (chatId: string) => {
    try {
      setIsLoading(true);
      const chat = await ClientChatService.getChat(chatId);
      setCurrentChat(chat);
      setChatTitle(chat.title);
      setSystemPrompt(chat.systemPrompt || '');
      
      // Преобразуем сообщения из базы данных в формат компонента
      const formattedMessages = chat.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as MessageRole,
        timestamp: msg.createdAt,
        metadata: msg.metadata || undefined
      }));
      
      setMessages(formattedMessages);
      setShowChatList(false);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Создание нового чата
  const createNewChat = async () => {
    try {
      setIsSavingChat(true);
      const newChat = await ClientChatService.createChat(
        chatTitle,
        undefined, // model - по умолчанию
        systemPrompt || undefined
      );
      setCurrentChat(newChat as ChatWithMessages);
      await loadUserChats(); // Обновляем список чатов
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsSavingChat(false);
    }
  };
  
  // Обновление информации о чате
  const updateCurrentChat = async () => {
    if (!currentChat) return;
    
    try {
      setIsSavingChat(true);
      await ClientChatService.updateChat(
        currentChat.id,
        {
          title: chatTitle,
          systemPrompt: systemPrompt || undefined
        }
      );
      await loadUserChats(); // Обновляем список чатов
    } catch (error) {
      console.error('Error updating chat:', error);
    } finally {
      setIsSavingChat(false);
      setIsEditingTitle(false);
    }
  };
  
  // Удаление чата
  const deleteCurrentChat = async () => {
    if (!currentChat) return;
    
    if (confirm('Вы уверены, что хотите удалить этот чат?')) {
      try {
        await ClientChatService.deleteChat(currentChat.id);
        setCurrentChat(null);
        setMessages([
          {
            id: Date.now().toString(),
            content: 'Привет! Я ваш ИИ-ассистент. Чем я могу вам помочь сегодня?',
            role: 'assistant',
            timestamp: new Date()
          }
        ]);
        setChatTitle('Новый чат');
        setSystemPrompt('');
        await loadUserChats(); // Обновляем список чатов
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };
  
  // Обработчик отправки сообщения
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Если чат еще не создан в базе данных, создаем его
    if (!currentChat) {
      try {
        setIsSavingChat(true);
        const newChat = await ClientChatService.createChat(
          chatTitle,
          undefined,
          systemPrompt || undefined
        );
        setCurrentChat(newChat as ChatWithMessages);
        await loadUserChats();
        setIsSavingChat(false);
      } catch (error) {
        console.error('Error creating chat before sending message:', error);
        setIsSavingChat(false);
        return; // Прекращаем отправку сообщения при ошибке
      }
    }
    
    // Добавляем временное сообщение пользователя для отображения в UI
    const tempUserMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, tempUserMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);
    
    try {
      // Отправляем сообщение в API чата
      const result = await ClientChatService.sendMessage(
        currentChat!.id,
        userInput,
        true // генерируем ответ AI
      );
      
      // Обновляем сообщения с сохраненными в базе данных
      setMessages(prev => prev.map(msg => 
        // Заменяем временное сообщение на сохраненное
        msg.id === tempUserMessage.id ? {
          id: result.message.id,
          content: result.message.content,
          role: result.message.role as MessageRole,
          timestamp: new Date(result.message.createdAt),
          metadata: result.message.metadata || undefined
        } : msg
      ));  
      
      // Добавляем ответ AI, если он есть
      if (result.aiMessage) {
        const aiMessage: ChatMessage = {
          id: result.aiMessage.id,
          content: result.aiMessage.content,
          role: result.aiMessage.role as MessageRole,
          timestamp: new Date(result.aiMessage.createdAt),
          metadata: result.aiMessage.metadata || undefined
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      
      // Добавляем сообщение об ошибке
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз.',
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обработчик очистки истории
  const handleClearChat = async () => {
    if (!currentChat) {
      // Если чат еще не сохранен, просто очищаем локально
      if (window.confirm('Вы уверены, что хотите очистить историю чата?')) {
        setMessages([
          {
            id: Date.now().toString(),
            content: 'История чата очищена. Чем я могу вам помочь?',
            role: 'assistant',
            timestamp: new Date()
          }
        ]);
      }
      return;
    }
    
    // Если чат сохранен, очищаем через API
    if (window.confirm('Вы уверены, что хотите очистить историю чата? Системные сообщения будут сохранены.')) {
      try {
        setIsLoading(true);
        const deletedCount = await ClientChatService.clearChatHistory(currentChat.id, true);
        
        // Загружаем обновленный чат
        await loadChat(currentChat.id);
        
        // Если нет сообщений (все удалились, включая системные), добавляем приветствие
        if (messages.length === 0) {
          setMessages([
            {
              id: Date.now().toString(),
              content: 'История чата очищена. Чем я могу вам помочь?',
              role: 'assistant',
              timestamp: new Date()
            }
          ]);
        }
      } catch (error) {
        console.error('Error clearing chat history:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Открыть/закрыть настройки чата
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  // Открыть/закрыть список чатов
  const toggleChatList = () => {
    setShowChatList(!showChatList);
  };
  
  // Создать новый чат
  const startNewChat = () => {
    setCurrentChat(null);
    setMessages([
      {
        id: Date.now().toString(),
        content: 'Привет! Я ваш ИИ-ассистент. Чем я могу вам помочь сегодня?',
        role: 'assistant',
        timestamp: new Date()
      }
    ]);
    setChatTitle('Новый чат');
    setSystemPrompt('');
    setShowChatList(false);
  };
  
  return (
    <div className="flex h-full">
      {/* Меню чатов */}
      <div 
        className={`${showChatList ? 'flex' : 'hidden'} md:flex flex-col w-64 border-r dark:border-slate-700 h-full bg-gray-50 dark:bg-slate-900`}
      >
        <div className="p-4 border-b dark:border-slate-700">
          <button 
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 p-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            <Plus size={16} /> Новый чат
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isChatsLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-slate-400">
              Загрузка...
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-slate-400">
              У вас пока нет чатов
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {chats.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`p-2 rounded cursor-pointer ${currentChat?.id === chat.id ? 'bg-blue-100 dark:bg-slate-700' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                  onClick={() => loadChat(chat.id)}
                >
                  <div className="font-medium truncate">{chat.title}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    {chat.lastMessageContent ? chat.lastMessageContent.substring(0, 30) + (chat.lastMessageContent.length > 30 ? '...' : '') : 'Нет сообщений'}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''} · {chat.messageCount || 0} сообщ.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Основная часть чата */}
      <div className="flex flex-col flex-1 h-full">
        {/* Шапка чата */}
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <div className="flex items-center">
            <button 
              onClick={toggleChatList}
              className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 md:hidden"
              title="Список чатов"
            >
              <Folder size={18} />
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
              AI
            </div>
            {isEditingTitle ? (
              <div className="flex items-center">
                <input 
                  type="text" 
                  value={chatTitle}
                  onChange={(e) => setChatTitle(e.target.value)}
                  className="border rounded px-2 py-1 text-sm w-40"
                  autoFocus
                />
                <button 
                  onClick={updateCurrentChat}
                  className="ml-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                  title="Сохранить"
                  disabled={isSavingChat}
                >
                  <Save size={16} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium">{currentChat ? chatTitle : 'Новый чат'}</h3>
                  {currentChat && (
                    <button 
                      onClick={() => setIsEditingTitle(true)}
                      className="ml-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400"
                      title="Изменить название"
                    >
                      <Edit size={12} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {currentChat ? 
                    `Модель: ${currentChat.model || 'По умолчанию'}` : 
                    'Готов помочь с любыми вопросами'}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <button 
              onClick={toggleSettings}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 mr-2"
              title="Настройки"
            >
              <Settings size={18} />
            </button>
            <button 
              onClick={handleClearChat}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 mr-2"
              title="Очистить историю"
            >
              <RefreshCcw size={18} />
            </button>
            {currentChat && (
              <button 
                onClick={deleteCurrentChat}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400"
                title="Удалить чат"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
        
        {/* Настройки чата */}
        {showSettings && (
          <div className="border-b dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-900">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Системный промпт</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Введите системный промпт для настройки поведения ассистента..."
                className="w-full rounded border p-2 bg-white dark:bg-slate-800 dark:border-slate-700"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="button" 
                className="px-3 py-1 bg-gray-200 dark:bg-slate-700 rounded mr-2 text-sm"
                onClick={toggleSettings}
              >
                Отмена
              </button>
              <button 
                type="button" 
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                onClick={currentChat ? updateCurrentChat : createNewChat}
                disabled={isSavingChat}
              >
                {isSavingChat ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        )}
        
        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-slate-400">Загрузка чата...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-gray-500 dark:text-slate-400">
                <p>Нет сообщений</p>
              </div>
            </div>
          ) : (
            messages.map(message => (
              <MessageItem key={message.id} message={message} />
            ))
          )}
          {isLoading && messages.length > 0 && (
            <div className="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-none mb-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Форма отправки сообщения */}
        <form onSubmit={handleSubmit} className="p-4 border-t dark:border-slate-700">
          <div className="flex items-center">
            <button 
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 mr-1"
              title="Прикрепить файл"
            >
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 p-3 rounded-full border bg-gray-50 dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="p-2 ml-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// src/components/chat/ChatWithMily.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ShoppingBag, Briefcase, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ChatWithMily() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'mily',
      text: '¡Hola! Soy Mily, tu asistente de compras 🛍️ ¿Qué estás buscando hoy?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-mily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.slice(-5),
        }),
      });

      if (!response.ok) throw new Error('Error en la respuesta');

      const data = await response.json();

      const milyMessage = {
        id: Date.now() + 1,
        type: 'mily',
        text: data.response,
        results: data.results || [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, milyMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'mily',
        text: 'Ay no... Tuve un problema técnico 😅 ¿Podrías intentar de nuevo?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'producto':
        return <ShoppingBag className="w-4 h-4" />;
      case 'servicio':
        return <Briefcase className="w-4 h-4" />;
      case 'empleo':
        return <Package className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getResultLink = (result) => {
    const slug = result.tiendaInfo?.slug || result.storeSlug || 'tienda';
    
    if (result.type === 'producto') {
      return `/tienda/${slug}/producto/${result.id}`;
    } else if (result.type === 'servicio') {
      return `/tienda/${slug}/servicios/${result.id}`;
    } else if (result.type === 'empleo') {
      return `/tienda/${slug}/empleos/${result.id}`;
    }
    return '#';
  };

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl px-4 py-3 cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-purple-200 dark:border-purple-700 w-full max-w-md group"
      >
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border-2 border-purple-200 dark:border-purple-600">
            <Sparkles className="w-3 h-3 text-purple-500" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-purple-700 dark:text-purple-300">Mily</span>
            <span className="text-xs bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
              ✨ IA
            </span>
          </div>
          <input
            type="text"
            placeholder="¿En qué puedo ayudarte? 😊"
            className="w-full outline-none bg-transparent text-sm text-gray-700 dark:text-gray-200 cursor-pointer placeholder:text-gray-600 dark:placeholder:text-gray-400"
            readOnly
          />
        </div>
        
        <div className="text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed lg:absolute inset-0 lg:inset-auto lg:top-full lg:mt-2 lg:right-0 lg:w-96 z-50 flex flex-col lg:rounded-2xl lg:shadow-2xl lg:border lg:border-gray-200 lg:dark:border-gray-700 lg:max-h-[600px]">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 lg:rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z"/>
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border-2 border-purple-200 dark:border-purple-600">
                    <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Mily</h3>
                    <span className="text-xs bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
                      ✨ IA
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tu asistente de compras</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Messages - Con padding bottom para el input flotante en móvil */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 pb-24 lg:pb-4"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.type === 'user' ? (
                      <div className="flex justify-end">
                        <div className="bg-purple-500 dark:bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z"/>
                              </svg>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] shadow-sm">
                            <p className="text-sm text-gray-800 dark:text-gray-100">{message.text}</p>
                          </div>
                        </div>

                        {message.results && message.results.length > 0 && (
                          <div className="ml-10 space-y-2">
                            {message.results.map((result) => (
                              <Link
                                key={result.id}
                                href={getResultLink(result)}
                                onClick={() => setIsOpen(false)}
                                className="block bg-white dark:bg-gray-700 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-600"
                              >
                                <div className="flex gap-3">
                                  {(result.imagenes?.[0] || result.imagenPrincipal || result.foto) && (
                                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600">
                                      <Image
                                        src={result.imagenes?.[0] || result.imagenPrincipal || result.foto}
                                        alt={result.nombre || result.titulo}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-purple-600 dark:text-purple-400">
                                        {getResultIcon(result.type)}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                        {result.type}
                                      </span>
                                    </div>
                                    <h4 className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">
                                      {result.nombre || result.titulo}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                      {result.descripcion}
                                    </p>
                                    {result.precio && (
                                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">
                                        ${result.precio.toLocaleString()}
                                      </p>
                                    )}
                                    {result.salario?.minimo && (
                                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">
                                        ${result.salario.minimo.toLocaleString()}
                                        {result.salario.maximo && ` - $${result.salario.maximo.toLocaleString()}`}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z"/>
                      </svg>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input - FIXED en móvil, STATIC en desktop */}
            <div className="fixed lg:relative bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 lg:rounded-b-2xl z-10">
              <div className="flex gap-2 max-w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
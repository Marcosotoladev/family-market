// src/components/chat/ChatWithMily.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ShoppingBag, Briefcase, Package, Mic, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import SearchResults from '../search/SearchResults';

export default function ChatWithMily() {
  // Estados para el Chat
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
  const [isListening, setIsListening] = useState(false);

  // Estados para la Búsqueda Convencional
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const searchContainerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Inicializar Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleInputChange({ target: { value: transcript } }); // Trigger search behavior
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Error de reconocimiento:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      // No enfocar automáticamente al abrir el modal si ya hay texto (usuario escribiendo)
      if (!inputValue) {
        setTimeout(() => {
          // inputRef.current?.focus(); // Quizás no sea necesario enfocar el input del chat si ya escribió en la barra
        }, 300);
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // --- Lógica del Chat (Mily) ---

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Si el modal no está abierto, abrirlo
    if (!isOpen) {
      setIsOpen(true);
      setShowResults(false); // Cerrar resultados de búsqueda si están abiertos
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue; // Guardar valor para la request
    setInputValue(''); // Limpiar input
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-mily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
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

  // --- Lógica de Búsqueda Convencional ---

  const handleStandardSearch = async (query) => {
    if (!query || query.trim().length < 3) {
      setResults(null);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: query }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (err) {
      console.error('Error searching:', err);
      setSearchError('Hubo un error al buscar. Intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Si el modal está abierto, no buscamos (es chat)
    if (isOpen) return;

    // Debounce para búsqueda
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (value.trim().length >= 3) {
        handleStandardSearch(value);
      } else {
        setShowResults(false);
      }
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Si el modal está abierto, enviar mensaje al chat
      if (isOpen) {
        handleSendMessage();
      } else {
        // Si no, ejecutar búsqueda estándar inmediata
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        handleStandardSearch(inputValue);
      }
    }
  };

  const toggleListening = (e) => {
    e.stopPropagation(); // Prevenir abrir modal si fuera el caso antiguo
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta reconocimiento de voz 😢');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'producto': return <ShoppingBag className="w-4 h-4" />;
      case 'servicio': return <Briefcase className="w-4 h-4" />;
      case 'empleo': return <Package className="w-4 h-4" />;
      default: return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getResultLink = (result) => {
    const slug = result.tiendaInfo?.slug || result.storeSlug || 'tienda';
    if (result.type === 'producto') return `/tienda/${slug}/producto/${result.id}`;
    if (result.type === 'servicio') return `/tienda/${slug}/servicios/${result.id}`;
    if (result.type === 'empleo') return `/tienda/${slug}/empleos/${result.id}`;
    return '#';
  };

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-md">
      {/* Barra de búsqueda Unificada */}
      <div
        className={`flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl px-3 py-2 border-2 border-purple-200 dark:border-purple-700 w-full transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 relative shadow-md hover:shadow-lg'}`}
      >
        {/* Lado Izquierdo: Icono Mily/Avatar */}
        <div className="relative flex-shrink-0 cursor-pointer group" onClick={() => setIsOpen(true)}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border border-purple-200 dark:border-purple-600">
            <Sparkles className="w-2.5 h-2.5 text-purple-500" />
          </div>
        </div>

        {/* Input */}
        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Buscar o preguntar a Mily..."
            className="w-full outline-none bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Micrófono */}
          <button
            onClick={toggleListening}
            className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'hover:bg-purple-200/50 dark:hover:bg-purple-800/30 text-gray-500 dark:text-gray-400'}`}
            title="Dictar"
          >
            <Mic className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-purple-200 dark:bg-purple-700 mx-0.5"></div>

          {/* Botón Buscar (Standard) */}
          <button
            onClick={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              handleStandardSearch(inputValue);
            }}
            disabled={!inputValue.trim()}
            className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Buscar productos/servicios"
          >
            {isSearching ? <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div> : <Search className="w-4 h-4" />}
          </button>

          {/* Botón Mily (Chat) */}
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() && !isOpen}
            className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all shadow-sm hover:shadow hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Preguntar a Mily (IA)"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Resultados de Búsqueda Standard */}
      {showResults && !isOpen && (
        <SearchResults
          results={results}
          error={searchError}
          searchQuery={inputValue}
          onClose={() => setShowResults(false)}
        />
      )}

      {/* Chat Modal (Mily) */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed lg:absolute top-[8%] lg:top-full left-1/2 lg:left-auto lg:right-0 -translate-x-1/2 lg:translate-x-0 lg:translate-y-0 lg:mt-2 w-[92vw] max-w-[450px] lg:w-96 h-[70vh] lg:h-auto lg:max-h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[70] flex flex-col animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z" />
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
                title="Cerrar chat"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 min-h-0"
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
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z" />
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
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z" />
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

            {/* Input del Chat (Mismo estilo que barra principal) */}
            <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-2xl">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escribe a Mily..."
                  disabled={isLoading}
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50 text-sm"
                />

                <button
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`p-2 rounded-full transition-all duration-200 shadow-sm hover:shadow ${isListening
                      ? 'bg-red-100 text-red-500 animate-pulse'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
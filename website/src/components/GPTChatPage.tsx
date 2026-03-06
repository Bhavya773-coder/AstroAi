import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { getProfessionalSymbol } from '../utils/professionalSymbols';
import AppNavbar from './AppNavbar';

interface GPTMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
}

const GPTChatPage: React.FC = () => {
  const [messages, setMessages] = useState<GPTMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: GPTMessage = {
      role: 'user',
      content: inputMessage.trim(),
      created_at: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await apiFetch('/api/gpt/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage.trim(),
          model: 'gpt-oss:120B'
        })
      });

      if (response?.success) {
        const aiMessage: GPTMessage = {
          role: 'assistant',
          content: response.data.response,
          created_at: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: GPTMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      setMessages([]);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gpt_g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(560 380) rotate(90) scale(420 640)">
              <stop stopColor="#60A5FA" stopOpacity="0.35" />
              <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="gpt_g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(860 220) rotate(90) scale(260 380)">
              <stop stopColor="#A78BFA" stopOpacity="0.32" />
              <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#gpt_g1)" />
          <rect width="1200" height="800" fill="url(#gpt_g2)" />
          {Array.from({ length: 60 }).map((_, i) => {
            const x = (i * 97) % 1200;
            const y = (i * 53) % 800;
            const r = (i % 5) === 0 ? 2 : 1;
            return <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" fillOpacity="0.55" />;
          })}
        </svg>
      </div>

      <AppNavbar />

      <div className="flex h-screen pt-16">
        <div className="flex-1 flex flex-col bg-slate-900/30 max-w-4xl mx-auto w-full">
          <div className="bg-slate-800/50 border-b border-slate-700/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    {getProfessionalSymbol('🧠')} GPT-OSS:120B Chat
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Powered by GPT-OSS:120B - Advanced AI Assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearChat}
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm font-medium"
                >
                  {getProfessionalSymbol('🗑️')} Clear Chat
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm">{getProfessionalSymbol('●')} Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-blue-400">{getProfessionalSymbol('🤖')}</div>
                <h3 className="text-xl font-semibold text-white mb-2">Start Your GPT-OSS Conversation</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  I am powered by GPT-OSS:120B, an advanced AI model. Ask me anything and I'll provide detailed, intelligent responses.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                    {getProfessionalSymbol('💡')} Creative Writing
                  </span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                    {getProfessionalSymbol('🔍')} Research & Analysis
                  </span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
                    {getProfessionalSymbol('💻')} Code & Programming
                  </span>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
                    {getProfessionalSymbol('📚')} Learning & Education
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index.toString()}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3xl mx-2 p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-slate-800/90 border border-slate-700/50 text-white'
                    }`}>
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-purple-400">{getProfessionalSymbol('🧠')}</span>
                          <span className="text-purple-300 text-sm font-medium">GPT-OSS:120B</span>
                          <span className="text-gray-400 text-xs">{formatTime(message.created_at)}</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.role === 'user' && (
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <span className="text-gray-400 text-xs">{formatTime(message.created_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800/90 border border-slate-700/50 text-white max-w-3xl mx-2 p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-gray-400 text-sm">GPT-OSS is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-700/30 p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything - I'm here to help with creative writing, analysis, coding, and more..."
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3 rounded-xl resize-none focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                  rows={1}
                  disabled={isLoading}
                />
                <div className="absolute bottom-3 right-3 text-gray-400 text-xs">
                  {inputMessage.length}/4000
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white p-3 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-lg">{getProfessionalSymbol('📤')}</span>
                )}
              </button>
            </div>
            <div className="mt-2 text-center">
              <p className="text-gray-500 text-xs">
                Powered by GPT-OSS:120B • 120B parameters • Advanced AI model
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPTChatPage;

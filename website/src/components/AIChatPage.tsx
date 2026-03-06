import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { getProfessionalSymbol } from '../utils/professionalSymbols';
import AppNavbar from './AppNavbar';

interface Message {
  _id?: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  ai_analysis_tags?: string[];
  created_at: Date;
}

interface Conversation {
  _id?: string;
  user_id: string;
  title?: string;
  created_at: Date;
  updated_at: Date;
}

const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  const loadConversations = async () => {
    try {
      const response = await apiFetch('/api/chat/conversations');
      if (response?.success) {
        setConversations(response.data || []);
        if (response.data?.length > 0 && !currentConversationId) {
          setCurrentConversationId(response.data[0]._id || '');
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await apiFetch(`/api/chat/conversations/${conversationId}/messages`);
      if (response?.success) {
        setMessages(response.data || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createNewConversation = async () => {
    if (!conversationTitle.trim()) return;

    try {
      const response = await apiFetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: conversationTitle.trim() })
      });

      if (response?.success) {
        const newConversation = response.data;
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversationId(newConversation._id || '');
        setMessages([]);
        setConversationTitle('');
        setShowNewConversationModal(false);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      conversation_id: currentConversationId,
      role: 'user',
      content: inputMessage.trim(),
      created_at: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await apiFetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: currentConversationId,
          message: inputMessage.trim()
        })
      });

      if (response?.success) {
        const aiMessage: Message = response.data;
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        conversation_id: currentConversationId,
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

  const switchConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const response = await apiFetch(`/api/chat/conversations/${conversationId}`, {
        method: 'DELETE'
      });

      if (response?.success) {
        setConversations(prev => prev.filter(conv => conv._id !== conversationId));
        if (currentConversationId === conversationId) {
          setCurrentConversationId('');
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="chat_g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(560 380) rotate(90) scale(420 640)">
              <stop stopColor="#60A5FA" stopOpacity="0.35" />
              <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="chat_g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(860 220) rotate(90) scale(260 380)">
              <stop stopColor="#A78BFA" stopOpacity="0.32" />
              <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#chat_g1)" />
          <rect width="1200" height="800" fill="url(#chat_g2)" />
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
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-slate-900/50 backdrop-blur-md border-r border-slate-700/30 flex flex-col`}>
          <div className="p-4 border-b border-slate-700/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {getProfessionalSymbol('🔮')} AI Chat
              </h2>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white transition-colors lg:hidden"
              >
                {getProfessionalSymbol('✕')}
              </button>
            </div>
            <button
              onClick={() => setShowNewConversationModal(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {getProfessionalSymbol('✨')} New Conversation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 text-gray-400">{getProfessionalSymbol('💭')}</div>
                <p className="text-gray-400">No conversations yet</p>
                <p className="text-gray-500 text-sm mt-2">Start your first AI conversation</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation._id || ''}
                    onClick={() => switchConversation(conversation._id || '')}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                      currentConversationId === conversation._id
                        ? 'bg-purple-500/20 border border-purple-400/50'
                        : 'bg-slate-800/50 border border-slate-700/30 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">
                          {conversation.title || `Conversation ${conversations.indexOf(conversation) + 1}`}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          {formatDate(conversation.updated_at)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conversation._id || '', e)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-200 p-1"
                      >
                        {getProfessionalSymbol('🗑️')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-slate-900/30">
          <div className="bg-slate-800/50 border-b border-slate-700/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {getProfessionalSymbol('☰')}
                </button>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {conversations.find(c => c._id === currentConversationId)?.title || 'AI Life Guidance'}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Ask me anything about your life, career, relationships, and spiritual journey
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm">{getProfessionalSymbol('●')} Online</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-blue-400">{getProfessionalSymbol('🤖')}</div>
                <h3 className="text-xl font-semibold text-white mb-2">Start Your AI Conversation</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  I am here to provide guidance on your life journey. Ask me about relationships, career, personal growth, or any spiritual questions you may have.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message._id || index.toString()}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-2xl mx-2 p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-slate-800/90 border border-slate-700/50 text-white'
                    }`}>
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-purple-400">{getProfessionalSymbol('🔮')}</span>
                          <span className="text-purple-300 text-sm font-medium">AI Assistant</span>
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
                      {message.ai_analysis_tags && message.ai_analysis_tags.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <div className="flex flex-wrap gap-2">
                            {message.ai_analysis_tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800/90 border border-slate-700/50 text-white max-w-2xl mx-2 p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-gray-400 text-sm">AI is thinking...</span>
                      </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="border-t border-slate-700/30 p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about your life, career, relationships..."
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3 rounded-xl resize-none focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                    rows={1}
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3 text-gray-400 text-xs">
                    {inputMessage.length}/2000
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
            </div>
          </div>
        </div>

        {showNewConversationModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">New Conversation</h3>
              <input
                type="text"
                value={conversationTitle}
                onChange={(e) => setConversationTitle(e.target.value)}
                placeholder="Enter conversation title (optional)"
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowNewConversationModal(false)}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewConversation}
                  disabled={!conversationTitle.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatPage;

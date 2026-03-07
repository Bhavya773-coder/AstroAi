import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../api/client';
import { getProfessionalSymbol } from '../utils/professionalSymbols';
import AppNavbar from './AppNavbar';

interface ChatMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date | string;
}

interface ProfileSummary {
  full_name: string | null;
  date_of_birth: string | null;
  time_of_birth?: string | null;
  place_of_birth?: string | null;
  sun_sign: string | null;
  moon_sign?: string | null;
  ascendant?: string | null;
  has_profile: boolean;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓'
};

const SUGGESTIONS = [
  'Love life prediction',
  'Career guidance',
  'Marriage timing',
  'Personal growth advice',
  'What will my relationship be like this year?',
  'Best time for important decisions?'
];

function formatBirthDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

const GPTChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputMessage]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await apiFetch('/api/gpt/profile-summary');
        if (res?.success && res?.data) setProfileSummary(res.data);
      } catch {
        setProfileSummary(null);
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await apiFetch('/api/gpt/messages');
        if (res?.success && Array.isArray(res?.data) && res.data.length > 0) {
          setMessages(
            res.data.map((m: { role: string; content: string; created_at: string }) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
              created_at: m.created_at
            }))
          );
        }
      } catch {
        // keep default empty
      }
    };
    fetchMessages();
  }, []);

  const sendMessage = async (text?: string) => {
    const toSend = (text || inputMessage).trim();
    if (!toSend || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: toSend, created_at: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiFetch('/api/gpt/chat', {
        method: 'POST',
        body: JSON.stringify({ message: toSend, model: 'gpt-oss:120B' })
      });

      if (response?.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: response.data.response,
            created_at: new Date()
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Something went wrong. Please try again.',
            created_at: new Date()
          }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I couldn't reach your astrologer right now. Please try again in a moment.",
          created_at: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    if (window.confirm('Clear this conversation? Your history will be reset.')) setMessages([]);
  };

  const birthSummary =
    profileSummary?.has_profile && profileSummary?.date_of_birth
      ? `${formatBirthDate(profileSummary.date_of_birth)}${profileSummary.place_of_birth ? ` • ${profileSummary.place_of_birth}` : ''}`
      : null;
  const sunSign = profileSummary?.sun_sign || null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[300px] bg-purple-500/10 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 800" fill="none">
          {Array.from({ length: 40 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 137) % 1200}
              cy={(i * 89) % 800}
              r={(i % 3) + 0.5}
              fill="currentColor"
              className="text-amber-400"
            />
          ))}
        </svg>
      </div>

      <AppNavbar />

      <div className="relative flex flex-col pt-16 min-h-screen">
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 pb-4">
          <header className="py-5 border-b border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10">
                  {getProfessionalSymbol('🔮')}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Your Personal Astrologer</h1>
                  <p className="text-amber-200/80 text-sm">Personalized guidance from your birth chart</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!summaryLoading && (birthSummary || sunSign) && (
                  <div className="hidden sm:flex flex-col items-end text-right">
                    {profileSummary?.full_name && (
                      <span className="text-white font-medium">{profileSummary.full_name}</span>
                    )}
                    {sunSign && (
                      <span className="text-amber-300 text-sm flex items-center justify-end gap-1">
                        <span>{ZODIAC_SYMBOLS[sunSign] || '☉'}</span>
                        <span>{sunSign} Sun</span>
                      </span>
                    )}
                    {birthSummary && (
                      <span className="text-white/50 text-xs">{birthSummary}</span>
                    )}
                  </div>
                )}
                <span className="text-emerald-400 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Ready
                </span>
                <button type="button" onClick={clearChat} className="text-white/50 hover:text-white text-sm">
                  Clear chat
                </button>
              </div>
            </div>
            {!summaryLoading && (birthSummary || sunSign) && (
              <div className="sm:hidden mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                {profileSummary?.full_name && (
                  <span className="text-white/90 text-sm">{profileSummary.full_name}</span>
                )}
                {sunSign && (
                  <span className="text-amber-300 text-sm">
                    {ZODIAC_SYMBOLS[sunSign]} {sunSign}
                  </span>
                )}
                {birthSummary && <span className="text-white/50 text-xs">{birthSummary}</span>}
              </div>
            )}
          </header>

          <div className="flex-1 overflow-y-auto py-6 min-h-0">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4 text-amber-400/90">{getProfessionalSymbol('✨')}</div>
                <h2 className="text-lg font-semibold text-white mb-2">Ask your personal astrologer</h2>
                <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
                  I use your profile and birth chart to give tailored answers about love, career, timing, and growth.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(s)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm hover:bg-amber-500/20 hover:border-amber-400/30 hover:text-amber-100 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[90%] sm:max-w-xl p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-amber-500/20 border border-amber-400/30 text-white'
                          : 'bg-slate-800/90 border border-slate-600/50 text-white'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2 text-amber-300/90 text-xs">
                          <span>{getProfessionalSymbol('🔮')}</span>
                          <span>Personal Astrologer</span>
                          <span className="text-white/40">{formatTime(msg.created_at)}</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.role === 'user' && (
                        <p className="text-right text-white/50 text-xs mt-2">{formatTime(msg.created_at)}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800/90 border border-slate-600/50 text-white max-w-xl p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-amber-300/90 text-sm">
                        <div className="flex gap-1">
                          <span
                            className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <span
                            className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                        Consulting your chart…
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. What will my relationship be like this year?"
                className="flex-1 bg-slate-800/50 border border-slate-600/50 text-white placeholder-white/40 px-4 py-3 rounded-xl resize-none focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 min-h-[48px] max-h-[120px]"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="shrink-0 w-12 h-12 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:pointer-events-none text-slate-900 flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-lg">{getProfessionalSymbol('➤')}</span>
                )}
              </button>
            </div>
            <p className="text-center text-white/40 text-xs mt-2">
              Uses your AstroAI profile & birth chart • gpt-oss:120B
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPTChatPage;

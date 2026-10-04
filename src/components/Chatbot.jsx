import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, User, RotateCcw, RefreshCw, WifiOff } from 'lucide-react';
import { queryAiAssistant } from '../services/aiService';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: "Hi! I'm the Adventure Records AI Assistant. How can I help you with your music releases, pricing, or metadata today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [lastPrompt, setLastPrompt] = useState('');
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, errorState]);

  // Focus input field when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Global Keyboard shortcuts (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Clear Chat History
  const handleClearChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        text: "Hi! I'm the Adventure Records AI Assistant. How can I help you with your music releases, pricing, or metadata today?" 
      }
    ]);
    setErrorState(null);
    setLastPrompt('');
  };

  // Send Message Handler
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text || !text.trim() || isTyping) return;

    const trimmedText = text.trim();
    if (!textToSend) setInput('');
    setErrorState(null);
    setLastPrompt(trimmedText);

    // 1. Append User Message
    const userMsg = { role: 'user', text: trimmedText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    // 2. Query AI Service
    const result = await queryAiAssistant({
      message: trimmedText,
      history: updatedMessages
    });

    setIsTyping(false);

    if (result.success && result.reply) {
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', text: result.reply }
      ]);
    } else {
      const errorMsg = result.message || "Sorry, I couldn't process that request right now. Please try again.";
      setErrorState(errorMsg);

      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          text: errorMsg,
          isError: true,
          canRetry: result.canRetry !== false
        }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping && input.trim()) {
        handleSendMessage();
      }
    }
  };

  const suggestions = [
    "How much does a Single cost?",
    "Single vs EP vs Album pricing?",
    "What audio & artwork format is required?",
    "What is the Merchant UPI ID?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-outfit select-none">
      
      {/* 1. Floating Action Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-bubble-btn relative p-4 rounded-full bg-[#050315] dark:bg-[#585589] hover:bg-[#1a1835] dark:hover:bg-[#53527D] text-white font-bold shadow-[0_8px_30px_rgba(0,0,0,0.35)] dark:shadow-[0_8px_30px_rgba(88,85,137,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border-2 border-white/30 group"
          title="Open Adventure Records AI Assistant"
          aria-label="Open Adventure Records AI Assistant"
        >
          <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300 stroke-2" />
          
          {/* Live AI Active Indicator Dot */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
          </span>
        </button>
      )}

      {/* 2. Floating Chat Modal Window */}
      {isOpen && (
        <div 
          role="dialog" 
          aria-label="Adventure Records AI Assistant Chat Window"
          className="w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[85vh] rounded-3xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#0a0a0f] shadow-2xl flex flex-col overflow-hidden animate-fade-in relative backdrop-blur-2xl" 
        >

          {/* Header Bar */}
          <div className="p-4 bg-slate-100 dark:bg-[#0e0e14] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-black/10 dark:bg-[#585589]/20 text-[#050315] dark:text-[#DEDCFF] border border-black/15 dark:border-[#585589]/40">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-[#050315] dark:text-white">Adventure AI</h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold tracking-wider uppercase">Official Music Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-lg text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Clear Chat History"
                aria-label="Clear Chat History"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Close Chat"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Offline Banner */}
          {isOffline && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span>Offline Mode: You are currently disconnected from the internet.</span>
            </div>
          )}

          {/* Messages Log Container */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[88%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs uppercase ${
                  msg.role === 'user' 
                    ? 'bg-[#050315] text-white dark:bg-white/10 dark:text-white border border-black/10 dark:border-white/15' 
                    : 'bg-slate-200 text-[#050315] dark:bg-[#585589]/30 dark:text-[#DEDCFF] border border-black/10 dark:border-[#585589]/40'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#050315] text-white dark:bg-[#585589] rounded-tr-none shadow-md font-medium'
                    : msg.isError 
                      ? 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 rounded-tl-none font-medium'
                      : 'bg-slate-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#050315] dark:text-zinc-200 rounded-tl-none font-medium'
                }`}>
                  {msg.text}

                  {/* Retry Button on Failure */}
                  {msg.isError && msg.canRetry !== false && lastPrompt && (
                    <div className="pt-2.5">
                      <button
                        onClick={() => handleSendMessage(lastPrompt)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300 font-bold text-[10px] uppercase tracking-wider transition-all border border-red-500/30 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Real Gemini Typing Status Indicator */}
            {isTyping && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-[#050315] dark:bg-[#585589]/30 dark:text-[#DEDCFF] border border-black/10 dark:border-[#585589]/40 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center gap-2 rounded-tl-none text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="italic font-semibold text-[#050315] dark:text-[#DEDCFF]">Adventure Records AI is thinking...</span>
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#050315] dark:bg-[#585589] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#050315] dark:bg-[#585589] animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#050315] dark:bg-[#585589] animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Pills (Shown when conversation is short) */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 pt-2 flex flex-wrap gap-2 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-white/2">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-[#585589]/20 border border-black/10 dark:border-white/10 text-[#050315] dark:text-zinc-300 hover:text-black dark:hover:text-white text-[11px] text-left transition-all duration-200 cursor-pointer font-medium shadow-2xs"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input & Send Footer Bar */}
          <div className="p-3.5 bg-slate-100 dark:bg-[#0e0e14] border-t border-black/10 dark:border-white/10 flex gap-2 items-center">
            <input
              ref={chatInputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isTyping}
              placeholder={isOffline ? "Offline mode active..." : "Ask Adventure Records AI..."}
              className="flex-grow bg-white dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#050315] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#050315] dark:focus:border-[#585589] transition-all font-medium disabled:opacity-60"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-[#050315] dark:bg-[#585589] hover:bg-black dark:hover:bg-[#53527D] text-white font-bold disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md"
              title="Send Message"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default Chatbot;

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, User, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import { API_URL } from '../config';
import { auth } from '../firebase';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: "Hi! I'm the Adventure Records AI Assistant. How can I help you?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [lastPrompt, setLastPrompt] = useState('');

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

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
        text: "Hi! I'm the Adventure Records AI Assistant. How can I help you?" 
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

    // Append user message
    const userMsg = { role: 'user', text: trimmedText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      // Get Firebase Auth Token if signed in
      let idToken = null;
      const currentUser = auth?.currentUser;
      if (currentUser) {
        try {
          idToken = await currentUser.getIdToken(false);
        } catch (e) {
          console.warn('Failed to retrieve Firebase ID Token:', e);
        }
      }

      const headers = { 'Content-Type': 'application/json' };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      } else {
        const storedToken = localStorage.getItem('token');
        if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
      }

      // Execute real backend query to Gemini API endpoint
      const response = await fetch(`${API_URL}/api/chatbot/query`, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmedText,
          history: updatedMessages.map(m => ({ role: m.role, content: m.text }))
        })
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      setIsTyping(false);

      if (response.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        throw new Error(data.message || 'Failed to process request.');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Chatbot API Request Error:', error);
      setIsTyping(false);
      
      const errorMessage = "Sorry, I couldn't process that request right now. Please try again.";
      setErrorState(errorMessage);

      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          text: errorMessage,
          isError: true 
        }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestions = [
    "How much does a Single cost?",
    "Single vs EP vs Album differences?",
    "What audio & artwork format is required?",
    "What is the Merchant UPI ID?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-outfit select-none">
      
      {/* 1. Floating Action Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-[0_4px_25px_rgba(234,179,8,0.4)] hover:shadow-[0_0_35px_rgba(234,179,8,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border border-amber-300/40 group"
          title="Open Adventure Records AI Assistant"
          aria-label="Open Adventure Records AI Assistant"
        >
          <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}

      {/* 2. Floating Chat Modal Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[390px] h-[520px] max-h-[85vh] rounded-3xl border border-white/15 bg-[#0a0a0f]/95 shadow-2xl flex flex-col overflow-hidden animate-fade-in relative backdrop-blur-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          
          {/* Header Bar */}
          <div className="p-4 bg-[#0e0e14] border-b border-white/10 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white">Adventure AI</h4>
                <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Official Music Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Clear Chat History"
                aria-label="Clear Chat History"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Close Chat"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

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
                    ? 'bg-white/10 text-white border border-white/15' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-amber-500/20 border border-amber-500/30 text-white rounded-tr-none'
                    : msg.isError 
                      ? 'bg-red-500/10 border border-red-500/30 text-red-300 rounded-tl-none'
                      : 'bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none'
                }`}>
                  {msg.text}

                  {/* Retry Button on Failure */}
                  {msg.isError && lastPrompt && (
                    <div className="pt-2.5">
                      <button
                        onClick={() => handleSendMessage(lastPrompt)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-[10px] uppercase tracking-wider transition-all border border-red-500/30 cursor-pointer"
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
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 rounded-tl-none text-xs text-zinc-400">
                  <span className="italic font-medium text-amber-400/90">Adventure Records AI is typing...</span>
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Pills (Shown on startup) */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 pt-2 flex flex-wrap gap-2 border-t border-white/5 bg-white/2">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-[11px] text-left transition-all duration-200 cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input & Send Footer Bar */}
          <div className="p-3.5 bg-[#0e0e14] border-t border-white/10 flex gap-2 items-center" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <input
              ref={chatInputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Adventure Records AI..."
              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-all"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-40 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Send Message"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default Chatbot;

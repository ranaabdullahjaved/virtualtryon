import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { X, MessageCircle, Send, RotateCcw } from 'lucide-react';

interface Message {
  from: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function ChatbotButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      from: 'ai', 
      text: 'Hi! I\'m SuitUp AI, your personal fashion assistant! 👗✨\n\nI can help you with:\n• Virtual try-on recommendations\n• Style advice and outfit coordination\n• Product discovery and shopping tips\n• Order support and customer service\n\nWhat would you like to know about today?', 
      timestamp: new Date() 
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newUserMessage: Message = {
      from: 'user',
      text: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.from === 'user' || msg.from === 'ai')
        .map(msg => ({
          role: msg.from === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          conversationHistory 
        }),
      });

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: Message = {
        from: 'ai',
        text: data.aiMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: Message = {
        from: 'ai',
        text: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const resetConversation = () => {
    setMessages([
      { 
        from: 'ai', 
        text: 'Hi! I\'m SuitUp AI, your personal fashion assistant! 👗✨\n\nI can help you with:\n• Virtual try-on recommendations\n• Style advice and outfit coordination\n• Product discovery and shopping tips\n• Order support and customer service\n\nWhat would you like to know about today?', 
        timestamp: new Date() 
      },
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        variant="secondary"
        size="icon"
        className="fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
        onClick={() => setOpen(true)}
        aria-label="Open AI Chatbot"
      >
        <MessageCircle className="w-7 h-7" />
      </Button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-auto rounded-t-2xl md:rounded-2xl shadow-2xl bg-white/95 flex flex-col h-[70vh] md:h-[32rem] animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <span className="font-bold text-lg text-purple-700 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> SuitUp AI
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={resetConversation}
                  className="text-gray-500 hover:text-purple-600"
                  aria-label="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setOpen(false)} 
                  aria-label="Close Chatbot"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-purple-50 to-blue-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-xl max-w-[80%] text-sm shadow-sm border ${
                    msg.from === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-800 border-gray-200'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div className={`text-xs mt-1 ${
                      msg.from === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-2 rounded-xl bg-white text-gray-800 border border-gray-200 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  placeholder="Ask me anything about fashion, virtual try-on, or shopping..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={loading}
                />
                <Button 
                  type="submit" 
                  variant="default" 
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700" 
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
} 
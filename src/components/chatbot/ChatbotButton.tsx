import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { X, MessageCircle } from 'lucide-react';

export default function ChatbotButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! I am SuitUp AI. Ask me anything about virtual try-on, shopping, or our products!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      { from: 'user', text: input },
    ]);
    setLoading(true);
    const userMessage = input;
    setInput('');
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { from: 'ai', text: data.aiMessage || 'Sorry, I could not generate a response.' },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { from: 'ai', text: 'Sorry, there was an error contacting SuitUp AI.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        variant="secondary"
        size="icon"
        className="fixed bottom-6 right-6 z-50 shadow-lg animate-bounce"
        onClick={() => setOpen(true)}
        aria-label="Open AI Chatbot"
      >
        <MessageCircle className="w-7 h-7" />
      </Button>
      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-auto rounded-t-2xl md:rounded-2xl shadow-2xl bg-white/95 flex flex-col h-[70vh] md:h-[32rem] animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-lg text-purple-700 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> SuitUp AI Chatbot
              </span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close Chatbot">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-purple-50 to-blue-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-xl max-w-[80%] text-sm shadow ${msg.from === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border'}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="p-4 border-t flex gap-2 bg-white">
              <input
                type="text"
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Ask SuitUp AI..."
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
                disabled={loading}
              />
              <Button type="submit" variant="default" className="px-4 py-2" disabled={loading || !input.trim()}
              >{loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"></span> : 'Send'}</Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
} 
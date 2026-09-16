import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  User,
  X,
  Lightbulb,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Hello ${currentUser?.name || 'Resident'}! I am your AI Campus Resident Assistant. I can help you with hostel bylaws, room transfer procedures, mess timings, food waste management, fee invoices, or outstation leave policies. What would you like to know?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'How do I request a room transfer?',
    'What are the mess timings and food wastage policies?',
    'How does my approved leave affect mess attendance?',
    'What is the night curfew timing and visitor rules?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await api.askCampusAIAssistant(textToSend, currentUser?.name);
      const botMsg: ChatMessage = {
        sender: 'assistant',
        text: res.reply || 'I am ready to assist you with hostel rules and procedures.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Our AI model is currently optimizing residential queries. For urgent matters, please contact the warden desk.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full flex flex-col h-[600px] border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold">CampusHostel AI Resident Assistant</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-indigo-200">Powered by Gemini AI • 24/7 Hostel & Mess Guide</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((m, idx) => {
            const isBot = m.sender === 'assistant';
            return (
              <div key={idx} className={`flex items-start space-x-2.5 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    isBot ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'
                  }`}
                >
                  {isBot ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isBot
                      ? 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                      : 'bg-indigo-600 text-white shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span className={`text-[9px] block mt-1 ${isBot ? 'text-slate-400' : 'text-indigo-200'} text-right`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 italic p-2 bg-white rounded-xl border border-slate-200 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>Gemini AI is crafting response...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 text-[10px] font-bold uppercase pl-1 flex-shrink-0">Suggestions:</span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(qp)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Query Input */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything about hostel rules, transfers, or mess food..."
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareText, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  X, 
  CornerDownLeft, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { askAiAssistant } from '../services/api';

const QUICK_PROMPTS = [
  "Which segment should I prioritize this quarter?",
  "How much total revenue is currently at risk of churn?",
  "What retention playbook works best for Champions?",
  "How can we migrate Potential Loyalists into Champions?",
  "What is our customer recency decay breakdown?"
];

export default function AskAiChat({ isOpen, onClose, rfmData, apiKey }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your **RFM AI Marketing Strategist**. I have analyzed your customer dataset. Ask me anything about segment prioritization, churn prevention, revenue risk, or campaign playbooks!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedFollowups, setSuggestedFollowups] = useState(QUICK_PROMPTS);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (queryText) => {
    const q = queryText || input;
    if (!q || !q.trim() || isTyping) return;

    const userMsg = { role: 'user', content: q.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await askAiAssistant(q.trim(), rfmData, apiKey);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.answer }
      ]);
      if (response.suggested_followups && response.suggested_followups.length > 0) {
        setSuggestedFollowups(response.suggested_followups);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Sorry, I encountered an error answering your question: ${err.message}` }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full h-[620px] shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Chat Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-2xl shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">RFM Strategy AI Copilot</h3>
              <p className="text-[11px] text-slate-500">Grounded on your active {rfmData?.kpis?.total_customers?.toLocaleString() || ''} customers</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-2xs whitespace-pre-wrap'
                }`}
              >
                {m.content}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Analyzing RFM data and synthesizing strategy...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        {suggestedFollowups && suggestedFollowups.length > 0 && (
          <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-[11px] shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-slate-400 shrink-0 font-medium">Suggested:</span>
            {suggestedFollowups.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-full border border-slate-200 whitespace-nowrap transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-white rounded-b-2xl shrink-0">
          <div className="relative flex items-center">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your customer segments..."
              className="w-full pr-12 pl-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none font-medium text-slate-800"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

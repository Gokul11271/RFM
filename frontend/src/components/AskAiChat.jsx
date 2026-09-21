import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Bot, 
  User, 
  X, 
  Send, 
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#0e121a] text-slate-100 rounded-3xl max-w-2xl w-full h-[620px] shadow-2xl border border-white/[0.10] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Chat Header */}
        <div className="p-4 sm:px-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02] rounded-t-3xl shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">RFM Strategy AI Copilot</h3>
              <p className="text-[11px] text-slate-400">Grounded on your active {rfmData?.kpis?.total_customers?.toLocaleString() || ''} customers</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
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
                <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                    : 'bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {m.content}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-white/[0.12] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Synthesizing strategy with RFM context...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        {suggestedFollowups && suggestedFollowups.length > 0 && (
          <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.06] flex items-center space-x-2 overflow-x-auto text-[11px] shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-500 shrink-0 font-medium">Suggested:</span>
            {suggestedFollowups.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1 bg-white/[0.05] hover:bg-white/[0.10] hover:text-white text-slate-300 rounded-full border border-white/[0.08] whitespace-nowrap transition-colors cursor-pointer text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#0e121a] rounded-b-3xl shrink-0">
          <div className="relative flex items-center">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about segment playbooks, churn risk, or revenue upside..."
              className="w-full pr-12 pl-4 py-2.5 text-xs bg-white/[0.04] border border-white/[0.10] rounded-xl focus:outline-none focus:border-amber-400/50 resize-none text-white placeholder:text-slate-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

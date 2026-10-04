import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Send, MessageSquare, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

export default function ContractChat() {
  const { id } = useParams();
  
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your RAG contract assistant. Ask me questions like "What are the payment terms?" or "When can this contract be terminated?". All answers include exact contract source citations.',
      citations: []
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "What are the payment terms?",
    "When can this contract be terminated?",
    "Is there automatic renewal?",
    "Who owns the intellectual property?",
    "What are the liability limits?"
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await api.post(`/chat/${id}`, { query: textToSend });
      const aiData = res.data.data;
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiData.answer,
          citations: aiData.citations || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Error contacting AI contract service.',
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">RAG Contract Assistant</h1>
            <p className="text-xs text-slate-500">Retrieval-Augmented Generation with mandatory document source grounding</p>
          </div>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-full transition shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="h-3 w-3 text-sky-500" />
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 min-h-[400px] max-h-[550px] overflow-y-auto">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>

              {/* Source Citations */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 text-[11px]">
                  <span className="font-bold text-slate-600 flex items-center gap-1 mb-1">
                    <BookOpen className="h-3 w-3 text-sky-600" /> Contract Source Citations:
                  </span>
                  {m.citations.map((c, ci) => (
                    <div key={ci} className="bg-white p-2 rounded border border-slate-200 text-slate-700 font-mono text-[10px] mt-1">
                      <span className="font-bold text-sky-700">Page {c.page} [{c.clause}]:</span> "{c.passage}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 text-xs p-3 rounded-xl animate-pulse">
              Retrieving grounded vector context & querying model...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask any question about this contract..."
          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow transition flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="h-4 w-4" /> Send
        </button>
      </form>

    </div>
  );
}

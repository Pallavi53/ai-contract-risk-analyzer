import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, Send, BookOpen, AlertCircle } from 'lucide-react';

export default function RagChat({ contractId }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "What is the payment amount?",
    "When can the agreement be terminated?",
    "Does the contract automatically renew?",
    "What is the liability limit?",
    "Who owns the intellectual property?"
  ];

  const handleAsk = async (qText) => {
    const queryToAsk = qText || question;
    if (!queryToAsk.trim() || !contractId) return;

    const userMsg = { role: 'user', text: queryToAsk };
    setMessages((prev) => [...prev, userMsg]);
    if (!qText) setQuestion('');
    setLoading(true);

    try {
      const res = await axios.post(`/api/contracts/${contractId}/chat`, { question: queryToAsk });
      const botMsg = {
        role: 'bot',
        answer: res.data.answer,
        source: res.data.source,
        page_number: res.data.page_number
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          answer: "The uploaded contract does not contain sufficient information to answer this question.",
          source: "N/A",
          page_number: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-bold text-white uppercase tracking-wide">ASK ABOUT THIS CONTRACT (RAG CHAT)</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleAsk(q)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 rounded-full px-3 py-1.5 transition"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[160px] max-h-[300px] overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-8">
            Ask any question about the uploaded contract. Answers are strictly extracted from this document.
          </p>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                {m.role === 'user' ? (
                  m.text
                ) : (
                  <div>
                    <p className="mb-2">{m.answer}</p>
                    {m.page_number > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        <span>Source: <strong className="text-slate-300">{m.source}</strong></span>
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">
                          Page {m.page_number}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="text-xs text-blue-400 animate-pulse font-mono">
            Searching contract embeddings...
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What is the liability cap?"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition"
        >
          <Send className="w-4 h-4" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { X, Send, Bot, User, CheckCircle } from "lucide-react";

interface BidMateModalProps {
  auctionId: string;
  itemTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "assistant" | "user";
  text: string;
}

export function BidMateModal({ auctionId, itemTitle, isOpen, onClose }: BidMateModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hello! I'm **BidMate AI**, your verified Sri Lankan marketplace shopping assistant. Ask me anything about **${itemTitle}** — such as specifications, seller reputation, condition checks, or delivery details!`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    "What is the current bid and ending time?",
    "Is this seller verified and trustworthy?",
    "Does this item support heavy gaming or editing?",
    "How does delivery work for this item?",
  ];

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = { role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/bidmate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId,
          question: q,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "I encountered an error retrieving item details. Please try again." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Network error connecting to BidMate AI. Please check your connection." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-brand-500 via-amber-500 to-amber-600 p-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950/10 backdrop-blur-md flex items-center justify-center text-slate-950">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm">BidMate AI</h3>
                <span className="bg-slate-950 text-brand-400 text-[10px] font-extrabold px-1.5 py-0.2 rounded">
                  Grounded LK
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-900 line-clamp-1 max-w-[280px]">
                {itemTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-950/10 transition text-slate-950"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat message thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  m.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-brand-500 text-slate-950 font-bold"
                }`}
              >
                {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none shadow-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs">
              <div className="w-7 h-7 rounded-xl bg-brand-500 text-slate-950 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px]">Analyzing listing specifications...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-2">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap transition shrink-0"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask BidMate about condition, specs, or delivery..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isLoading}
            className="bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-slate-950 p-2.5 rounded-xl transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

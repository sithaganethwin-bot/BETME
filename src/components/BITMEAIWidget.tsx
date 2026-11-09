"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  X, 
  Send, 
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  Clock,
  Gavel,
  Search
} from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const PROMPT_SUGGESTIONS = [
  "Auctions ending in 30 mins",
  "Items with no bids yet",
  "Show electronics under Rs. 100k",
  "How does anti-sniping work?",
  "PayHere escrow protection"
];

export function BIDMEAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Ayubowan! 👋 I am the **BIDME Auction Assistant**.\n\nI can help you discover genuine live lots, check current high bids, find deals with no bids yet, or explain our verified anti-sniping and PayHere escrow guarantees. What would you like to explore today?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    if (!messageText) setInput("");
    const newHistory = [...messages, { role: "user" as const, text: textToSend }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: newHistory,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "All auctions on BIDME are backed by verified seller credentials, PayHere custodial escrow, and a +120s anti-sniping extension. How else may I assist you?",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I am having trouble connecting to the live market index right now. Please explore the live categories or contact support@bidme.lk.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-40 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-[0_8px_25px_rgba(36,87,230,0.35)] transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Open BIDME Auction Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-white text-[#2457E6] flex items-center justify-center font-bold shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <span className="font-bold">Ask BIDME AI</span>
          <span className="w-2 h-2 rounded-full bg-[#16B8A6] animate-pulse"></span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[82vh] bg-white dark:bg-slate-900 border border-[#E5EAF2] dark:border-slate-800 rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.16)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#F5F7FB] dark:bg-slate-800/80 border-b border-[#E5EAF2] dark:border-slate-800 px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#2457E6] text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-[#172033] dark:text-[#F8FAFC]">
                    BIDME Assistant
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#E8FAF7] text-[#16B8A6] dark:bg-teal-950 dark:text-teal-300">
                    Live Grounded
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                  Real-time market discovery & advice
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#64748B] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white dark:bg-slate-900 text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-[#2457E6]/10 text-[#2457E6] dark:bg-blue-500/20 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#2457E6] text-white rounded-br-none"
                      : "bg-[#F5F7FB] dark:bg-slate-800 text-[#172033] dark:text-slate-200 border border-[#E5EAF2] dark:border-slate-700 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-[#64748B] dark:text-slate-400">
                <div className="w-6 h-6 rounded-full bg-[#2457E6]/10 text-[#2457E6] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-[#F5F7FB] dark:bg-slate-800 px-3 py-2 rounded-2xl border border-[#E5EAF2] dark:border-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2457E6] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2457E6] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2457E6] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] ml-1">Analyzing live database...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Query Chips */}
          <div className="px-3 py-2 border-t border-[#E5EAF2] dark:border-slate-800 bg-[#FAFAFC] dark:bg-slate-900/60 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {PROMPT_SUGGESTIONS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 text-[#2457E6] dark:text-blue-300 border border-[#2457E6]/20 dark:border-blue-500/20 hover:border-[#2457E6] hover:bg-blue-50/50 dark:hover:bg-slate-700 rounded-full text-[10px] font-semibold transition shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-[#E5EAF2] dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about live auctions, ending soon, or rules..."
              className="flex-1 px-3.5 py-2.5 bg-[#F5F7FB] dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-700 rounded-xl text-xs text-[#172033] dark:text-slate-100 placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2457E6]/30 transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-[#2457E6] hover:bg-[#1d46be] disabled:opacity-40 text-white rounded-xl shadow-sm transition shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Escrow & Anti-sniping footnote */}
          <div className="px-3 py-1.5 bg-[#F5F7FB] dark:bg-slate-950 border-t border-[#E5EAF2] dark:border-slate-800/80 text-[10px] text-[#64748B] dark:text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#16B8A6]" />
              PayHere Escrow & Anti-Sniping Guard
            </span>
            <span className="font-mono text-[9px]">v2.4 Grounded</span>
          </div>
        </div>
      )}
    </div>
  );
}

export const BITMEAIWidget = BIDMEAIWidget;
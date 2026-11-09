"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  X, 
  Send, 
  MessageCircle,
  HelpCircle,
  ShieldCheck
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export function AiSupportConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Ayubowan! 👋 I am your BIDME AI Assistant. How can I help you today? Ask me about live auctions, bidding rules, PayHere escrow, or islandwide delivery!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    const newHistory = [...messages, { role: "user" as const, text: userText }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userText,
          history: newHistory,
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "All auctions on BIDME are protected by PayHere custodial escrow and a fair +120s anti-sniping extension. How else can I help?",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I'm temporarily offline, but you can explore auctions or email support@bidme.lk anytime!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans hidden sm:block">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-lg transition hover:scale-105 active:scale-95"
        >
          <div className="w-5 h-5 rounded-full bg-white text-[#2457E6] flex items-center justify-center font-bold">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span>Ask BIDME AI</span>
          <span className="w-2 h-2 rounded-full bg-[#16B8A6] animate-pulse"></span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[500px] bg-white border border-[#E5EAF2] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#F5F7FB] border-b border-[#E5EAF2] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2457E6] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#172033] flex items-center gap-1.5">
                  <span>BIDME AI Concierge</span>
                  <span className="text-[9px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-1.5 py-0.2 rounded-full">
                    Online
                  </span>
                </h4>
                <p className="text-[10px] text-[#64748B]">Instant marketplace assistant</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-[#64748B] hover:text-[#172033] hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Guidance Chips */}
          <div className="p-2.5 bg-[#F5F7FB]/50 border-b border-[#E5EAF2] flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => {
                setInput("How does the 5% seller fee and payout work?");
                handleSend();
              }}
              className="px-2.5 py-1 bg-white border border-[#E5EAF2] rounded-full text-[#64748B] hover:text-[#2457E6] shrink-0"
            >
              Seller Payouts
            </button>
            <button
              type="button"
              onClick={() => {
                setInput("Explain the +120s anti-sniping rule.");
                handleSend();
              }}
              className="px-2.5 py-1 bg-white border border-[#E5EAF2] rounded-full text-[#64748B] hover:text-[#2457E6] shrink-0"
            >
              Anti-Sniping
            </button>
            <button
              type="button"
              onClick={() => {
                setInput("How is delivery handled across Sri Lanka?");
                handleSend();
              }}
              className="px-2.5 py-1 bg-white border border-[#E5EAF2] rounded-full text-[#64748B] hover:text-[#2457E6] shrink-0"
            >
              Delivery
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#2457E6] text-white"
                      : "bg-[#F5F7FB] border border-[#E5EAF2] text-[#172033]"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#F5F7FB] border border-[#E5EAF2] text-[#64748B] rounded-2xl p-3 text-xs flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2457E6] animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2457E6] animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2457E6] animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-[#F5F7FB] border-t border-[#E5EAF2] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about BIDME..."
              className="flex-1 px-3.5 py-2 bg-white border border-[#E5EAF2] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2457E6]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-[#2457E6] hover:bg-[#1d46be] disabled:bg-slate-300 text-white rounded-xl shadow-sm transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

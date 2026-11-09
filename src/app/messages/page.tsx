"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Paperclip, 
  User, 
  Store, 
  Clock, 
  Gavel, 
  CheckCircle,
  FileText,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function MessagesAndDisputesPage() {
  const { currentUser, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState<"messages" | "disputes">("messages");
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  
  // Dispute state
  const [disputeLotId, setDisputeLotId] = useState("LOT-4092-ROLEX");
  const [disputeReason, setDisputeReason] = useState("AUTHENTICITY_VERIFICATION");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeFiled, setDisputeFiled] = useState(false);

  const [conversations, setConversations] = useState([
    {
      id: "conv_1",
      participant: "Dilshan Global Emporium (Consignor)",
      role: "VERIFIED_SELLER",
      lotTitle: "Rolex Submariner Date 41mm (Lot #4092)",
      messages: [
        { sender: "seller", text: "Ayubowan Kasun, thank you for your active bid on Lot #4092.", time: "10:14 AM" },
        { sender: "buyer", text: "Hi Dilshan, does the 2024 Rolex guarantee card have the official Colombo authorized dealer stamp?", time: "10:16 AM" },
        { sender: "seller", text: "Yes, verified by Chatham Luxury Colombo. The green box, seal tag, and international warranty booklet are all sealed inside the secure vault case.", time: "10:18 AM" },
      ],
    },
    {
      id: "conv_2",
      participant: "BIDME Clearinghouse Support Desk",
      role: "SUPPORT",
      lotTitle: "Platform Escrow Clearance #90281",
      messages: [
        { sender: "support", text: "Welcome to BIDME. Your qualified bidder profile has been accredited with a Rs. 10M ceiling limit.", time: "Yesterday" },
      ],
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const updated = [...conversations];
    updated[selectedConversation].messages.push({
      sender: "buyer",
      text: messageInput.trim(),
      time: "Just now",
    });

    setConversations(updated);
    setMessageInput("");
  };

  const handleFileDispute = (e: React.FormEvent) => {
    e.preventDefault();
    setDisputeFiled(true);
    addNotification(`Dispute filed for ${disputeLotId}. Escrow disbursement frozen.`);
  };

  const activeConv = conversations[selectedConversation];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb Navigation & Back Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link href="/" className="hover:text-[#2457E6] transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/dashboard" className="hover:text-[#2457E6] transition">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#172033] font-semibold">Messages & Concierge</span>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#2457E6] bg-white border border-[#E5EAF2] hover:border-[#2457E6]/40 px-3.5 py-1.5 rounded-full transition shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgb(0,0,0,0.03)] space-y-2">
        <span className="text-xs font-bold text-[#2457E6] uppercase tracking-wider">Communications & Support</span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
          BIDME Concierge & Dispute Resolution
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Direct verified inquiries between consignors and bidders with escrow arbitration.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-[#E5EAF2] shadow-sm max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("messages")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === "messages" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Active Inquiries</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("disputes")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === "disputes" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-300" />
          <span>Escrow Protection & Disputes</span>
        </button>
      </div>

      {activeTab === "messages" ? (
        /* Messaging Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-[#E5EAF2] rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.03)] overflow-hidden min-h-[500px]">
          {/* Conversation List */}
          <div className="lg:col-span-4 border-r border-[#E5EAF2] p-4 space-y-2 bg-[#F5F7FB]/50">
            <span className="text-xs font-bold text-[#64748B] uppercase px-2">Conversations</span>
            {conversations.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedConversation(idx)}
                className={`w-full text-left p-3 rounded-2xl transition space-y-1 ${
                  selectedConversation === idx
                    ? "bg-white border border-[#2457E6]/40 shadow-sm"
                    : "hover:bg-white/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#172033] truncate max-w-[170px]">{c.participant}</span>
                  <span className="text-[10px] text-[#16B8A6] font-bold">Verified</span>
                </div>
                <p className="text-[11px] text-[#64748B] truncate">{c.lotTitle}</p>
              </button>
            ))}
          </div>

          {/* Active Chat Window */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {/* Chat Header */}
            <div className="p-4 border-b border-[#E5EAF2] bg-[#F5F7FB]/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#172033]">{activeConv.participant}</h4>
                <p className="text-[11px] text-[#64748B]">{activeConv.lotTitle}</p>
              </div>
              <span className="text-[10px] font-bold text-[#2457E6] bg-[#EEF3FF] px-2.5 py-1 rounded-full">
                Protected Channel
              </span>
            </div>

            {/* Chat Body */}
            <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[350px]">
              {activeConv.messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.sender === "buyer" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.sender === "buyer"
                        ? "bg-[#2457E6] text-white"
                        : "bg-[#F5F7FB] border border-[#E5EAF2] text-[#172033]"
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className={`text-[9px] block text-right mt-1 ${m.sender === "buyer" ? "text-white/70" : "text-[#64748B]"}`}>
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5EAF2] bg-[#F5F7FB]/30 flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message to the consignor..."
                className="flex-1 px-4 py-2.5 bg-white border border-[#E5EAF2] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2457E6]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Disputes Filing Layout */
        <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
          <div className="border-b border-[#E5EAF2] pb-4">
            <h3 className="font-bold text-base text-[#172033] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Formal Dispute & Escrow Freeze Application</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Filing a dispute instantly halts escrow payout disbursement to the seller while BIDME Legal examines evidence.
            </p>
          </div>

          {disputeFiled ? (
            <div className="bg-[#E8FAF7] border border-[#16B8A6]/30 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-[#16B8A6] mx-auto" />
              <h4 className="font-bold text-base text-[#172033]">Dispute Dossier Queued: #DISP-2026-9014</h4>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                Funds for Lot #{disputeLotId} have been frozen in PayHere custodial escrow. Our compliance team will review your statement within 24 hours.
              </p>
              <button
                onClick={() => setDisputeFiled(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5EAF2] text-xs font-bold text-[#172033]"
              >
                View Dispute Status
              </button>
            </div>
          ) : (
            <form onSubmit={handleFileDispute} className="space-y-4 max-w-2xl">
              <div>
                <label className="text-xs font-bold text-[#172033] block mb-1.5">AUCTION LOT REFERENCE</label>
                <select
                  value={disputeLotId}
                  onChange={(e) => setDisputeLotId(e.target.value)}
                  className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] outline-none"
                >
                  <option value="LOT-4092-ROLEX">LOT #4092 — Rolex Submariner Date 41mm</option>
                  <option value="LOT-4093-PORSCHE">LOT #4093 — Porsche 911 GT3 (992)</option>
                  <option value="LOT-4094-SAPPHIRE">LOT #4094 — Ceylon Royal Blue Sapphire 3.15ct</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#172033] block mb-1.5">DISPUTE CLASSIFICATION</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] outline-none"
                >
                  <option value="AUTHENTICITY_VERIFICATION">Authenticity or Provenance Discrepancy</option>
                  <option value="DAMAGE_IN_TRANSIT">Item Damaged During Insured Courier Transit</option>
                  <option value="ITEM_NOT_RECEIVED">Item Not Received Within Estimated Delivery Window</option>
                  <option value="MISREPRESENTATION">Significantly Not as Described in Catalog</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#172033] block mb-1.5">EVIDENCE & DETAILED STATEMENT</label>
                <textarea
                  rows={4}
                  required
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Provide precise details of the issue, serial numbers examined, or courier delivery photos..."
                  className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] outline-none leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Submit Formal Dispute & Freeze Escrow</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

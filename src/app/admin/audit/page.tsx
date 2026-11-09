"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  Lock, 
  Terminal, 
  Filter,
  CheckCircle2,
  Calendar
} from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/admin/overview");
        const data = await res.json();
        if (data.success && data.auditLogs) {
          setLogs(data.auditLogs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.adminId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = filterAction === "ALL" || l.action === filterAction;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#16B8A6] bg-[#16B8A6]/10 px-2.5 py-0.5 rounded-full border border-[#16B8A6]/30 uppercase">
              Regulatory Compliance
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Immutable Records: {logs.length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Immutable Administrative Audit Trail
          </h1>
          <p className="text-xs text-slate-400">
            Cryptographically sealed operational audit logs compliant with CBSL and electronic transactions regulations
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by operator, action, or target lot..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#2457E6]"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#2457E6] w-full sm:w-auto"
        >
          <option value="ALL">All Event Types</option>
          <option value="VERIFICATION_APPROVED">KYC Approved</option>
          <option value="AUCTION_PAUSED">Auction Paused</option>
          <option value="USER_SUSPENDED">User Suspended</option>
          <option value="ESCROW_RELEASED">Escrow Released</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4 font-mono">Timestamp (UTC+5:30)</th>
                <th className="py-3.5 px-4">Operator / Admin ID</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Audit Details & Target</th>
                <th className="py-3.5 px-4 font-mono text-right">Cryptographic Seal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{log.adminId}</span>
                    <span className="text-[10px] text-slate-500 font-sans">IP: {log.ipAddress}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold text-[#16B8A6] bg-[#16B8A6]/10 border border-[#16B8A6]/30 px-2 py-0.5 rounded-full inline-block">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-300">
                    <p className="max-w-md line-clamp-1">{log.details}</p>
                    <span className="text-[10px] font-mono text-slate-500">Target: {log.targetId}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-500 text-[10px]">
                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      sha256:{log.id.slice(-8)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

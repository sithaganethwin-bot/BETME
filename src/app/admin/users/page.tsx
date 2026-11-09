"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Ban, 
  AlertTriangle, 
  CheckCircle2, 
  Filter,
  Eye,
  Mail,
  Phone,
  Building
} from "lucide-react";
import { formatLKR } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleExecuteAction = async (action: "SUSPEND" | "RESTRICT" | "RESTORE") => {
    if (!selectedUser) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action,
          reason: suspendReason || "Administrative governance enforcement.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`User ${selectedUser.name} marked as ${action}`);
        setSuspendModalOpen(false);
        setSuspendReason("");
        fetchUsers();
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nic?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#2457E6] bg-[#2457E6]/10 px-2.5 py-0.5 rounded-full border border-[#2457E6]/30 uppercase">
              Identity Governance
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Total Registered: {users.length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            User & Consignor Management
          </h1>
          <p className="text-xs text-slate-400">
            Unified user profiles, role enforcement, buyer scores, and account restrictions
          </p>
        </div>

        {actionMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl animate-in fade-in">
            ✓ {actionMessage}
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or Sri Lanka NIC..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#2457E6]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#2457E6]"
          >
            <option value="ALL">All Roles</option>
            <option value="BUYER">Buyer Only</option>
            <option value="SELLER">Seller Only</option>
            <option value="BUYER_AND_SELLER">Buyer + Seller</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#2457E6]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="RESTRICTED">Restricted</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">User Identity</th>
                <th className="py-3.5 px-4">NIC & District</th>
                <th className="py-3.5 px-4">Role & Store</th>
                <th className="py-3.5 px-4">Trust Scores</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2457E6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-white block">{u.name}</strong>
                        <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-300 block">{u.nic || "Unverified"}</span>
                    <span className="text-[11px] text-slate-500">{u.district || "Colombo"} District</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold text-[#2457E6] bg-[#2457E6]/10 px-2 py-0.5 rounded-full inline-block">
                      {u.role}
                    </span>
                    {u.storeName && (
                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-[150px]">
                        {u.storeName}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-[11px]">
                      <span className="text-emerald-400 font-bold">Buyer: {u.buyerScore || 98}%</span>
                      <span className="text-slate-500 mx-1">•</span>
                      <span className="text-amber-400 font-bold">Rep: {u.reputationScore || 4.9}★</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.status === "ACTIVE"
                        ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/40"
                        : u.status === "SUSPENDED"
                        ? "bg-rose-950/50 text-rose-400 border border-rose-800/40"
                        : "bg-amber-950/50 text-amber-400 border border-amber-800/40"
                    }`}>
                      {u.status || "ACTIVE"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.status === "SUSPENDED" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            handleExecuteAction("RESTORE");
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setSuspendModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 font-bold text-[10px] rounded-lg transition"
                        >
                          Restrict / Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Modal */}
      {suspendModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <Ban className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Restrict Account: {selectedUser.name}</h3>
            </div>
            <p className="text-xs text-slate-400">
              Provide an administrative reason for suspending or restricting this user account:
            </p>
            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Non-payment on won lot, fraudulent bidding, policy violation..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            ></textarea>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSuspendModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteAction("RESTRICT")}
                className="flex-1 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl"
              >
                Restrict Bidding
              </button>
              <button
                type="button"
                onClick={() => handleExecuteAction("SUSPEND")}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl"
              >
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

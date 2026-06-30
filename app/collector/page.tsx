"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiPlus, FiShield, FiTrendingUp,
  FiUsers, FiDollarSign, FiCheckCircle, FiClock,
} from "react-icons/fi";
import { MdOutlineAccountBalance } from "react-icons/md";
import { getCollections, type Collection } from "@/services/collection.service";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `₹${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function CollectorHubPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = today.toDateString();
  const dailyGoal = 20;

  useEffect(() => {
    getCollections()
      .then(setCollections)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const todayCols = collections.filter(
    (c) => new Date(c.collectionDate).toDateString() === todayStr
  );
  const thisMonthCols = collections.filter(
    (c) => c.month === today.getMonth() + 1 && c.year === today.getFullYear()
  );
  const totalCollectedToday = todayCols.reduce((s, c) => s + c.amount, 0);
  const totalThisMonth = thisMonthCols.reduce((s, c) => s + c.amount, 0);
  const totalAllTime = collections.reduce((s, c) => s + c.amount, 0);
  const uniqueCustomers = new Set(
    collections.map((c) => (typeof c.customerId === "object" ? c.customerId._id : c.customerId))
  ).size;
  const progressPct = Math.min(Math.round((todayCols.length / dailyGoal) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">
            Collector Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your collections and performance in real time.
          </p>
        </div>
        <Link
          href="/collector/collections"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003527] text-white text-sm font-bold rounded-xl hover:bg-[#064e3b] active:scale-[0.98] transition-all shadow-lg shadow-[#003527]/20 self-start"
        >
          <FiPlus className="text-base" />
          New Collection
        </Link>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#003527] rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mb-3">
            <FiDollarSign className="text-lg text-[#6cf8bb]" />
          </div>
          <p className="text-2xl font-bold text-white leading-none mb-1">
            {loading ? "—" : formatCurrency(totalCollectedToday)}
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Today&apos;s Amount</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#e8f5ef] flex items-center justify-center mb-3">
            <FiCheckCircle className="text-lg text-[#003527]" />
          </div>
          <p className="text-2xl font-bold text-[#003527] leading-none mb-1">
            {loading ? "—" : todayCols.length}
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Today&apos;s Collections</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <MdOutlineAccountBalance className="text-lg text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-[#003527] leading-none mb-1">
            {loading ? "—" : formatCurrency(totalThisMonth)}
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {MONTHS[today.getMonth()]} Total
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
            <FiUsers className="text-lg text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-[#003527] leading-none mb-1">
            {loading ? "—" : uniqueCustomers}
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Customers Served</p>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold text-[#003527]">Daily Progress</h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              progressPct >= 100
                ? "bg-emerald-100 text-emerald-700"
                : progressPct >= 50
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {loading ? "—" : `${progressPct}% of Daily Goal`}
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-[#003527] to-[#6cf8bb] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${loading ? 0 : progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">0 Collections</span>
          <span className="font-bold text-[#003527]">
            {loading ? "…" : todayCols.length} collected today
          </span>
          <span className="text-slate-400">{dailyGoal} Daily Goal</span>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Collections */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#003527]">Recent Collections</h2>
            <Link href="/collector/collections" className="text-xs text-[#006c49] font-semibold hover:underline">
              New entry →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
          ) : collections.length === 0 ? (
            <div className="py-12 text-center">
              <FiCheckCircle className="text-3xl text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No collections yet.</p>
              <Link href="/collector/collections" className="mt-2 inline-block text-xs text-[#006c49] font-semibold hover:underline">
                Start your first collection →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {collections.slice(0, 7).map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e8f5ef] flex items-center justify-center flex-shrink-0">
                      <FiUsers className="text-[#003527] text-xs" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {typeof c.customerId === "object" ? c.customerId.name : "—"}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <FiClock className="text-[10px]" />
                        {new Date(c.collectionDate).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#003527]">
                    ₹{c.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Monthly summary */}
          <div className="bg-[#003527] rounded-2xl p-5 shadow-lg shadow-[#003527]/20">
            <p className="text-[#6cf8bb] text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
              <FiTrendingUp className="text-sm" />
              {MONTHS[today.getMonth()]} Summary
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-xs mb-1">Collections</p>
                <p className="text-white text-3xl font-bold">
                  {loading ? "—" : thisMonthCols.length}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Amount</p>
                <p className="text-white text-3xl font-bold">
                  {loading ? "—" : formatCurrency(totalThisMonth)}
                </p>
              </div>
            </div>
          </div>

          {/* All-time summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs text-[#003527] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <MdOutlineAccountBalance />
              All-Time Summary
            </p>
            <div className="space-y-3">
              {[
                { label: "Total Collected", value: loading ? "—" : formatCurrency(totalAllTime) },
                { label: "Total Collections", value: loading ? "—" : collections.length },
                { label: "Unique Customers", value: loading ? "—" : uniqueCustomers },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">{label}</span>
                  <span className="text-lg font-bold text-[#003527]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verified collector */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5ef] flex items-center justify-center flex-shrink-0">
              <FiShield className="text-[#003527] text-lg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#003527]">Verified Collector</p>
              <p className="text-xs text-slate-400">AIC Fund Collection Network</p>
            </div>
            <span className="text-xl font-black text-emerald-600">✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}

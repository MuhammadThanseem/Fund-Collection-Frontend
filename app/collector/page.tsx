"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiPlus, FiMapPin, FiShield, FiTrendingUp,
  FiUsers, FiDollarSign, FiArrowRight, FiCheckCircle,
} from "react-icons/fi";
import { getCollections } from "@/services/collection.service";
import { getCustomers } from "@/services/customer.service";

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `₹${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function CollectorHubPage() {
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const dailyGoal = 20;

  useEffect(() => {
    Promise.all([getCollections(), getCustomers()])
      .then(([cols, custs]) => {
        const todayStr = new Date().toDateString();
        const todayCols = cols.filter(
          (c) => new Date(c.collectionDate).toDateString() === todayStr
        );
        setTotalCollected(todayCols.reduce((s, c) => s + c.amount, 0));
        setCollectionCount(todayCols.length);
        setTotalCustomers(custs.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const progressPct = Math.min(Math.round((collectionCount / dailyGoal) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">
            Collector Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your contributions and track real-time collection status.
          </p>
        </div>
        <Link
          href="/collector/collections"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003527] text-white text-sm font-bold rounded-xl hover:bg-[#064e3b] active:scale-[0.98] transition-all shadow-lg shadow-[#003527]/20 self-start"
        >
          <FiPlus className="text-base" />
          Start New Collection
        </Link>
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
            {loading ? "—" : `${progressPct}% Target Reached`}
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
            {loading ? "…" : collectionCount} collected today
          </span>
          <span className="text-slate-400">{dailyGoal} Goal</span>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Next Stop card */}
        <div className="lg:col-span-3 bg-[#003527] rounded-2xl overflow-hidden shadow-lg shadow-[#003527]/20 relative min-h-[280px]">
          {/* Topographic pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, #6cf8bb 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, #4edea3 0%, transparent 40%)`,
            }}
          />
          <div className="relative z-10 p-6 h-full flex flex-col justify-between">
            <div>
              <p className="text-[#6cf8bb] text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                <FiMapPin className="text-sm" />
                Next Stop
              </p>
              <h3 className="text-white text-2xl font-bold leading-tight">
                Central Collection Hub
              </h3>
              <p className="text-white/50 text-sm mt-1">
                Expected Arrival: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} Today
              </p>
            </div>

            {/* Map placeholder */}
            <div className="flex-1 my-5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center min-h-[100px]">
              <div className="text-center text-white/30">
                <FiMapPin className="text-3xl mx-auto mb-2" />
                <p className="text-xs">Live map tracking</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <FiArrowRight className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">In Transit</p>
                  <p className="text-white/50 text-xs">Package #8821-XP</p>
                </div>
              </div>
              <FiArrowRight className="text-white/40 text-lg" />
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex-1">
            <p className="text-xs text-[#003527] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <FiTrendingUp />
              Impact Summary
            </p>
            <div className="space-y-4">
              {[
                { label: "Total Customers", value: loading ? "—" : totalCustomers.toLocaleString(), icon: FiUsers },
                { label: "Today's Collections", value: loading ? "—" : collectionCount, icon: FiCheckCircle },
                { label: "Amount Collected Today", value: loading ? "—" : formatCurrency(totalCollected), icon: FiDollarSign },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Icon className="text-base text-slate-400" />
                    {label}
                  </div>
                  <span className="text-xl font-bold text-[#003527]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quote card */}
          <div className="bg-[#e8f5ef] rounded-2xl p-4">
            <p className="text-[#003527] text-sm italic leading-relaxed font-medium">
              &ldquo;Every collection brings us one step closer to changing lives through the
              AIC Fund Collection.&rdquo;
            </p>
          </div>

          {/* Transparency badge */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5ef] flex items-center justify-center flex-shrink-0">
              <FiShield className="text-[#003527] text-lg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#003527]">Transparency Grade</p>
              <p className="text-xs text-slate-400">Certified Tier 1 Giving Platform</p>
            </div>
            <span className="text-2xl font-black text-[#003527]">A+</span>
          </div>
        </div>
      </div>

      {/* Bottom stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Carbon Offset",  value: "1.2t",  sub: "CO₂e" },
          { label: "Network Trust",  value: "99.8%", sub: "Verified" },
          { label: "Rewards Earned", value: "450",   sub: "pts" },
          { label: "Active Peers",   value: loading ? "—" : String(Math.max(totalCustomers, 1)), sub: "Collectors" },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center"
          >
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">{label}</p>
            <p className="text-2xl font-bold text-[#003527] leading-none">
              {value}
              {sub === "CO₂e" && <span className="text-sm font-semibold text-slate-400 ml-1">CO₂e</span>}
            </p>
            {sub !== "CO₂e" && (
              <p className="text-xs text-slate-400 mt-1">{sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

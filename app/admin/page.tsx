"use client";

import { useEffect, useState } from "react";
import {
  FiDollarSign, FiUsers, FiTrendingUp, FiActivity,
  FiDownload, FiArrowUpRight,
} from "react-icons/fi";
import { getDashboardSummary, getBranchWiseCollection, getMonthlyCollection } from "@/services/report.service";
import { getBranches } from "@/services/branch.service";
import { getCollectors } from "@/services/collector.service";
import { getCustomers } from "@/services/customer.service";
import { getCollections } from "@/services/collection.service";
import type { Collection } from "@/services/collection.service";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState({ totalCollection: 0, thisMonthCollection: 0 });
  const [branchCount, setBranchCount] = useState(0);
  const [collectorCount, setCollectorCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ _id: number; total: number }[]>([]);
  const [branchData, setBranchData] = useState<{ _id: string; branchName: string; total: number }[]>([]);
  const [recentCollections, setRecentCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([
      getDashboardSummary(),
      getBranches(),
      getCollectors(),
      getCustomers(),
      getMonthlyCollection(year),
      getBranchWiseCollection(),
      getCollections(),
    ])
      .then(([sum, branches, collectors, customers, monthly, branchWise, collections]) => {
        setSummary(sum);
        setBranchCount(branches.length);
        setCollectorCount(collectors.length);
        setCustomerCount(customers.length);
        setMonthlyData(monthly);
        setBranchData(branchWise);
        setRecentCollections(collections.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const maxMonthly = Math.max(...monthlyData.map((d) => d.total), 1);

  const statCards = [
    {
      label: "Total Collected",
      value: formatCurrency(summary.totalCollection),
      sub: "All time",
      icon: FiDollarSign,
      iconBg: "bg-[#e8f5ef]",
      iconColor: "text-[#003527]",
      trend: null,
    },
    {
      label: "This Month",
      value: formatCurrency(summary.thisMonthCollection),
      sub: "Current month",
      icon: FiTrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      trend: null,
    },
    {
      label: "Active Branches",
      value: branchCount,
      sub: "Registered nodes",
      icon: FiActivity,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: null,
    },
    {
      label: "Collectors",
      value: collectorCount,
      sub: `${customerCount} customers`,
      icon: FiUsers,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: null,
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div>
            <h1 className="text-2xl font-bold text-[#003527]">AIC Fund Collection</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Orphan Care Fund — Real-time performance across all branches
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
          <FiDownload />
          Export
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon className={`text-lg ${iconColor}`} />
              </div>
              <FiArrowUpRight className="text-slate-300 text-lg" />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">{label}</p>
            <p className="text-2xl font-bold text-[#003527]">{loading ? "—" : value}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Monthly bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-[#003527]">Monthly Collections</h3>
              <p className="text-xs text-slate-400 mt-0.5">{new Date().getFullYear()} overview</p>
            </div>
          </div>
          {monthlyData.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              No data yet
            </div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {MONTHS.map((m, i) => {
                const entry = monthlyData.find((d) => d._id === i + 1);
                const pct = entry ? (entry.total / maxMonthly) * 100 : 0;
                return (
                  <div key={m} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative" style={{ height: "120px" }}>
                      <div
                        className="absolute bottom-0 w-full bg-[#003527] rounded-t-md transition-all duration-500 hover:bg-[#006c49]"
                        style={{ height: `${Math.max(pct, 2)}%`, opacity: pct ? 1 : 0.15 }}
                        title={entry ? formatCurrency(entry.total) : "0"}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">{m}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Branch performance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-[#003527] mb-1">Branch Performance</h3>
          <p className="text-xs text-slate-400 mb-5">Total collected per branch</p>
          {branchData.length === 0 && !loading ? (
            <div className="text-slate-400 text-sm text-center py-6">No data yet</div>
          ) : (
            <div className="space-y-4">
              {branchData.slice(0, 5).map((b) => {
                const maxB = Math.max(...branchData.map((x) => x.total), 1);
                const pct = Math.round((b.total / maxB) * 100);
                return (
                  <div key={b._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 font-medium truncate max-w-[140px]">{b.branchName}</span>
                      <span className="text-slate-500 text-xs">{formatCurrency(b.total)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#003527] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent collections table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-[#003527]">Recent Collections</h3>
          <a href="/admin/collections" className="text-xs text-[#006c49] font-semibold hover:underline">
            View all
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">Customer</th>
                <th className="text-left px-6 py-3">Collector</th>
                <th className="text-left px-6 py-3">Branch</th>
                <th className="text-left px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-8">Loading…</td>
                </tr>
              ) : recentCollections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-8">No collections yet</td>
                </tr>
              ) : (
                recentCollections.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {typeof c.customerId === "object" ? c.customerId.name : "—"}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {typeof c.collectorId === "object" ? c.collectorId.name : "—"}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {typeof c.branchId === "object" ? c.branchId.name : "—"}
                    </td>
                    <td className="px-6 py-3 font-semibold text-[#003527]">
                      ${c.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {new Date(c.collectionDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

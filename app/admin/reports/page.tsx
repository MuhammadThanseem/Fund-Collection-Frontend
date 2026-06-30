"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  getDashboardSummary, getMonthlyCollection, getBranchWiseCollection,
  getCollectorWiseCollection, type MonthlyData, type BranchWiseData, type CollectorWiseData,
} from "@/services/report.service";
import { FiTrendingUp, FiBarChart2, FiPieChart } from "react-icons/fi";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PIE_COLORS = ["#003527","#006c49","#4edea3","#6cf8bb","#b0f0d6","#064e3b"];

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

export default function ReportsPage() {
  const year = new Date().getFullYear();
  const [summary, setSummary] = useState({ totalCollection: 0, thisMonthCollection: 0 });
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [branchWise, setBranchWise] = useState<BranchWiseData[]>([]);
  const [collectorWise, setCollectorWise] = useState<CollectorWiseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardSummary(),
      getMonthlyCollection(year),
      getBranchWiseCollection(),
      getCollectorWiseCollection(),
    ])
      .then(([sum, m, b, c]) => {
        setSummary(sum);
        setMonthly(m);
        setBranchWise(b);
        setCollectorWise(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthlyChartData = MONTHS.map((name, i) => {
    const entry = monthly.find((d) => d._id === i + 1);
    return { name, total: entry?.total || 0 };
  });

  const branchChartData = branchWise.map((b) => ({
    name: b.branchName,
    total: b.total,
  }));

  const collectorChartData = collectorWise
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((c) => ({ name: c.collectorName, total: c.total }));

  const statCards = [
    { label: "Total Collected", value: formatCurrency(summary.totalCollection), icon: FiTrendingUp },
    { label: "This Month", value: formatCurrency(summary.thisMonthCollection), icon: FiBarChart2 },
    { label: "Active Branches", value: branchWise.length, icon: FiPieChart },
    { label: "Top Collectors", value: collectorWise.length, icon: FiBarChart2 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#003527]">Reports & Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Comprehensive insights into fund collection performance.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#e8f5ef] flex items-center justify-center mb-3">
              <Icon className="text-[#003527] text-base" />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">{label}</p>
            <p className="text-2xl font-bold text-[#003527]">{loading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
        <div className="mb-5">
          <h3 className="text-base font-bold text-[#003527]">Monthly Collections — {year}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Collection amounts by month</p>
        </div>
        {loading ? (
          <div className="h-56 flex items-center justify-center text-slate-400">Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [formatCurrency(Number(v)), "Collected"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
              <Bar dataKey="total" fill="#003527" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Branch + Collector charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Branch pie */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-[#003527] mb-1">Collection by Branch</h3>
          <p className="text-xs text-slate-400 mb-4">Distribution across branches</p>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-400">Loading…</div>
          ) : branchChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={branchChartData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {branchChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Collector bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-[#003527] mb-1">Top Collectors</h3>
          <p className="text-xs text-slate-400 mb-4">Highest performing collectors</p>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-400">Loading…</div>
          ) : collectorChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={collectorChartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v) => [formatCurrency(Number(v)), "Collected"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Bar dataKey="total" fill="#006c49" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Branch table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-[#003527]">Branch-wise Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">Branch</th>
                <th className="text-left px-6 py-3">Total Collected</th>
                <th className="text-left px-6 py-3">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={3} className="text-center text-slate-400 py-10">Loading…</td></tr>
              ) : branchWise.length === 0 ? (
                <tr><td colSpan={3} className="text-center text-slate-400 py-10">No data yet</td></tr>
              ) : (() => {
                const total = branchWise.reduce((s, b) => s + b.total, 0);
                return branchWise
                  .sort((a, b) => b.total - a.total)
                  .map((b, i) => (
                    <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">{b.branchName}</td>
                      <td className="px-6 py-3 font-bold text-[#003527]">{formatCurrency(b.total)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                            <div
                              className="h-full bg-[#003527] rounded-full"
                              style={{ width: `${total ? (b.total / total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {total ? ((b.total / total) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

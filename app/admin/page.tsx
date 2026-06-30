"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiMapPin, FiUsers, FiChevronRight, FiTrendingUp,
  FiArrowUpRight, FiShield, FiDownload, FiActivity,
} from "react-icons/fi";
import { MdOutlineAccountBalance } from "react-icons/md";
import { getDashboardSummary, getBranchWiseCollection, getCollectorWiseCollection } from "@/services/report.service";
import { getBranches } from "@/services/branch.service";
import { getCollectors } from "@/services/collector.service";
import { getCustomers } from "@/services/customer.service";

type BranchPerf = { _id: string; branchName: string; total: number };
type CollectorPerf = { _id: string; collectorName: string; total: number };

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `₹${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}

const AVATAR_COLORS = [
  "bg-emerald-600", "bg-teal-600", "bg-cyan-600",
  "bg-green-600", "bg-lime-600", "bg-indigo-600",
];

function AvatarStack({ count, size = "sm" }: { count: number; size?: "sm" | "md" }) {
  const dim = size === "md" ? "w-8 h-8 text-xs" : "w-6 h-6 text-[10px]";
  const shown = Math.min(count, 3);
  const extra = count - shown;
  return (
    <div className="flex items-center">
      {Array.from({ length: shown }).map((_, i) => (
        <div
          key={i}
          className={`${dim} rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} border-2 border-white text-white font-bold flex items-center justify-center -ml-${i === 0 ? "0" : "2"}`}
          style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: shown - i }}
        >
          {String.fromCharCode(65 + i)}
        </div>
      ))}
      {extra > 0 && (
        <div
          className={`${dim} rounded-full bg-slate-100 border-2 border-white text-slate-500 font-semibold flex items-center justify-center`}
          style={{ marginLeft: "-8px" }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState({ totalCollection: 0, thisMonthCollection: 0 });
  const [branchCount, setBranchCount] = useState(0);
  const [collectorCount, setCollectorCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [branchData, setBranchData] = useState<BranchPerf[]>([]);
  const [topCollectors, setTopCollectors] = useState<CollectorPerf[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthPct, setMonthPct] = useState(0);
  const [regionFilter, setRegionFilter] = useState<string>("ALL");

  useEffect(() => {
    Promise.all([
      getDashboardSummary(),
      getBranches(),
      getCollectors(),
      getCustomers(),
      getBranchWiseCollection(),
      getCollectorWiseCollection(),
    ])
      .then(([sum, branches, collectors, customers, branchWise, collWise]) => {
        setSummary(sum);
        setBranchCount(branches.length);
        setCollectorCount(collectors.length);
        setCustomerCount(customers.length);
        setBranchData(branchWise);
        setTopCollectors(collWise.sort((a, b) => b.total - a.total).slice(0, 4));
        if (sum.totalCollection > 0) {
          setMonthPct(Math.round((sum.thisMonthCollection / sum.totalCollection) * 100));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredBranchData =
    regionFilter === "ALL"
      ? branchData
      : branchData.filter((b) => b._id === regionFilter);

  const maxBranch = Math.max(...filteredBranchData.map((b) => b.total), 1);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">
            Organization Structure
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-md">
            Manage your branches and regional collectors with high-fidelity transparency.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/admin/areas"
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FiMapPin className="text-sm text-[#003527]" />
            <span className="hidden sm:inline">Create</span> Branch
          </Link>
          <Link
            href="/admin/collectors"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] active:scale-[0.98] transition-all shadow-md shadow-[#003527]/20"
          >
            <FiUsers className="text-sm" />
            <span className="hidden sm:inline">Add</span> Collector
          </Link>
        </div>
      </div>

      {/* Hero stats card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Total Contributions */}
          <div className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5ef] flex items-center justify-center flex-shrink-0">
              <MdOutlineAccountBalance className="text-[#003527] text-2xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                Total Contributions
              </p>
              <p className="text-3xl font-bold text-[#003527] leading-none mb-1">
                {loading ? "—" : formatCurrency(summary.totalCollection)}
              </p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                <FiTrendingUp className="text-sm" />
                {monthPct}% from this month
              </div>
            </div>
          </div>

          {/* Active Branches */}
          <div className="p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                Active Branches
              </p>
              <p className="text-3xl font-bold text-[#003527] leading-none mb-2">
                {loading ? "—" : branchCount}
              </p>
              <AvatarStack count={branchCount} />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FiMapPin className="text-blue-600 text-xl" />
            </div>
          </div>

          {/* Lead Collectors */}
          <div className="p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                Lead Collectors
              </p>
              <p className="text-3xl font-bold text-[#003527] leading-none mb-2">
                {loading ? "—" : collectorCount}
              </p>
              <AvatarStack count={collectorCount} />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <FiUsers className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Branch Performance */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#003527]">Branch Performance</h2>
            {regionFilter !== "ALL" && (
              <span className="px-2 py-0.5 bg-[#e8f5ef] text-[#003527] text-xs font-semibold rounded-full">
                1 branch
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <FiActivity className="text-slate-400 text-sm flex-shrink-0" />
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003527]/20 font-medium"
            >
              <option value="ALL">All Regions</option>
              {branchData.map((b) => (
                <option key={b._id} value={b._id}>{b.branchName}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
            Loading…
          </div>
        ) : branchData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FiMapPin className="text-3xl mb-2 opacity-40" />
            <p className="text-sm">No branch data yet.</p>
            <Link href="/admin/areas" className="mt-3 text-xs text-[#006c49] font-semibold hover:underline">
              Create your first branch →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredBranchData.map((b, i) => {
              const pct = Math.round((b.total / maxBranch) * 100);
              const collectorsInBranch = Math.max(1, Math.floor(collectorCount / Math.max(branchData.length, 1)));
              return (
                <div
                  key={b._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Branch icon + name */}
                  <div className="flex items-center gap-4 sm:w-44 flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-[#e8f5ef] flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="text-[#003527] text-base" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#003527] text-sm leading-tight">{b.branchName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Branch Node {i + 1}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Impact Goal Tracking
                      </span>
                      <span className="text-xs font-bold text-[#006c49]">{pct}% Achieved</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#003527] to-[#006c49] rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-6 mt-2">
                      <div>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wide">Collected</p>
                        <p className="text-sm font-bold text-[#003527]">{formatCurrency(b.total)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wide">Network Share</p>
                        <p className="text-sm font-semibold text-slate-600">
                          {maxBranch > 0 ? ((b.total / branchData.reduce((s, x) => s + x.total, 0)) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <AvatarStack count={collectorsInBranch + i} size="md" />
                    <Link
                      href="/admin/areas"
                      className="p-2 text-slate-300 group-hover:text-[#003527] hover:bg-[#e8f5ef] rounded-lg transition-all"
                    >
                      <FiChevronRight className="text-lg" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom row: Top Collectors + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Collectors */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#003527]">Top Performing Collectors</h2>
            <Link href="/admin/collectors" className="text-xs text-[#006c49] font-semibold hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-400 text-sm">Loading…</div>
          ) : topCollectors.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No collector data yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 divide-slate-50">
              {topCollectors.slice(0, 4).map((c, i) => (
                <div
                  key={c._id}
                  className={`flex items-center gap-3 p-5 ${i % 2 === 0 && topCollectors.length > 2 ? "sm:border-r sm:border-slate-50" : ""}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white font-bold text-sm flex items-center justify-center flex-shrink-0`}
                  >
                    {c.collectorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{c.collectorName}</p>
                    <p className="text-xs text-slate-400">Lead Collector</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#003527]">{formatCurrency(c.total)}</p>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">This Period</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          {/* Quarterly report card */}
          <div className="bg-[#003527] rounded-2xl p-5 shadow-lg shadow-[#003527]/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <FiShield className="text-[#6cf8bb] text-lg" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Quarterly Report Ready</p>
                <p className="text-white/60 text-xs mt-0.5 leading-relaxed">
                  The structural audit for Q{Math.ceil((new Date().getMonth() + 1) / 3)} is
                  complete and ready for review.
                </p>
              </div>
            </div>
            <Link
              href="/admin/reports"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#6cf8bb] text-[#003527] rounded-xl text-sm font-bold hover:bg-[#4edea3] active:scale-[0.98] transition-all"
            >
              <FiDownload className="text-sm" />
              Download PDF
            </Link>
          </div>

          {/* New insight card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#e8f5ef] flex items-center justify-center flex-shrink-0">
                <FiArrowUpRight className="text-[#003527] text-lg" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#003527] text-sm">New Insight Available</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                  Configure your organization&apos;s custom performance metrics.
                </p>
                <button className="mt-3 text-xs text-[#006c49] font-bold hover:underline flex items-center gap-1">
                  View Insights <FiChevronRight className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                  Customers
                </p>
                <p className="text-2xl font-bold text-[#003527]">
                  {loading ? "—" : customerCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                  This Month
                </p>
                <p className="text-2xl font-bold text-[#003527]">
                  {loading ? "—" : formatCurrency(summary.thisMonthCollection)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

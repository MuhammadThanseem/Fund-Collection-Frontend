"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiSearch, FiFilter, FiChevronRight, FiClock,
  FiCheckCircle, FiAlertCircle, FiHome, FiMapPin,
} from "react-icons/fi";
import { MdOutlineHouse, MdOutlineApartment, MdOutlineVilla } from "react-icons/md";
import { getCustomers, type Customer } from "@/services/customer.service";
import { getCollections } from "@/services/collection.service";

const ICONS = [MdOutlineHouse, MdOutlineApartment, MdOutlineVilla, FiHome];

type CustomerStatus = "COLLECTED" | "PENDING" | "OVERDUE";

const STATUS_CONFIG: Record<CustomerStatus, { bg: string; text: string; label: string }> = {
  COLLECTED: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Collected" },
  PENDING:   { bg: "bg-amber-100",   text: "text-amber-700",   label: "Pending" },
  OVERDUE:   { bg: "bg-red-100",     text: "text-red-600",     label: "Overdue" },
};

function StatusBadge({ status }: { status: CustomerStatus }) {
  const { bg, text, label } = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${bg} ${text}`}
    >
      {status === "COLLECTED" && <FiCheckCircle className="text-xs" />}
      {status === "OVERDUE"   && <FiAlertCircle className="text-xs" />}
      {status === "PENDING"   && <FiClock className="text-xs" />}
      {label}
    </span>
  );
}

function getStatus(customer: Customer, collectedIds: Set<string>): CustomerStatus {
  if (collectedIds.has(customer._id)) return "COLLECTED";
  const daysOld = Math.floor(
    (Date.now() - new Date(customer.createdAt).getTime()) / 86_400_000
  );
  return daysOld > 30 ? "OVERDUE" : "PENDING";
}

export default function CollectorCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | CustomerStatus>("ALL");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    Promise.all([getCustomers(), getCollections()])
      .then(([custs, cols]) => {
        setCustomers(custs);
        const thisMonth = new Date().getMonth() + 1;
        const thisYear  = new Date().getFullYear();
        const ids = new Set(
          cols
            .filter((c) => c.month === thisMonth && c.year === thisYear)
            .map((c) =>
              typeof c.customerId === "object" ? c.customerId._id : (c.customerId as string)
            )
        );
        setCollectedIds(ids);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const withStatus = customers.map((c) => ({ ...c, status: getStatus(c, collectedIds) }));

  const filtered = withStatus.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.boxNumber.toLowerCase().includes(q) ||
      (c.address || "").toLowerCase().includes(q);
    const matchFilter = filterStatus === "ALL" || c.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total:     customers.length,
    collected: withStatus.filter((c) => c.status === "COLLECTED").length,
    pending:   withStatus.filter((c) => c.status === "PENDING").length,
    overdue:   withStatus.filter((c) => c.status === "OVERDUE").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs text-[#006c49] font-bold uppercase tracking-widest mb-1">
            Collector Dashboard
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">
            Household Collections
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-md">
            Manage and monitor donation boxes across your assigned district. Filter by status
            or zone to optimize your route.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <FiFilter className="text-slate-400 text-sm" />
            Filter View
          </button>
          <Link
            href="/collector/collections"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#003527] text-white text-sm font-bold rounded-xl hover:bg-[#064e3b] active:scale-[0.98] transition-all shadow-lg shadow-[#003527]/20"
          >
            Assign New Zone
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Assigned", value: stats.total,     border: "border-slate-100",   numColor: "text-[#003527]",    bar: "bg-slate-200" },
          { label: "Collected",      value: stats.collected, border: "border-emerald-100", numColor: "text-emerald-600",  bar: "bg-emerald-200" },
          { label: "Pending",        value: stats.pending,   border: "border-amber-100",   numColor: "text-amber-600",    bar: "bg-amber-200" },
          { label: "Overdue",        value: stats.overdue,   border: "border-red-100",     numColor: "text-red-600",      bar: "bg-red-200" },
        ].map(({ label, value, border, numColor, bar }) => (
          <div key={label} className={`bg-white rounded-2xl p-5 border ${border} shadow-sm`}>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">
              {label}
            </p>
            <p className={`text-3xl font-bold ${numColor}`}>{loading ? "—" : value}</p>
            <div className={`mt-3 h-1 rounded-full ${bar}`} />
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#003527] flex-1">
            {filtered.length} Household{filtered.length !== 1 ? "s" : ""}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {(["ALL", "COLLECTED", "PENDING", "OVERDUE"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === s
                    ? "bg-[#003527] text-white"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003527]/20 placeholder-slate-400 w-36"
              />
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Household / ID", "Location", "Status", "Last Activity", "History"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-[11px] text-slate-400 font-semibold uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-14">
                    Loading…
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14">
                    <FiHome className="text-3xl text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">
                      {search || filterStatus !== "ALL"
                        ? "No households match your filter."
                        : "No customers assigned yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((c, i) => {
                  const HIcon     = ICONS[i % ICONS.length];
                  const iconBg    = c.status === "OVERDUE"   ? "bg-red-50"     : c.status === "COLLECTED" ? "bg-emerald-50" : "bg-slate-50";
                  const iconColor = c.status === "OVERDUE"   ? "text-red-500"  : c.status === "COLLECTED" ? "text-emerald-600" : "text-slate-400";
                  const histNum   = ((i + 1) * 3 + 5) % 25 + 1;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                            <HIcon className={`text-lg ${iconColor}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{c.name}</p>
                            <p className="text-xs text-[#006c49] font-mono font-semibold">{c.boxNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-1.5">
                          <FiMapPin className="text-slate-300 text-base mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-600 leading-tight">{c.address || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {c.status === "COLLECTED"
                          ? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : c.status === "OVERDUE"
                          ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "Scheduled"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-[#003527] text-white text-[10px] font-bold flex items-center justify-center">
                            {String(histNum).padStart(2, "0")}
                          </div>
                          <FiClock className="text-slate-300 text-sm" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-[#003527] hover:bg-[#e8f5ef] transition-all">
                          <FiChevronRight className="text-lg" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden divide-y divide-slate-50">
          {loading ? (
            <div className="text-center text-slate-400 py-14 text-sm">Loading…</div>
          ) : paginated.length === 0 ? (
            <div className="text-center text-slate-400 py-14 text-sm">No households found.</div>
          ) : (
            paginated.map((c, i) => {
              const HIcon = ICONS[i % ICONS.length];
              return (
                <div key={c._id} className="px-4 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <HIcon className="text-xl text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 truncate">{c.address || c.boxNumber}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-slate-400">
              Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–
              {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} households
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 rounded-lg text-sm text-slate-400 hover:text-[#003527] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span key={`ellipsis-${p}`} className="px-1 text-slate-300 text-sm">…</span>
                    )}
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                        p === page
                          ? "bg-[#003527] text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  </>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 rounded-lg text-sm text-slate-400 hover:text-[#003527] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Optimization + Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#003527] rounded-2xl p-6 shadow-lg shadow-[#003527]/20 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 20%, #6cf8bb 0%, transparent 50%)",
            }}
          />
          <div className="relative z-10">
            <h3 className="text-white font-bold text-base mb-2">Optimization Report Ready</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Our AI has analyzed the overdue boxes. We recommend a revised collection route
              for Zone 1 to save 14% on fuel costs.
            </p>
            <button className="px-5 py-2.5 bg-white text-[#003527] rounded-xl text-sm font-bold hover:bg-[#e8f5ef] active:scale-[0.98] transition-all">
              View Optimal Route
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#e8f5ef] flex items-center justify-center">
              <FiMapPin className="text-[#003527] text-lg" />
            </div>
            <div>
              <p className="font-bold text-[#003527] text-sm">Live Map</p>
              <p className="text-xs text-slate-400">
                Track {Math.max(1, Math.floor(customers.length / 10))} active collectors in the field.
              </p>
            </div>
          </div>
          <div className="h-32 bg-gradient-to-br from-[#e8f5ef] to-[#f0fdf4] rounded-xl flex items-center justify-center border border-[#d1fae5]">
            <div className="text-center">
              <FiMapPin className="text-2xl text-[#006c49] mx-auto mb-1" />
              <p className="text-xs text-[#006c49] font-semibold">Live tracking active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

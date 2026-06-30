"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiFilter, FiArrowUp, FiArrowDown } from "react-icons/fi";
import {
  getCollections, createCollection, updateCollection, deleteCollection,
  type Collection, type CreateCollectionPayload,
} from "@/services/collection.service";
import { getBranches, type Branch } from "@/services/branch.service";
import { getCustomers, type Customer } from "@/services/customer.service";
import { getCollectors, type Collector } from "@/services/collector.service";

function Modal({ open, title, onClose, children }: {
  open: boolean; title: string; onClose: () => void; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-[#003527]">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors">
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date-desc",   label: "Date: Newest first" },
  { value: "date-asc",    label: "Date: Oldest first" },
  { value: "amount-desc", label: "Amount: High → Low" },
  { value: "amount-asc",  label: "Amount: Low → High" },
];

const activeFiltersCount = (branch: string, month: string, year: string) =>
  [branch !== "ALL", month !== "ALL", year !== "ALL"].filter(Boolean).length;

export default function CollectionsPage() {
  const today = new Date();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [branches,    setBranches]    = useState<Branch[]>([]);
  const [customers,   setCustomers]   = useState<Customer[]>([]);
  const [collectors,  setCollectors]  = useState<Collector[]>([]);
  const [loading,     setLoading]     = useState(true);

  // Filters & sort
  const [search,       setSearch]       = useState("");
  const [filterBranch, setFilterBranch] = useState("ALL");
  const [filterMonth,  setFilterMonth]  = useState("ALL");
  const [filterYear,   setFilterYear]   = useState("ALL");
  const [sortKey,      setSortKey]      = useState<SortKey>("date-desc");
  const [showFilters,  setShowFilters]  = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<Collection | null>(null);
  const [form, setForm] = useState<CreateCollectionPayload>({
    customerId: "", collectorId: "", branchId: "",
    amount: 0, month: today.getMonth() + 1, year: today.getFullYear(), notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getCollections(), getBranches(), getCustomers(), getCollectors()])
      .then(([col, br, cu, co]) => {
        setCollections(col);
        setBranches(br);
        setCustomers(cu);
        setCollectors(co);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ customerId: "", collectorId: "", branchId: "", amount: 0,
              month: today.getMonth() + 1, year: today.getFullYear(), notes: "" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c: Collection) => {
    setEditing(c);
    setForm({
      customerId:  typeof c.customerId  === "object" ? c.customerId._id  : (c.customerId  as string),
      collectorId: typeof c.collectorId === "object" ? c.collectorId._id : (c.collectorId as string),
      branchId:    typeof c.branchId    === "object" ? c.branchId._id    : (c.branchId    as string),
      amount: c.amount, month: c.month, year: c.year, notes: c.notes || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.collectorId || !form.branchId || !form.amount) {
      setError("Customer, collector, branch and amount are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      editing ? await updateCollection(editing._id, form) : await createCollection(form);
      setModalOpen(false);
      fetchAll();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    try { await deleteCollection(id); fetchAll(); }
    catch (err: any) { alert(err?.message || "Delete failed"); }
  };

  const clearFilters = () => {
    setSearch(""); setFilterBranch("ALL"); setFilterMonth("ALL"); setFilterYear("ALL");
    setSortKey("date-desc");
  };

  // Available years from data
  const years = Array.from(new Set(collections.map((c) => c.year))).sort((a, b) => b - a);

  // Filter + sort
  const filtered = collections
    .filter((c) => {
      const customerName = typeof c.customerId  === "object" ? c.customerId.name  : "";
      const collectorName = typeof c.collectorId === "object" ? c.collectorId.name : "";
      const branchId      = typeof c.branchId    === "object" ? c.branchId._id    : (c.branchId as string);
      const q = search.toLowerCase();
      const matchSearch  = !q || customerName.toLowerCase().includes(q) || collectorName.toLowerCase().includes(q);
      const matchBranch  = filterBranch === "ALL" || branchId === filterBranch;
      const matchMonth   = filterMonth  === "ALL" || c.month  === Number(filterMonth);
      const matchYear    = filterYear   === "ALL" || c.year   === Number(filterYear);
      return matchSearch && matchBranch && matchMonth && matchYear;
    })
    .sort((a, b) => {
      if (sortKey === "date-desc")   return new Date(b.collectionDate).getTime() - new Date(a.collectionDate).getTime();
      if (sortKey === "date-asc")    return new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime();
      if (sortKey === "amount-desc") return b.amount - a.amount;
      return a.amount - b.amount;
    });

  const totalAmount    = collections.reduce((s, c) => s + c.amount, 0);
  const filteredTotal  = filtered.reduce((s, c) => s + c.amount, 0);
  const isFiltered     = filtered.length !== collections.length;
  const numActive      = activeFiltersCount(filterBranch, filterMonth, filterYear) + (search ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">Collections</h1>
          <p className="text-slate-500 text-sm mt-1">Track all AIC Fund Collection transactions.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] active:scale-[0.98] transition-all shadow-md shadow-[#003527]/20 self-start"
        >
          <FiPlus /> Record Collection
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Records",   value: collections.length.toString(),                            dark: false },
          { label: "Total Collected", value: `₹${totalAmount.toLocaleString("en-IN")}`,                       dark: true  },
          { label: "Filtered Records",value: isFiltered ? filtered.length.toString() : "—",                  dark: false },
          { label: "Filtered Total",  value: isFiltered ? `₹${filteredTotal.toLocaleString("en-IN")}` : "—", dark: false },
        ].map(({ label, value, dark }) => (
          <div key={label} className={`rounded-2xl p-5 shadow-sm ${dark ? "bg-[#003527]" : "bg-white border border-slate-100"}`}>
            <p className={`text-xs uppercase tracking-widest font-semibold mb-2 ${dark ? "text-white/60" : "text-slate-400"}`}>{label}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${dark ? "text-white" : "text-[#003527]"}`}>{loading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* Filter / search bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search customer or collector…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#003527]/20 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                showFilters || numActive > 0
                  ? "bg-[#003527] text-white border-[#003527]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <FiFilter className="text-sm" />
              Filters
              {numActive > 0 && (
                <span className="ml-0.5 w-4 h-4 rounded-full bg-[#6cf8bb] text-[#003527] text-[10px] font-black flex items-center justify-center">
                  {numActive}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003527]/20 text-slate-600 font-medium"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {numActive > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-red-500 font-semibold px-2 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="px-5 py-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap gap-3">
            {/* Branch */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Branch</label>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003527]/20 text-slate-700"
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>

            {/* Month */}
            <div className="flex flex-col gap-1 min-w-[130px]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Month</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003527]/20 text-slate-700"
              >
                <option value="ALL">All Months</option>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>

            {/* Year */}
            <div className="flex flex-col gap-1 min-w-[110px]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003527]/20 text-slate-700"
              >
                <option value="ALL">All Years</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="px-6 py-2.5 bg-slate-50/40 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            {loading ? "Loading…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}${isFiltered ? ` (filtered from ${collections.length})` : ""}`}
          </p>
          {isFiltered && (
            <p className="text-xs text-[#006c49] font-semibold">
              Filtered total: ₹{filteredTotal.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">Customer</th>
                <th className="text-left px-6 py-3">Collector</th>
                <th className="text-left px-6 py-3">Branch</th>
                <th
                  className="text-left px-6 py-3 cursor-pointer hover:text-[#003527] transition-colors select-none"
                  onClick={() => setSortKey(sortKey === "amount-desc" ? "amount-asc" : "amount-desc")}
                >
                  <span className="inline-flex items-center gap-1">
                    Amount
                    {sortKey === "amount-desc" ? <FiArrowDown className="text-[#003527]" /> :
                     sortKey === "amount-asc"  ? <FiArrowUp   className="text-[#003527]" /> : null}
                  </span>
                </th>
                <th className="text-left px-6 py-3">Period</th>
                <th
                  className="text-left px-6 py-3 cursor-pointer hover:text-[#003527] transition-colors select-none"
                  onClick={() => setSortKey(sortKey === "date-desc" ? "date-asc" : "date-desc")}
                >
                  <span className="inline-flex items-center gap-1">
                    Date
                    {sortKey === "date-desc" ? <FiArrowDown className="text-[#003527]" /> :
                     sortKey === "date-asc"  ? <FiArrowUp   className="text-[#003527]" /> : null}
                  </span>
                </th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center text-slate-400 py-14">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14">
                    <p className="text-slate-400 text-sm">
                      {numActive > 0 ? "No collections match your filters." : "No collections yet."}
                    </p>
                    {numActive > 0 && (
                      <button onClick={clearFilters} className="mt-2 text-xs text-[#006c49] font-semibold hover:underline">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {typeof c.customerId === "object" ? c.customerId.name : "—"}
                      {typeof c.customerId === "object" && (
                        <p className="text-xs text-slate-400">{c.customerId.phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {typeof c.collectorId === "object" ? c.collectorId.name : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 bg-[#e8f5ef] text-[#003527] text-xs font-semibold rounded-lg">
                        {typeof c.branchId === "object" ? c.branchId.name : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-bold text-[#003527]">₹{c.amount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-3 text-slate-500">{MONTHS[c.month - 1]} {c.year}</td>
                    <td className="px-6 py-3 text-slate-400 text-xs">
                      {new Date(c.collectionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-[#003527] hover:bg-slate-100 rounded-lg">
                          <FiEdit2 className="text-sm" />
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} title={editing ? "Edit Collection" : "Record Collection"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: "Customer",  state: form.customerId,  key: "customerId",  items: customers,  getName: (c: Customer)  => `${c.name} (${c.boxNumber})` },
            { label: "Collector", state: form.collectorId, key: "collectorId", items: collectors, getName: (c: Collector) => c.name },
            { label: "Branch",    state: form.branchId,    key: "branchId",    items: branches,   getName: (b: Branch)    => b.name },
          ].map(({ label, state, key, items, getName }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
              <select
                value={state}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 bg-white"
              >
                <option value="">Select {label.toLowerCase()}</option>
                {(items as any[]).map((item) => (
                  <option key={item._id} value={item._id}>{getName(item)}</option>
                ))}
              </select>
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Amount ($)</label>
            <input
              type="number" placeholder="0" value={form.amount || ""}
              onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Month</label>
              <select value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 bg-white">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Year</label>
              <input type="number" value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea rows={2} placeholder="Optional notes" value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 placeholder-slate-400 resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] disabled:opacity-60 transition-colors">
              {saving ? "Saving…" : editing ? "Update" : "Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

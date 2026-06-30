"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiUser, FiFilter, FiArrowDown, FiArrowUp } from "react-icons/fi";
import {
  getCollectors, createCollector, updateCollector, deleteCollector,
  type Collector, type CreateCollectorPayload,
} from "@/services/collector.service";
import { getBranches, type Branch } from "@/services/branch.service";

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-base font-bold text-[#003527]">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const PERF_COLORS: Record<string, string> = {
  GOOD: "bg-green-100 text-green-700",
  AVERAGE: "bg-yellow-100 text-yellow-700",
  LOW: "bg-red-100 text-red-700",
};

export default function CollectorsPage() {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,        setSearch]        = useState("");
  const [filterBranch,  setFilterBranch]  = useState("ALL");
  const [filterPerf,    setFilterPerf]    = useState("ALL");
  const [filterStatus,  setFilterStatus]  = useState("ALL");
  const [sortKey,       setSortKey]       = useState<"name" | "collected-desc" | "collected-asc" | "customers">("collected-desc");
  const [showFilters,   setShowFilters]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collector | null>(null);
  const [form, setForm] = useState<CreateCollectorPayload & { isActive?: boolean; performance?: string }>({
    name: "", phone: "", password: "", branchId: "", assignedArea: "", targetAmount: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getCollectors(), getBranches()])
      .then(([c, b]) => { setCollectors(c); setBranches(b); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", phone: "", password: "", branchId: "", assignedArea: "", targetAmount: 0 });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c: Collector) => {
    setEditing(c);
    setForm({
      name: c.name,
      phone: c.phone,
      password: "",
      branchId: typeof c.branchId === "object" ? c.branchId._id : (c.branchId as string),
      assignedArea: c.assignedArea || "",
      targetAmount: c.targetAmount,
      isActive: c.isActive,
      performance: c.performance,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.branchId) {
      setError("Name, phone and branch are required.");
      return;
    }
    if (!editing && !form.password) {
      setError("Password is required for new collectors.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload: any = { ...form };
      if (!payload.password) delete payload.password;
      if (editing) {
        await updateCollector(editing._id, payload);
      } else {
        await createCollector(payload);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collector?")) return;
    try {
      await deleteCollector(id);
      fetchAll();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  };

  const clearFilters = () => {
    setSearch(""); setFilterBranch("ALL"); setFilterPerf("ALL"); setFilterStatus("ALL");
    setSortKey("collected-desc");
  };

  const numActive = [filterBranch !== "ALL", filterPerf !== "ALL", filterStatus !== "ALL", !!search].filter(Boolean).length;

  const filtered = collectors
    .filter((c) => {
      const branchId = typeof c.branchId === "object" ? c.branchId._id : (c.branchId as string);
      const q = search.toLowerCase();
      const matchSearch  = !q || c.name.toLowerCase().includes(q) || c.phone.includes(search);
      const matchBranch  = filterBranch === "ALL" || branchId === filterBranch;
      const matchPerf    = filterPerf   === "ALL" || c.performance === filterPerf;
      const matchStatus  = filterStatus === "ALL"
        || (filterStatus === "ACTIVE"   &&  c.isActive)
        || (filterStatus === "INACTIVE" && !c.isActive);
      return matchSearch && matchBranch && matchPerf && matchStatus;
    })
    .sort((a, b) => {
      if (sortKey === "name")           return a.name.localeCompare(b.name);
      if (sortKey === "collected-asc")  return a.collectedAmount - b.collectedAmount;
      if (sortKey === "customers")      return b.totalCustomers - a.totalCustomers;
      return b.collectedAmount - a.collectedAmount; // collected-desc default
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">Collectors</h1>
          <p className="text-slate-500 text-sm mt-1">Manage AIC Fund collectors across all branches.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] active:scale-[0.98] transition-all shadow-md shadow-[#003527]/20 self-start"
        >
          <FiPlus /> Add Collector
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Collectors", value: collectors.length,                                   dark: false },
          { label: "Active",           value: collectors.filter((c) => c.isActive).length,         dark: false, color: "text-emerald-600" },
          { label: "Inactive",         value: collectors.filter((c) => !c.isActive).length,        dark: false, color: "text-slate-400" },
          { label: "Total Collected",  value: `₹${collectors.reduce((s,c)=>s+c.collectedAmount,0).toLocaleString("en-IN")}`, dark: true },
        ].map(({ label, value, dark, color }) => (
          <div key={label} className={`rounded-2xl p-5 shadow-sm ${dark ? "bg-[#003527]" : "bg-white border border-slate-100"}`}>
            <p className={`text-xs uppercase tracking-widest font-semibold mb-2 ${dark ? "text-white/60" : "text-slate-400"}`}>{label}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${dark ? "text-white" : (color || "text-[#003527]")}`}>
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Table with filter bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Search + filter controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#003527]/20 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003527]/20 text-slate-600 font-medium"
            >
              <option value="collected-desc">Amount: High → Low</option>
              <option value="collected-asc">Amount: Low → High</option>
              <option value="customers">Most Customers</option>
              <option value="name">Name A–Z</option>
            </select>
            {numActive > 0 && (
              <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-red-500 font-semibold px-2 py-2 rounded-lg hover:bg-red-50 transition-colors">
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="px-5 py-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap gap-3">
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Branch</label>
              <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003527]/20 text-slate-700">
                <option value="ALL">All Branches</option>
                {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Performance</label>
              <select value={filterPerf} onChange={(e) => setFilterPerf(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003527]/20 text-slate-700">
                <option value="ALL">All Levels</option>
                <option value="GOOD">Good</option>
                <option value="AVERAGE">Average</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[130px]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003527]/20 text-slate-700">
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {/* Result count */}
        <div className="px-6 py-2.5 bg-slate-50/40 border-b border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            {loading ? "Loading…" : `${filtered.length} collector${filtered.length !== 1 ? "s" : ""}${filtered.length !== collectors.length ? ` (filtered from ${collectors.length})` : ""}`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3 cursor-pointer hover:text-[#003527] select-none"
                    onClick={() => setSortKey("name")}>
                  <span className="inline-flex items-center gap-1">
                    Collector {sortKey === "name" && <FiArrowUp className="text-[#003527]" />}
                  </span>
                </th>
                <th className="text-left px-6 py-3">Branch</th>
                <th className="text-left px-6 py-3">Area</th>
                <th className="text-left px-6 py-3 cursor-pointer hover:text-[#003527] select-none"
                    onClick={() => setSortKey(sortKey === "collected-desc" ? "collected-asc" : "collected-desc")}>
                  <span className="inline-flex items-center gap-1">
                    Collected
                    {sortKey === "collected-desc" ? <FiArrowDown className="text-[#003527]" /> :
                     sortKey === "collected-asc"  ? <FiArrowUp   className="text-[#003527]" /> : null}
                  </span>
                </th>
                <th className="text-left px-6 py-3 cursor-pointer hover:text-[#003527] select-none"
                    onClick={() => setSortKey("customers")}>
                  <span className="inline-flex items-center gap-1">
                    Customers {sortKey === "customers" && <FiArrowDown className="text-[#003527]" />}
                  </span>
                </th>
                <th className="text-left px-6 py-3">Performance</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center text-slate-400 py-12">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <p className="text-slate-400 text-sm">
                      {numActive > 0 ? "No collectors match your filters." : "No collectors yet."}
                    </p>
                    {numActive > 0 && (
                      <button onClick={clearFilters} className="mt-2 text-xs text-[#006c49] font-semibold hover:underline">Clear filters</button>
                    )}
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e8f5ef] flex items-center justify-center flex-shrink-0">
                        <FiUser className="text-[#003527] text-xs" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {typeof c.branchId === "object" ? c.branchId.name : "—"}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{c.assignedArea || "—"}</td>
                  <td className="px-6 py-3 font-semibold text-[#003527]">
                    ₹{c.collectedAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{c.totalCustomers}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PERF_COLORS[c.performance] || ""}`}>
                      {c.performance}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} title={editing ? "Edit Collector" : "Add Collector"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "John Doe" },
            { label: "Phone", key: "phone", type: "tel", placeholder: "10-digit phone" },
            { label: "Password", key: "password", type: "password", placeholder: editing ? "Leave blank to keep current" : "Password" },
            { label: "Assigned Area", key: "assignedArea", type: "text", placeholder: "e.g. Ward 12" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={(form as any)[key] || ""}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]/40 placeholder-slate-400"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Branch</label>
            <select
              value={form.branchId}
              onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 bg-white"
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Target Amount</label>
            <input
              type="number"
              placeholder="0"
              value={form.targetAmount || ""}
              onChange={(e) => setForm((f) => ({ ...f, targetAmount: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 placeholder-slate-400"
            />
          </div>

          {editing && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive ?? true}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-[#003527]"
              />
              <label htmlFor="isActive" className="text-sm text-slate-600 font-medium">Active</label>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Update" : "Add Collector"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

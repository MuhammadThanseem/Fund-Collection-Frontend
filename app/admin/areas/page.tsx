"use client";

import { useEffect, useState } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiMapPin, FiX, FiSearch,
  FiUsers, FiDollarSign, FiCalendar, FiGrid,
} from "react-icons/fi";
import {
  getBranches, createBranch, updateBranch, deleteBranch,
  type Branch,
} from "@/services/branch.service";
import { getCollectors, type Collector } from "@/services/collector.service";
import { getCustomers, type Customer } from "@/services/customer.service";
import { getBranchWiseCollection, type BranchWiseData } from "@/services/report.service";

function Modal({
  open, title, onClose, children,
}: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#003527]">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

interface BranchStats {
  collectors: number;
  customers: number;
  totalCollected: number;
}

export default function BranchesPage() {
  const [branches,   setBranches]   = useState<Branch[]>([]);
  const [statsMap,   setStatsMap]   = useState<Record<string, BranchStats>>({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Branch | null>(null);
  const [form,       setForm]       = useState({ name: "", location: "" });
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [viewMode,   setViewMode]   = useState<"grid" | "list">("grid");

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      getBranches(),
      getCollectors(),
      getCustomers(),
      getBranchWiseCollection(),
    ])
      .then(([branchList, collectors, customers, branchWise]) => {
        setBranches(branchList);

        const map: Record<string, BranchStats> = {};
        branchList.forEach((b) => {
          map[b._id] = { collectors: 0, customers: 0, totalCollected: 0 };
        });

        collectors.forEach((c: Collector) => {
          const bid = typeof c.branchId === "object" ? c.branchId._id : (c.branchId as string);
          if (map[bid]) map[bid].collectors += 1;
        });

        customers.forEach((c: Customer) => {
          const bid = typeof c.branchId === "object" ? (c.branchId as any)._id : (c.branchId as string);
          if (map[bid]) map[bid].customers += 1;
        });

        branchWise.forEach((bw: BranchWiseData) => {
          const bid = bw._id;
          if (map[bid]) map[bid].totalCollected = bw.total;
        });

        setStatsMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", location: "" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({ name: b.name, location: b.location });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) {
      setError("Branch name and location are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateBranch(editing._id, form);
      } else {
        await createBranch(form);
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
    if (!confirm("Delete this branch? This cannot be undone.")) return;
    try {
      await deleteBranch(id);
      fetchAll();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  };

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = Object.values(statsMap).reduce((s, v) => s + v.totalCollected, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">Branch Management</h1>
          <p className="text-slate-500 text-sm mt-1">Create, edit and monitor all AIC Fund Collection branches.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] active:scale-[0.98] transition-all shadow-md shadow-[#003527]/20 self-start"
        >
          <FiPlus /> Add Branch
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Branches",    value: branches.length,                                                          dark: true,  icon: FiMapPin },
          { label: "Total Collectors",  value: Object.values(statsMap).reduce((s, v) => s + v.collectors, 0),           dark: false, icon: FiUsers },
          { label: "Total Customers",   value: Object.values(statsMap).reduce((s, v) => s + v.customers, 0),            dark: false, icon: FiUsers },
          { label: "Total Collected",   value: `₹${totalCollected.toLocaleString("en-IN")}`,                            dark: false, icon: FiDollarSign },
        ].map(({ label, value, dark, icon: Icon }) => (
          <div key={label} className={`rounded-2xl p-5 shadow-sm ${dark ? "bg-[#003527]" : "bg-white border border-slate-100"}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${dark ? "bg-white/15" : "bg-[#e8f5ef]"}`}>
              <Icon className={`text-base ${dark ? "text-[#6cf8bb]" : "text-[#003527]"}`} />
            </div>
            <p className={`text-xs uppercase tracking-widest font-semibold mb-1 ${dark ? "text-white/60" : "text-slate-400"}`}>{label}</p>
            <p className={`text-2xl font-bold ${dark ? "text-white" : "text-[#003527]"}`}>
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Branch list / grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#003527]/20 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === "grid" ? "bg-white text-[#003527] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === "list" ? "bg-white text-[#003527] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Count row */}
        <div className="px-6 py-2.5 bg-slate-50/40 border-b border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            {loading ? "Loading…" : `${filtered.length} branch${filtered.length !== 1 ? "es" : ""}${filtered.length !== branches.length ? ` (filtered from ${branches.length})` : ""}`}
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-16">Loading branches…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiMapPin className="text-3xl text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">{search ? "No branches match your search." : "No branches yet. Add one!"}</p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid view */
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((b) => {
              const stats = statsMap[b._id] ?? { collectors: 0, customers: 0, totalCollected: 0 };
              return (
                <div key={b._id} className="group relative bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md rounded-2xl p-5 transition-all duration-200">
                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 text-slate-400 hover:text-[#003527] hover:bg-white rounded-lg transition-colors"
                      title="Edit branch"
                    >
                      <FiEdit2 className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete branch"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>

                  {/* Branch identity */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#003527] flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="text-[#6cf8bb] text-base" />
                    </div>
                    <div className="min-w-0 pr-12">
                      <p className="font-bold text-[#003527] text-sm leading-tight truncate">{b.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{b.location}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Collectors", value: stats.collectors },
                      { label: "Customers",  value: stats.customers },
                      { label: "Collected",  value: `₹${stats.totalCollected.toLocaleString("en-IN")}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white rounded-xl p-2.5 text-center border border-slate-100">
                        <p className="text-sm font-bold text-[#003527]">{value}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <FiCalendar className="text-xs" />
                    Created {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {b.createdBy && (
                      <span className="ml-auto text-[#003527] font-medium truncate">by {b.createdBy.name}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div className="divide-y divide-slate-100">
            {filtered.map((b) => {
              const stats = statsMap[b._id] ?? { collectors: 0, customers: 0, totalCollected: 0 };
              return (
                <div key={b._id} className="flex items-center px-6 py-4 hover:bg-slate-50 transition-colors group gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#003527] flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="text-[#6cf8bb] text-sm" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#003527] text-sm">{b.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{b.location}</p>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
                    <div className="text-center">
                      <p className="font-bold text-[#003527]">{stats.collectors}</p>
                      <p className="text-[10px] text-slate-400">Collectors</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-[#003527]">{stats.customers}</p>
                      <p className="text-[10px] text-slate-400">Customers</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-[#003527]">₹{stats.totalCollected.toLocaleString("en-IN")}</p>
                      <p className="text-[10px] text-slate-400">Collected</p>
                    </div>
                  </div>

                  <div className="hidden md:block text-xs text-slate-400 ml-2">
                    {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(b)} className="p-1.5 text-slate-400 hover:text-[#003527] hover:bg-slate-100 rounded-lg transition-colors">
                      <FiEdit2 className="text-sm" />
                    </button>
                    <button onClick={() => handleDelete(b._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      <Modal
        open={modalOpen}
        title={editing ? `Edit Branch — ${editing.name}` : "Add New Branch"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Current details (read-only) shown when editing */}
          {editing && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Details</p>
              <div className="flex justify-between">
                <span className="text-slate-500">Branch ID</span>
                <span className="font-mono text-xs text-slate-600 truncate ml-4">{editing._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-700 font-medium">
                  {new Date(editing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              {editing.createdBy && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Created by</span>
                  <span className="text-slate-700 font-medium">{editing.createdBy.name}</span>
                </div>
              )}
              {statsMap[editing._id] && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Collectors</span>
                    <span className="text-slate-700 font-medium">{statsMap[editing._id].collectors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customers</span>
                    <span className="text-slate-700 font-medium">{statsMap[editing._id].customers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Collected</span>
                    <span className="font-bold text-[#003527]">₹{statsMap[editing._id].totalCollected.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Branch Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Kozhikode North"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]/40 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Location <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Calicut, Kerala"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]/40 placeholder-slate-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Update Branch" : "Create Branch"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

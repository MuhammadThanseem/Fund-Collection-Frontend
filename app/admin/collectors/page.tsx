"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiUser } from "react-icons/fi";
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
  const [search, setSearch] = useState("");
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

  const filtered = collectors.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#003527]">Collectors</h1>
          <p className="text-slate-500 text-sm mt-1">Manage fund collectors across branches.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] transition-colors shadow-sm"
        >
          <FiPlus />
          Add Collector
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Total Collectors</p>
          <p className="text-3xl font-bold text-[#003527]">{collectors.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Active</p>
          <p className="text-3xl font-bold text-green-600">{collectors.filter((c) => c.isActive).length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Total Collected</p>
          <p className="text-3xl font-bold text-[#003527]">
            ${collectors.reduce((s, c) => s + c.collectedAmount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#003527]">All Collectors</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003527]/20 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">Collector</th>
                <th className="text-left px-6 py-3">Branch</th>
                <th className="text-left px-6 py-3">Area</th>
                <th className="text-left px-6 py-3">Collected</th>
                <th className="text-left px-6 py-3">Customers</th>
                <th className="text-left px-6 py-3">Performance</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center text-slate-400 py-10">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-slate-400 py-10">
                  {search ? "No results found." : "No collectors yet."}
                </td></tr>
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
                    ${c.collectedAmount.toLocaleString()}
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

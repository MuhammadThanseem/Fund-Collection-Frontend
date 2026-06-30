"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch } from "react-icons/fi";
import {
  getCollections, createCollection, updateCollection, deleteCollection,
  type Collection, type CreateCollectionPayload,
} from "@/services/collection.service";
import { getBranches, type Branch } from "@/services/branch.service";
import { getCustomers, type Customer } from "@/services/customer.service";
import { getCollectors, type Collector } from "@/services/collector.service";

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-base font-bold text-[#003527]">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><FiX className="text-xl" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const today = new Date();
  const [form, setForm] = useState<CreateCollectionPayload>({
    customerId: "", collectorId: "", branchId: "",
    amount: 0, month: today.getMonth() + 1, year: today.getFullYear(), notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getCollections(), getBranches(), getCustomers(), getCollectors()])
      .then(([col, br, cu, co]) => { setCollections(col); setBranches(br); setCustomers(cu); setCollectors(co); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ customerId: "", collectorId: "", branchId: "", amount: 0, month: today.getMonth() + 1, year: today.getFullYear(), notes: "" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c: Collection) => {
    setEditing(c);
    setForm({
      customerId: typeof c.customerId === "object" ? c.customerId._id : (c.customerId as string),
      collectorId: typeof c.collectorId === "object" ? c.collectorId._id : (c.collectorId as string),
      branchId: typeof c.branchId === "object" ? c.branchId._id : (c.branchId as string),
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
      if (editing) {
        await updateCollection(editing._id, form);
      } else {
        await createCollection(form);
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
    if (!confirm("Delete this collection?")) return;
    try {
      await deleteCollection(id);
      fetchAll();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  };

  const totalAmount = collections.reduce((s, c) => s + c.amount, 0);

  const filtered = collections.filter((c) => {
    const customer = typeof c.customerId === "object" ? c.customerId.name : "";
    const collector = typeof c.collectorId === "object" ? c.collectorId.name : "";
    const q = search.toLowerCase();
    return customer.toLowerCase().includes(q) || collector.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#003527]">Collections</h1>
          <p className="text-slate-500 text-sm mt-1">Track all fund collection transactions.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] shadow-sm transition-colors">
          <FiPlus />
          Record Collection
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Total Records</p>
          <p className="text-3xl font-bold text-[#003527]">{collections.length}</p>
        </div>
        <div className="bg-[#003527] rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-2">Total Collected</p>
          <p className="text-3xl font-bold text-white">${totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Avg per Collection</p>
          <p className="text-3xl font-bold text-[#003527]">
            ${collections.length ? Math.round(totalAmount / collections.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#003527]">All Collections</h2>
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
                <th className="text-left px-6 py-3">Customer</th>
                <th className="text-left px-6 py-3">Collector</th>
                <th className="text-left px-6 py-3">Branch</th>
                <th className="text-left px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Period</th>
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-left px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center text-slate-400 py-10">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-400 py-10">
                  {search ? "No results." : "No collections yet."}
                </td></tr>
              ) : filtered.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {typeof c.customerId === "object" ? c.customerId.name : "—"}
                    {typeof c.customerId === "object" && (
                      <p className="text-xs text-slate-400">{c.customerId.phone}</p>
                    )}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{typeof c.collectorId === "object" ? c.collectorId.name : "—"}</td>
                  <td className="px-6 py-3 text-slate-600">{typeof c.branchId === "object" ? c.branchId.name : "—"}</td>
                  <td className="px-6 py-3 font-bold text-[#003527]">${c.amount.toLocaleString()}</td>
                  <td className="px-6 py-3 text-slate-500">{MONTHS[c.month - 1]} {c.year}</td>
                  <td className="px-6 py-3 text-slate-400 text-xs">{new Date(c.collectionDate).toLocaleDateString()}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-[#003527] hover:bg-slate-100 rounded-lg"><FiEdit2 className="text-sm" /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 className="text-sm" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} title={editing ? "Edit Collection" : "Record Collection"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Customer</label>
            <select value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 bg-white">
              <option value="">Select customer</option>
              {customers.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.boxNumber})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Collector</label>
            <select value={form.collectorId} onChange={(e) => setForm((f) => ({ ...f, collectorId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 bg-white">
              <option value="">Select collector</option>
              {collectors.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Branch</label>
            <select value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 bg-white">
              <option value="">Select branch</option>
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Amount ($)</label>
            <input type="number" placeholder="0" value={form.amount || ""}
              onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 placeholder-slate-400" />
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
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea rows={2} placeholder="Optional notes" value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 placeholder-slate-400 resize-none" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Update" : "Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiX, FiSearch } from "react-icons/fi";
import {
  getBranches, createBranch, updateBranch, deleteBranch,
  type Branch,
} from "@/services/branch.service";

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

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetch = () => {
    setLoading(true);
    getBranches()
      .then(setBranches)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

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
      setError("Name and location are required.");
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
      fetch();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this branch?")) return;
    try {
      await deleteBranch(id);
      fetch();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  };

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#003527]">Branch Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Oversee regional performance and resource allocation.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] transition-colors shadow-sm"
        >
          <FiPlus />
          Create Branch
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Total Branches</p>
          <p className="text-3xl font-bold text-[#003527]">{branches.length}</p>
          <p className="text-xs text-slate-400 mt-1">Registered nodes</p>
        </div>
        <div className="bg-[#003527] rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-2">Active Branches</p>
          <p className="text-3xl font-bold text-white">{branches.length}</p>
          <p className="text-xs text-white/50 mt-1">Network nodes</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Efficiency Rating</p>
          <p className="text-3xl font-bold text-[#003527]">98.2%</p>
          <p className="text-xs text-slate-400 mt-1">Collection performance</p>
        </div>
      </div>

      {/* Branch list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* List header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#003527]">Regional Branches</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search branches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003527]/20 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-16">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-400 py-16">
            {search ? "No branches match your search." : "No branches yet. Create one!"}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((b) => (
              <div key={b._id} className="flex items-center px-6 py-4 hover:bg-slate-50 transition-colors group">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#e8f5ef] flex items-center justify-center flex-shrink-0 mr-4">
                  <FiMapPin className="text-[#003527]" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#003527] text-sm">{b.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{b.location}</p>
                </div>

                {/* Created */}
                <div className="hidden md:block text-xs text-slate-400 mr-6">
                  {new Date(b.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(b)}
                    className="p-1.5 text-slate-400 hover:text-[#003527] hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <FiEdit2 className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={editing ? "Edit Branch" : "Create Branch"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Branch Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. London Hub"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]/40 placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. London, UK"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]/40 placeholder-slate-400"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
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
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

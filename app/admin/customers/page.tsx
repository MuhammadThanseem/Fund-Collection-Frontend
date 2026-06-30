"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiUser, FiFilter } from "react-icons/fi";
import {
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
  type Customer, type CreateCustomerPayload,
} from "@/services/customer.service";
import { getBranches, type Branch } from "@/services/branch.service";

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterBranch, setFilterBranch] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<CreateCustomerPayload>({ name: "", phone: "", address: "", boxNumber: "", branchId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getCustomers(), getBranches()])
      .then(([c, b]) => { setCustomers(c); setBranches(b); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", phone: "", address: "", boxNumber: "", branchId: "" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name, phone: c.phone, address: c.address || "",
      boxNumber: c.boxNumber,
      branchId: typeof c.branchId === "object" ? c.branchId._id : (c.branchId as string),
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.boxNumber || !form.branchId) {
      setError("Name, phone, box number and branch are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateCustomer(editing._id, form);
      } else {
        await createCustomer(form);
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
    if (!confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
      fetchAll();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  };

  const filtered = customers.filter((c) => {
    const branchId = typeof c.branchId === "object" ? c.branchId._id : (c.branchId as string);
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(search) || c.boxNumber.toLowerCase().includes(q);
    const matchBranch = filterBranch === "ALL" || branchId === filterBranch;
    return matchSearch && matchBranch;
  });

  const isFiltered = filtered.length !== customers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">Customers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage AIC Fund Collection customers.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] active:scale-[0.98] transition-all shadow-md shadow-[#003527]/20 self-start">
          <FiPlus /> Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Customers",   value: customers.length,                                             dark: false },
          { label: "Branches Covered",  value: branches.length,                                              dark: true  },
          { label: "Filtered Results",  value: isFiltered ? filtered.length : "—",                          dark: false },
        ].map(({ label, value, dark }) => (
          <div key={label} className={`rounded-2xl p-5 shadow-sm ${dark ? "bg-[#003527]" : "bg-white border border-slate-100"}`}>
            <p className={`text-xs uppercase tracking-widest font-semibold mb-2 ${dark ? "text-white/60" : "text-slate-400"}`}>{label}</p>
            <p className={`text-3xl font-bold ${dark ? "text-white" : "text-[#003527]"}`}>{loading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name, phone or box number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#003527]/20 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-400 text-sm flex-shrink-0" />
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003527]/20 text-slate-600 font-medium"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            {(search || filterBranch !== "ALL") && (
              <button
                onClick={() => { setSearch(""); setFilterBranch("ALL"); }}
                className="text-xs text-slate-400 hover:text-red-500 font-semibold px-2 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="px-6 py-2.5 bg-slate-50/40 border-b border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            {loading ? "Loading…" : `${filtered.length} customer${filtered.length !== 1 ? "s" : ""}${isFiltered ? ` (filtered from ${customers.length})` : ""}`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">Customer</th>
                <th className="text-left px-6 py-3">Box No.</th>
                <th className="text-left px-6 py-3">Branch</th>
                <th className="text-left px-6 py-3">Address</th>
                <th className="text-left px-6 py-3">Joined</th>
                <th className="text-left px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center text-slate-400 py-10">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <p className="text-slate-400 text-sm">
                      {search || filterBranch !== "ALL" ? "No customers match your filters." : "No customers yet."}
                    </p>
                    {(search || filterBranch !== "ALL") && (
                      <button onClick={() => { setSearch(""); setFilterBranch("ALL"); }} className="mt-2 text-xs text-[#006c49] font-semibold hover:underline">
                        Clear filters
                      </button>
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
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono font-semibold">{c.boxNumber}</span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{typeof c.branchId === "object" ? c.branchId.name : "—"}</td>
                  <td className="px-6 py-3 text-slate-500 max-w-[180px] truncate">{c.address || "—"}</td>
                  <td className="px-6 py-3 text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
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
      <Modal open={modalOpen} title={editing ? "Edit Customer" : "Add Customer"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Customer name" },
            { label: "Phone", key: "phone", type: "tel", placeholder: "Phone number" },
            { label: "Box Number", key: "boxNumber", type: "text", placeholder: "e.g. BOX-001" },
            { label: "Address", key: "address", type: "text", placeholder: "Street address" },
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
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#003527] text-white text-sm font-semibold rounded-xl hover:bg-[#064e3b] disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Update" : "Add Customer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

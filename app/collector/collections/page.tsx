"use client";

import { useEffect, useState } from "react";
import {
  FiDollarSign, FiShield, FiCheckCircle, FiX,
} from "react-icons/fi";
import { MdOutlineHouse } from "react-icons/md";
import { getCollections, createCollection, type Collection } from "@/services/collection.service";
import { getCustomers, type Customer } from "@/services/customer.service";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const QUICK_AMOUNTS = [100, 500, 1000];

export default function CollectorCollectionsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading,   setLoading]   = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [amount,  setAmount]  = useState<string>("");
  const [notes,   setNotes]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const today = new Date();

  useEffect(() => {
    Promise.all([getCustomers(), getCollections()])
      .then(([c, cols]) => {
        setCustomers(c);
        setCollections(cols);
        if (c.length > 0) setSelectedCustomer(c[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const thisMonthCols = collections.filter(
    (c) => c.month === today.getMonth() + 1 && c.year === today.getFullYear()
  );
  const totalThisMonth = thisMonthCols.reduce((s, c) => s + c.amount, 0);

  const handleQuick = (v: number) => setAmount(String(v));

  const handleConfirm = async () => {
    if (!selectedCustomer || !amount || Number(amount) <= 0) {
      setError("Please select a customer and enter a valid amount.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createCollection({
        customerId: selectedCustomer._id,
        amount:     Number(amount),
        month:      today.getMonth() + 1,
        year:       today.getFullYear(),
        notes,
      });
      setSuccess(true);
      setAmount("");
      setNotes("");
      const cols = await getCollections();
      setCollections(cols);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const customerCollected = selectedCustomer
    ? thisMonthCols.some(
        (c) =>
          (typeof c.customerId === "object"
            ? c.customerId._id
            : c.customerId) === selectedCustomer._id
      )
    : false;

  const campaignPct = totalThisMonth > 0 ? Math.min(Math.round((totalThisMonth / 50000) * 100), 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-[#006c49] font-bold uppercase tracking-widest mb-1">
          Entry Phase
        </p>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">
          Cash Collection Entry
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-md">
          Please record the exact amount received. All transactions are logged with radical
          transparency for donor trust.
        </p>
      </div>

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold">
          <FiCheckCircle className="text-lg flex-shrink-0" />
          Collection recorded successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Entry form */}
        <div className="lg:col-span-3 space-y-5">
          {/* Customer select */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Select Customer
            </label>
            <select
              value={selectedCustomer?._id || ""}
              onChange={(e) => {
                const c = customers.find((x) => x._id === e.target.value) || null;
                setSelectedCustomer(c);
                setSuccess(false);
                setError("");
              }}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]/40 bg-white text-slate-700"
              disabled={loading}
            >
              {loading ? (
                <option>Loading…</option>
              ) : customers.length === 0 ? (
                <option value="">No customers found</option>
              ) : (
                customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} — {c.boxNumber}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Amount entry */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              Collection Amount
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <FiDollarSign className="text-4xl text-slate-200" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="text-4xl font-bold text-slate-300 placeholder-slate-200 bg-transparent outline-none w-40 text-center focus:text-[#003527] transition-colors"
              />
            </div>
            <div className="flex items-center justify-center gap-3">
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  onClick={() => handleQuick(v)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                    amount === String(v)
                      ? "border-[#003527] bg-[#003527] text-white shadow-md"
                      : "border-slate-200 text-slate-600 hover:border-[#003527] hover:text-[#003527]"
                  }`}
                >
                  +₹{v}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Collection Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mention any specific donor preferences or household context..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]/40 placeholder-slate-300 resize-none"
            />
          </div>

          {/* Recent collections */}
          {thisMonthCols.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-[#003527]">
                  {MONTHS[today.getMonth()]} Collections — {thisMonthCols.length} recorded
                </h3>
              </div>
              <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
                {thisMonthCols.slice(0, 5).map((c) => (
                  <div key={c._id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {typeof c.customerId === "object" ? c.customerId.name : "—"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(c.collectionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#003527]">
                      ₹{c.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Household details + Confirm */}
        <div className="lg:col-span-2 space-y-4">
          {/* Household details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Household Details
            </p>
            {selectedCustomer ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#003527] flex items-center justify-center flex-shrink-0">
                    <MdOutlineHouse className="text-white text-2xl" />
                  </div>
                  <div>
                    <p className="font-bold text-[#003527] text-base">{selectedCustomer.name}</p>
                    <p className="text-sm text-slate-500">{selectedCustomer.address || selectedCustomer.boxNumber}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Last Collection</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {new Date(selectedCustomer.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Status</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                        customerCollected
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {customerCollected ? "Collected" : "Active Donor"}
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-500">Campaign Progress</span>
                      <span className="text-sm font-bold text-[#006c49]">{campaignPct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#003527] to-[#6cf8bb] rounded-full transition-all duration-700"
                        style={{ width: `${campaignPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-sm">Select a customer to see details.</p>
            )}
          </div>

          {/* Secure Handover + Confirm */}
          <div className="bg-[#003527] rounded-2xl p-5 shadow-lg shadow-[#003527]/20">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <FiShield className="text-[#6cf8bb] text-lg" />
              </div>
              <div>
                <p className="text-white font-bold text-sm uppercase tracking-wide">
                  Secure Handover
                </p>
                <p className="text-white/60 text-xs mt-1 leading-relaxed italic">
                  &ldquo;Ensure all cash is stored in the provided tamper-evident pouch
                  immediately after collection.&rdquo;
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2.5 bg-red-900/30 rounded-xl text-red-300 text-xs font-medium">
                <FiX className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={saving || !selectedCustomer || !amount || Number(amount) <= 0}
              className="w-full py-3.5 bg-[#6cf8bb] text-[#003527] rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#4edea3] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? "Recording…" : "Confirm Collection"}
            </button>

          </div>

          {/* Month summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              {MONTHS[today.getMonth()]} Summary
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-[#e8f5ef] rounded-xl">
                <p className="text-lg font-black text-[#003527]">{thisMonthCols.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Collections</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-lg font-black text-[#003527]">
                  ₹{totalThisMonth.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

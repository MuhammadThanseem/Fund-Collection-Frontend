"use client";

import { useState } from "react";
import {
  FiUser, FiLock, FiBell, FiSave, FiEye, FiEyeOff, FiCheck, FiShield,
} from "react-icons/fi";

type Tab = "profile" | "security" | "notifications";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile",       label: "Profile",       icon: FiUser },
  { id: "notifications", label: "Notifications", icon: FiBell },
  { id: "security",      label: "Security",      icon: FiLock },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-[#003527]">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 items-start">
      <div className="sm:pt-2">
        <label className="text-sm font-semibold text-slate-700 block">{label}</label>
        {hint && <p className="text-xs text-slate-400 mt-0.5 leading-snug">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-[#003527]" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function CollectorSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("Collector Name");
  const [phone, setPhone] = useState("");
  const [assignedArea, setAssignedArea] = useState("");

  const [notifCollection, setNotifCollection] = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifNewCustomer, setNotifNewCustomer] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]/40 transition-all";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your profile and account preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-md flex-shrink-0 ${
            saved
              ? "bg-emerald-500 text-white shadow-emerald-200"
              : "bg-[#003527] text-white hover:bg-[#064e3b] shadow-[#003527]/20"
          }`}
        >
          {saved ? <FiCheck /> : <FiSave />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Tab nav */}
        <nav className="flex flex-row lg:flex-col gap-1 lg:w-52 flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-2 h-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left ${
                activeTab === id
                  ? "bg-[#003527] text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon className="text-base flex-shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1 space-y-4">
          {activeTab === "profile" && (
            <>
              <Section title="Personal Information">
                <Field label="Full Name">
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Phone Number" hint="Used for login">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" className={inputCls} />
                </Field>
                <Field label="Assigned Area" hint="Your collection zone">
                  <input value={assignedArea} onChange={(e) => setAssignedArea(e.target.value)} placeholder="e.g. Kozhikode Town" className={inputCls} />
                </Field>
              </Section>

              <Section title="Profile Photo">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#003527] text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700">
                      Upload Photo
                    </button>
                    <p className="text-xs text-slate-400 mt-1.5">JPG or PNG. Max 2MB.</p>
                  </div>
                </div>
              </Section>
            </>
          )}

          {activeTab === "notifications" && (
            <Section title="Notification Preferences">
              {[
                {
                  label: "Collection Reminders",
                  hint: "Notify when a customer collection is due",
                  value: notifReminder,
                  set: setNotifReminder,
                },
                {
                  label: "New Entry Confirmation",
                  hint: "Alert when a collection entry is saved successfully",
                  value: notifCollection,
                  set: setNotifCollection,
                },
                {
                  label: "New Customer Added",
                  hint: "Notify when a new household is assigned to you",
                  value: notifNewCustomer,
                  set: setNotifNewCustomer,
                },
              ].map(({ label, hint, value, set }) => (
                <Field key={label} label={label} hint={hint}>
                  <Toggle checked={value} onChange={set} />
                </Field>
              ))}
            </Section>
          )}

          {activeTab === "security" && (
            <>
              <Section title="Change Password">
                <Field label="Current Password">
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrent ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                    </button>
                  </div>
                </Field>
                <Field label="New Password">
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm Password">
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      confirmPw && confirmPw !== newPw
                        ? "border-red-300 focus:ring-red-200"
                        : "border-slate-200 focus:ring-[#003527]/20 focus:border-[#003527]/40"
                    }`}
                  />
                  {confirmPw && confirmPw !== newPw && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                  )}
                </Field>
              </Section>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <FiShield className="text-amber-500 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Security Tip</p>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Use a strong password with at least 8 characters, mixing uppercase, lowercase, numbers, and symbols.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

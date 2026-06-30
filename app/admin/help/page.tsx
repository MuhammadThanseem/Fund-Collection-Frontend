"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiSearch, FiChevronDown, FiChevronUp, FiBook, FiMessageCircle,
  FiPhone, FiMail, FiExternalLink, FiUsers, FiDollarSign,
  FiBarChart2, FiShield, FiMap,
} from "react-icons/fi";

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: "How do I add a new branch?",
    a: "Go to Branches in the sidebar, then click the '+ Add Branch' button. Fill in the branch name and location, then save. The branch will immediately be available for assigning collectors.",
  },
  {
    q: "How do I assign a collector to a branch?",
    a: "Navigate to Collectors, open the collector's profile, and use the Branch dropdown to assign them. A collector can only belong to one branch at a time.",
  },
  {
    q: "How are collection amounts recorded?",
    a: "Collectors log collection entries through the Collector portal. Each entry records the customer, amount, date, and payment method. Admins can view and verify all entries from the Collections page.",
  },
  {
    q: "Can I export reports?",
    a: "Yes. Go to the Reports page, set your desired date range and filters, then click 'Download PDF' or 'Export CSV'. Reports include branch-wise, collector-wise, and month-wise breakdowns.",
  },
  {
    q: "How do I reset a collector's password?",
    a: "Go to Collectors, find the collector, and click the three-dot menu. Select 'Reset Password' — the collector will receive an email with a reset link.",
  },
  {
    q: "What roles are available in the system?",
    a: "There are two roles: Admin and Collector. Admins have full access to all data and settings. Collectors can only access their assigned customers and log collection entries.",
  },
  {
    q: "How do I view a customer's payment history?",
    a: "Open the Customers page, find the customer using the search bar, and click their name. The customer detail view shows the full payment history with dates and amounts.",
  },
  {
    q: "Is data backed up automatically?",
    a: "Yes, the database is backed up automatically every 24 hours. You can also request a manual export from the Settings → Data & Privacy section.",
  },
];

const QUICK_LINKS = [
  { label: "Managing Branches",  icon: FiMap,        href: "/admin/areas" },
  { label: "Collector Guide",    icon: FiUsers,       href: "/admin/collectors" },
  { label: "Recording Collections", icon: FiDollarSign, href: "/admin/collections" },
  { label: "Generating Reports", icon: FiBarChart2,   href: "/admin/reports" },
  { label: "Security Settings",  icon: FiShield,      href: "/admin/settings" },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-2xl bg-[#e8f5ef] flex items-center justify-center mx-auto mb-4">
          <FiBook className="text-[#003527] text-2xl" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#003527] tracking-tight">Help Center</h1>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          Find answers to common questions, or reach out to our support team.
        </p>

        {/* Search */}
        <div className="relative mt-5 max-w-md mx-auto">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]/30 shadow-sm transition-all placeholder-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ */}
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-base font-bold text-[#003527] mb-4">
            Frequently Asked Questions
            {search && (
              <span className="text-sm text-slate-400 font-normal ml-2">
                — {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </h2>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-400">
              <FiSearch className="text-3xl mx-auto mb-2 opacity-30" />
              <p className="text-sm">No results for &ldquo;{search}&rdquo;</p>
              <button
                onClick={() => setSearch("")}
                className="mt-3 text-xs text-[#006c49] font-semibold hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
              {filtered.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50/70 transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-800">{faq.q}</span>
                    {openIndex === i ? (
                      <FiChevronUp className="text-[#003527] flex-shrink-0" />
                    ) : (
                      <FiChevronDown className="text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {openIndex === i && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#003527]">Quick Navigation</h3>
            </div>
            <ul className="divide-y divide-slate-50">
              {QUICK_LINKS.map(({ label, icon: Icon, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#e8f5ef] flex items-center justify-center flex-shrink-0">
                      <Icon className="text-[#003527] text-sm" />
                    </div>
                    <span className="text-sm text-slate-700 font-medium group-hover:text-[#003527] transition-colors">
                      {label}
                    </span>
                    <FiExternalLink className="ml-auto text-slate-300 group-hover:text-[#003527] text-xs transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Support */}
          <div className="bg-[#003527] rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-white font-bold text-sm">Still need help?</p>
              <p className="text-white/60 text-xs mt-1 leading-relaxed">
                Our support team is available Sunday–Thursday, 9am–5pm.
              </p>
            </div>
            <div className="space-y-2">
              <a
                href="mailto:support@aicfund.org"
                className="flex items-center gap-2.5 text-white/80 hover:text-white text-sm transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FiMail className="text-[#6cf8bb] text-sm" />
                </div>
                support@aicfund.org
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2.5 text-white/80 hover:text-white text-sm transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FiPhone className="text-[#6cf8bb] text-sm" />
                </div>
                +91 98765 43210
              </a>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#6cf8bb] text-[#003527] rounded-xl text-sm font-bold hover:bg-[#4edea3] active:scale-[0.98] transition-all">
              <FiMessageCircle className="text-sm" />
              Chat with Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

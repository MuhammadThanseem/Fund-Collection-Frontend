"use client";

import { login } from "@/services/auth.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaHandsHelping } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ identifier, password });

      if (response.status === 200) {
        if (response.data.user.role == "SUPER_ADMIN") {
          router.push("/admin");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-background font-body-md text-on-background min-h-screen flex items-center justify-center p-gutter ethereal-bg overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-fixed/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/20 rounded-full blur-[120px]"></div>
      <main className="w-full max-w-[480px] z-10">
        <div className="flex flex-col items-center mb-unit*10 text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <FaHandsHelping className="text-on-primary text-3xl" />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tighter mb-2">
            AIC Fund Collection
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-[300px] mb-4">
            Empowering radical transparency in global philanthropy.
          </p>
        </div>
        <div className="glass-panel rounded-[2rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,53,39,0.08)] relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-headline-md text-headline-md text-primary mb-8">
              Welcome back
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
                  Work Email
                </label>
                <div className="relative">
                  <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl" />
                  <input
                    className="w-full bg-white/50 border border-outline-variant rounded-xl py-4 pl-12 pr-4 font-body-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    id="identifier"
                    placeholder="name@organization.com"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
                    Password
                  </label>
                  <a
                    className="text-sm font-semibold text-secondary hover:text-primary transition-colors"
                    href="#"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl" />
                  <input
                    className="w-full bg-white/50 border border-outline-variant rounded-xl py-4 pl-12 pr-4 font-body-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}
              <button
                disabled={loading}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-sm text-label-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-container hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60"
                type="submit"
              >
                {loading ? "Signing in..." : "Sign in to Dashboard"}
              </button>
            </form>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        </div>
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="font-body-md text-on-surface-variant">
            New to the platform?
            <a
              className="text-secondary font-bold hover:underline underline-offset-4"
              href="#"
            >
              Request Access
            </a>
          </p>
          <div className="flex gap-6 opacity-60">
            <a
              className="font-label-sm text-xs uppercase tracking-widest hover:opacity-100 transition-opacity"
              href="#"
            >
              Privacy
            </a>

            <a
              className="font-label-sm text-xs uppercase tracking-widest hover:opacity-100 transition-opacity"
              href="#"
            >
              Terms
            </a>

            <a
              className="font-label-sm text-xs uppercase tracking-widest hover:opacity-100 transition-opacity"
              href="#"
            >
              Contact
            </a>
          </div>
        </div>
      </main>
      <div className="hidden lg:block absolute right-[-10%] top-1/2 -translate-y-1/2 w-[35%] aspect-[3/4] opacity-80">
        <div className="w-full h-full rounded-[4rem] overflow-hidden rotate-[-6deg] shadow-2xl glass-panel p-4">
          <img
            className="w-full h-full object-cover rounded-[3rem]"
            data-alt="Heartwarming photo of diverse community members working together in a bright sunlit garden with soft lens flare"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7HUuuKg1Zcx1JP91CSvFzgXM8-8I28gybYDbEpLtQdSgqP2jkRr71TcuCbxf6fPCrQA_7QDkwqMLXaK00_oR4evMSO6b53jg2ApQ91vnq9F6C7o1vyObwk2_d5x5fCMtneY-6rtlsFAOi6SmrJ46PmYRd2vSStIylVj_VA-RuepQaHqnBvTn82ShcdMQu0hrduXuqCiQKQxGGDuDfVl2HTI07luEl6b1CmDMsL6PwoLGE7pBZmeTqr8d1M1K2rjU6AD4IH7-Wy14"
          />
        </div>
      </div>
      <div className="hidden lg:block absolute left-[-5%] bottom-[-5%] w-[25%] aspect-square opacity-60">
        <div className="w-full h-full rounded-[4rem] overflow-hidden rotate-[12deg] shadow-2xl glass-panel p-4">
          <img
            className="w-full h-full object-cover rounded-[3rem]"
            data-alt="Minimalist architectural shot of a clean modern building with soft shadows and emerald green accents"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm8LguSiQyFPjvNyXRCrCH-GnilnRCba-UnzPmsGNTrjCQJO68H1y3AnSR4elCbVdZSoKNgSmxM0DBQkgA1F9IXGhE8mq14bxQmocEwHL6BPvO8-kp77BxkcFgokc-muStaq5xbE7GOL4UqwGsCOkK_DLDmmnprliq5rUJilBTKlIxnCGzifikQf8V6QMOfESK6reFfL5r1Ye8PzxdfJJ58YhbSM7bi6Ckm3WwroMy4NIeKg6K486qVwpR2d_YJdCoflv-r2Tcla0"
          />
        </div>
      </div>
    </main>
  );
}

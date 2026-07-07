/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Mail, Shield, User, AlertTriangle } from 'lucide-react';
import { StaffProfile } from '../types';

interface LoginPageProps {
  staffProfiles: StaffProfile[];
  onLogin: (email: string, accessCode: string) => { ok: boolean; message?: string };
  onStartOnboarding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onStartOnboarding }) => {
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onLogin(email, accessCode);
    if (!result.ok) {
      setError(result.message || 'Unable to sign in. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-stretch">
        <section className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col justify-between gap-10">
          <div>
            <div className="h-14 w-14 bg-slate-950 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              🎪
            </div>
            <h1 className="mt-6 text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
              Savour Festival Staff Portal
            </h1>
            <p className="mt-3 text-slate-600 max-w-2xl leading-relaxed">
              Sign in to manage events, onboard staff, allocate shifts, clock in and out, submit invoices, and audit payroll.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Shield className="text-indigo-600 mb-2" size={20} />
              <p className="font-bold text-slate-900">Coordinator HQ</p>
              <p className="text-xs text-slate-500 mt-1">Create events, shifts, invoices and approvals.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <User className="text-emerald-600 mb-2" size={20} />
              <p className="font-bold text-slate-900">Staff dashboard</p>
              <p className="text-xs text-slate-500 mt-1">Accept shifts, track time and submit invoices.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Mail className="text-amber-600 mb-2" size={20} />
              <p className="font-bold text-slate-900">Onboarding links</p>
              <p className="text-xs text-slate-500 mt-1">Invited staff can complete signup from a link.</p>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p>
              This build uses browser localStorage for app data and a simple access-code login so it can run on Vercel without a backend. For a production public deployment, connect a real auth/database service such as Firebase Auth + Firestore or Supabase.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Lock className="text-slate-800" size={22} />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-950">Sign in</h2>
            <p className="text-xs text-slate-500 mt-1">Use your registered email and access code.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600">Access code</label>
              <input
                type="password"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter access code"
                className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-colors"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <button
              type="button"
              onClick={onStartOnboarding}
              className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs"
            >
              I have an onboarding email/link
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

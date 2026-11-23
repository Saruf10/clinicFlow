import React, { useState } from 'react';
import { api } from '../api';
import type { AuthResponse } from '../types';
import { HeartPulse, Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (authData: AuthResponse) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.login({ username, password });
      localStorage.setItem('clinicflow_token', response.token);
      localStorage.setItem('clinicflow_user', JSON.stringify(response));
      onLoginSuccess(response);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg shadow-sky-500/30">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">ClinicFlow Portal</h2>
          <p className="text-slate-500 text-sm mt-1">Enterprise Clinic & Appointment Management</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Username</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm shadow-lg shadow-sky-600/30 transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick Demo Credentials Preset */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 text-center">Quick Demo Credentials</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPreset('admin', 'admin123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition text-center"
            >
              Admin
            </button>
            <button
              onClick={() => setPreset('receptionist', 'recep123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition text-center"
            >
              Receptionist
            </button>
            <button
              onClick={() => setPreset('doctor', 'doc123')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition text-center"
            >
              Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

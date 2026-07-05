import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError('Please fill in all fields.');
    }
    if (newPassword.length < 6) {
      return setError('New password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.');
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password. Make sure current password is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pl-64 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8 flex flex-col gap-8 animate-slide-up">
        {/* Title Header */}
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Profile Settings</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage user account profile parameters and security credentials.</p>
        </header>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-200">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm text-emerald-200">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Profile Card (Left Side) */}
          <div className="bg-card border border-border p-6 rounded-xl md:col-span-1 h-fit space-y-5">
            <div className="flex flex-col items-center text-center pb-4 border-b border-border">
              <div className="h-16 w-16 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-extrabold text-2xl mb-3">
                {user?.username?.substring(0, 2).toUpperCase() || 'US'}
              </div>
              <h3 className="text-base font-bold text-white">{user?.username}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{user?.email}</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Status</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded font-semibold">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Tier</span>
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded font-semibold">Pro Analyst</span>
              </div>
            </div>
          </div>

          {/* Change Password (Right Side) */}
          <div className="bg-card border border-border p-6 rounded-xl md:col-span-2">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-400" />
              Change Password Security
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-zinc-900 px-3.5 py-2.5 text-white placeholder-zinc-650 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-zinc-900 px-3.5 py-2.5 text-white placeholder-zinc-650 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-zinc-900 px-3.5 py-2.5 text-white placeholder-zinc-650 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-4 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { AuthResponse } from '../types/auth';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetchWithAuth<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(response);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header Header Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal/10 text-teal mb-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 0L4 4m5.121 5.121l7 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Tailoring Workspace</h1>
          <p className="text-sm text-muted">Sign in to access your business measurements & orders</p>
        </div>

        {/* Login Form Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-xs font-medium">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </Card>

        {/* Test Accounts Quick-Fill Box */}
        <div className="bg-surface/60 border border-border/70 rounded-lg p-4 text-xs space-y-2">
          <p className="font-semibold text-ink uppercase tracking-wider text-[10px]">Development Test Accounts</p>
          <div className="grid grid-cols-2 gap-2 text-muted">
            <button
              onClick={() => handleQuickFill('superadmin@platform.com', 'SuperAdmin123!')}
              className="text-left p-2 rounded hover:bg-canvas border border-border/40 transition-colors"
            >
              <div className="font-semibold text-teal text-[11px]">Super Admin</div>
              <div className="truncate text-[10px]">superadmin@platform.com</div>
            </button>
            <button
              onClick={() => handleQuickFill('admin@stitchandstyle.com', 'Admin123!')}
              className="text-left p-2 rounded hover:bg-canvas border border-border/40 transition-colors"
            >
              <div className="font-semibold text-teal text-[11px]">Business Admin</div>
              <div className="truncate text-[10px]">admin@stitchandstyle.com</div>
            </button>
            <button
              onClick={() => handleQuickFill('staff.full@stitchandstyle.com', 'Staff123!')}
              className="text-left p-2 rounded hover:bg-canvas border border-border/40 transition-colors"
            >
              <div className="font-semibold text-teal text-[11px]">Staff Full</div>
              <div className="truncate text-[10px]">staff.full@...</div>
            </button>
            <button
              onClick={() => handleQuickFill('staff.basic@stitchandstyle.com', 'Staff123!')}
              className="text-left p-2 rounded hover:bg-canvas border border-border/40 transition-colors"
            >
              <div className="font-semibold text-teal text-[11px]">Staff Basic</div>
              <div className="truncate text-[10px]">staff.basic@...</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

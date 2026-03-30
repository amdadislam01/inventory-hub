'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PackageOpen, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
       toast.error(res.error);
       setLoading(false);
    } else {
       toast.success('Logged in successfully!');
       router.push('/dashboard');
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    // make sure this user exists in the db
    // demo credentials: demo@example.com / demo123
    const res = await signIn('credentials', {
      redirect: false,
      email: 'demo@example.com',
      password: 'password123',
    });

    if (res?.error) {
       toast.error('Demo credentials failed. Please register a demo user first.');
       setLoading(false);
    } else {
       toast.success('Demo login successful!');
       router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
             <PackageOpen className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500 drop-shadow-sm">
          Welcome Back
        </h1>
        <p className="text-muted-foreground text-sm mt-2">Sign in to manage your inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="name@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center cursor-pointer"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">or continue with</span>
        </div>
      </div>

      <button
        onClick={handleDemoLogin}
        disabled={loading}
        className="w-full bg-muted hover:bg-emerald-500 hover:font-bold border border-border text-foreground font-medium rounded-lg px-4 py-2.5 transition-colors cursor-pointer"
      >
        Demo Login
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-emerald-600 hover:text-emerald-300 font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SLA113',
  description: 'SLA113 standalone access',
};

export default function Sla113StandalonePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] px-6 py-12 text-[#f0f0f5]">
      <section className="w-full max-w-[420px] rounded-2xl border border-[#2a2a3a] bg-[#1a1a24] p-10">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-[28px] font-bold leading-tight text-[#f0f0f5]">Welcome Back</h1>
          <p className="text-[15px] text-[#8888a0]">Sign in to your account</p>
        </header>

        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="sla113-email" className="block text-sm font-medium text-[#f0f0f5]">
              Email
            </label>
            <input
              id="sla113-email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[#2a2a3a] bg-[#12121a] px-4 py-3 text-[15px] text-[#f0f0f5] outline-none transition-colors placeholder:text-[#5f5f73] focus:border-[#4d9fff]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sla113-password" className="block text-sm font-medium text-[#f0f0f5]">
              Password
            </label>
            <input
              id="sla113-password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#2a2a3a] bg-[#12121a] px-4 py-3 text-[15px] text-[#f0f0f5] outline-none transition-colors placeholder:text-[#5f5f73] focus:border-[#4d9fff]"
            />
          </div>

          <div className="-mt-2 text-right">
            <Link href="/forgot-password" className="text-sm text-[#4d9fff] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="button"
            className="mt-2 w-full rounded-lg bg-[#00d4aa] px-4 py-[14px] text-base font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,212,170,0.3)]"
          >
            Sign In
          </button>
        </form>

        <footer className="mt-6 border-t border-[#2a2a3a] pt-6 text-center text-sm text-[#8888a0]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-[#4d9fff] hover:underline">
            Create one
          </Link>
        </footer>
      </section>

    </main>
  );
}

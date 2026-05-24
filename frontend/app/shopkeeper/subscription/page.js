'use client'

import { useMemo } from 'react'
import { Bell, Crown } from 'lucide-react'

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
        <Crown size={18} />
      </span>
      <div className="text-lg font-extrabold tracking-tight">
        <span className="text-slate-900">PrintSmart</span>
        <span className="text-violet-700"></span>
      </div>
    </div>
  )
}

function HeaderAvatar() {
  const initials = useMemo(() => 'SG', [])

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-gradient-to-br from-violet-100 via-white to-indigo-100 text-sm font-bold text-violet-700 shadow-[0_8px_20px_rgba(109,40,217,0.16)]">
      {initials}
    </div>
  )
}

function NotifyButton() {
  return (
    <button
      type="button"
      onClick={() => console.log('open modal')}
      className="inline-flex items-center gap-2 rounded-full border border-violet-300/90 bg-white/70 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm backdrop-blur hover:bg-white"
    >
      <Bell size={16} />
      Notify Me
    </button>
  )
}

function ComingSoonCard() {
  return (
    <section className="w-full max-w-[560px] rounded-[36px] border border-white/60 bg-white/35 p-7 text-center shadow-[0_30px_80px_rgba(109,40,217,0.18)] backdrop-blur-[20px] sm:p-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100/70 text-violet-700 shadow-[0_10px_30px_rgba(109,40,217,0.20)]">
        <Crown size={36} />
      </div>

      <h1 className="mt-7 text-4xl font-extrabold tracking-tight text-violet-700 sm:text-5xl">Coming Soon</h1>
      <p className="mt-4 text-lg text-slate-700">Subscription plans will be available soon.</p>
      <p className="mt-2 text-base font-medium text-violet-700">with new Print AI features.</p>

      <button
        type="button"
        onClick={() => console.log('open modal')}
        className="mt-8 h-14 min-w-[240px] rounded-full bg-violet-700 px-8 text-2xl font-bold text-white shadow-[0_14px_30px_rgba(109,40,217,0.35)] transition hover:bg-violet-800"
      >
        Thank You
      </button>
    </section>
  )
}

export default function SubscriptionPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eceaf5]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=80')",
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 bg-white/35 backdrop-blur-[2px]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(109,40,217,0.12),transparent_52%),radial-gradient(circle_at_20%_76%,rgba(99,102,241,0.10),transparent_48%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mx-auto w-full max-w-[1400px] rounded-2xl border border-white/60 bg-white/55 px-4 py-3 shadow-[0_12px_26px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-5">
          <div className="flex items-center justify-between">
            <LogoMark />

            <div className="flex items-center gap-3">
              <NotifyButton />
              <HeaderAvatar />
            </div>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <ComingSoonCard />
        </main>
      </div>
    </div>
  )
}
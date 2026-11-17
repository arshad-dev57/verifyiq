import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroBackground } from './Herobackground';
import {
  Shield,
  ArrowRight,
  Activity,
  Cpu,
  Award,
  Terminal,
  EyeOff,
  Search,
  QrCode,
  FileText,
  CheckCircle2,
  ClipboardPaste,
  AppWindow,
  Timer,
  Fingerprint,
  Lock,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */

type Category = 'normal' | 'review_recommended' | 'high_anomaly_signal';

const CATEGORY_META: Record<
  Category,
  { label: string; range: string; dot: string; chip: string; bar: string; desc: string }
> = {
  normal: {
    label: 'Normal Distribution',
    range: '0–44',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700',
    bar: 'bg-emerald-500',
    desc: 'Keystroke timings, backspace corrections and incremental test runs align with the cohort.',
  },
  review_recommended: {
    label: 'Review Recommended',
    range: '45–74',
    dot: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700',
    bar: 'bg-amber-500',
    desc: 'Mild to moderate deviation, such as repeated window defocus or elevated paste frequency.',
  },
  high_anomaly_signal: {
    label: 'High Anomaly Signal',
    range: '75–100',
    dot: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-700',
    bar: 'bg-rose-500',
    desc: 'Strong multi-signal variance, such as large paste blocks with no syntax iteration.',
  },
};

const SAMPLE_SESSIONS: Record<
  Category,
  { title: string; score: number; signals: { icon: React.ReactNode; text: string }[] }[]
> = {
  normal: [
    {
      title: 'Two Sum — Python',
      score: 18,
      signals: [
        { icon: <Timer className="w-3.5 h-3.5" />, text: 'Steady typing rhythm' },
        { icon: <Terminal className="w-3.5 h-3.5" />, text: '6 incremental test runs' },
      ],
    },
    {
      title: 'LRU Cache — Java',
      score: 27,
      signals: [
        { icon: <Timer className="w-3.5 h-3.5" />, text: 'Natural pauses while thinking' },
        { icon: <Activity className="w-3.5 h-3.5" />, text: 'Regular backspace corrections' },
      ],
    },
    {
      title: 'Merge Intervals — JS',
      score: 33,
      signals: [
        { icon: <Terminal className="w-3.5 h-3.5" />, text: 'First run after 4 min' },
        { icon: <ClipboardPaste className="w-3.5 h-3.5" />, text: 'Paste ratio 2%' },
      ],
    },
  ],
  review_recommended: [
    {
      title: 'Graph BFS — Python',
      score: 52,
      signals: [
        { icon: <AppWindow className="w-3.5 h-3.5" />, text: '9 window defocus events' },
        { icon: <ClipboardPaste className="w-3.5 h-3.5" />, text: 'Paste ratio 18%' },
      ],
    },
    {
      title: 'Rate Limiter — Go',
      score: 58,
      signals: [
        { icon: <Timer className="w-3.5 h-3.5" />, text: 'Long idle then fast burst' },
        { icon: <AppWindow className="w-3.5 h-3.5" />, text: '6 window defocus events' },
      ],
    },
    {
      title: 'Trie — C++',
      score: 66,
      signals: [
        { icon: <ClipboardPaste className="w-3.5 h-3.5" />, text: 'Paste ratio 27%' },
        { icon: <Terminal className="w-3.5 h-3.5" />, text: 'Few test runs' },
      ],
    },
  ],
  high_anomaly_signal: [
    {
      title: 'Binary Tree — Java',
      score: 79,
      signals: [
        { icon: <ClipboardPaste className="w-3.5 h-3.5" />, text: 'One 80-line paste block' },
        { icon: <Terminal className="w-3.5 h-3.5" />, text: 'No syntax iterations' },
      ],
    },
    {
      title: 'Dijkstra — Python',
      score: 84,
      signals: [
        { icon: <Timer className="w-3.5 h-3.5" />, text: 'Unusually uniform timing' },
        { icon: <AppWindow className="w-3.5 h-3.5" />, text: '14 window defocus events' },
      ],
    },
    {
      title: 'Parser — TypeScript',
      score: 91,
      signals: [
        { icon: <ClipboardPaste className="w-3.5 h-3.5" />, text: 'Paste ratio 71%' },
        { icon: <Fingerprint className="w-3.5 h-3.5" />, text: 'Zero corrections' },
      ],
    },
  ],
};

const EXPLORE_COLUMNS = [
  { heading: 'Sessions', items: ['Live Sessions', 'Completed', 'Flagged for Review', 'Archived', 'Cohorts'] },
  { heading: 'Signals', items: ['Keystroke Jitter', 'Burstiness', 'Paste Ratio', 'Window Focus', 'Time to First Run'] },
  { heading: 'Evidence', items: ['Anomaly Score', 'SHAP Breakdown', 'AI Summary', 'Timeline', 'Cohort Compare'] },
  { heading: 'Credentials', items: ['Issue Credential', 'QR Verification', 'Ed25519 Proof', 'Revocation', 'Public Verify'] },
];

const TECH = ['Judge0', 'Monaco', 'XGBoost', 'Random Forest', 'SHAP', 'W3C VC'];

const FLOATING_ICONS: { icon: React.ReactNode; pos: string; tone: string }[] = [
  { icon: <Activity className="w-6 h-6" />, pos: 'left-[8%] top-[18%]', tone: 'bg-white text-neutral-900' },
  { icon: <Cpu className="w-6 h-6" />, pos: 'left-[24%] top-[58%]', tone: 'bg-neutral-900 text-white' },
  { icon: <Terminal className="w-6 h-6" />, pos: 'left-[42%] top-[8%]', tone: 'bg-white text-neutral-900' },
  { icon: <Shield className="w-6 h-6" />, pos: 'right-[30%] top-[62%]', tone: 'bg-emerald-500 text-white' },
  { icon: <Award className="w-6 h-6" />, pos: 'right-[12%] top-[22%]', tone: 'bg-white text-neutral-900' },
  { icon: <Fingerprint className="w-6 h-6" />, pos: 'right-[44%] top-[78%]', tone: 'bg-neutral-200 text-neutral-900' },
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                              */
/* ------------------------------------------------------------------ */

const ScoreBadge: React.FC<{ category: Category; score: number }> = ({ category, score }) => {
  const m = CATEGORY_META[category];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${m.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label} · {score}
    </span>
  );
};

const PillButton: React.FC<{
  variant?: 'dark' | 'light';
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ variant = 'dark', onClick, children }) => (
  <button
    onClick={onClick}
    className={
      'inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium transition-colors ' +
      (variant === 'dark'
        ? 'bg-neutral-900 text-white hover:bg-neutral-700'
        : 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50')
    }
  >
    {children}
  </button>
);


const NAV_ITEMS = [
  { label: 'Ask VerifyIQ', to: '/ask' },
  { label: 'Sessions', to: '/sessions' },
  { label: 'ML Lab', to: '/ml-lab' },
  { label: 'Pricing', to: '/plans' },
];

/** Nav links with a pill that slides to whichever link is hovered or focused. */
const NavLinks: React.FC<{ onNavigate: (to: string) => void }> = ({ onNavigate }) => {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  const moveTo = (i: number) => {
    const el = itemRefs.current[i];
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  };

  return (
    <nav className="hidden md:flex relative items-center" onMouseLeave={() => setPill(null)}>
      <span
        aria-hidden
        className="absolute top-0 bottom-0 rounded-full bg-neutral-900/[0.06] transition-all duration-300 ease-out"
        style={{
          left: pill?.left ?? 0,
          width: pill?.width ?? 0,
          opacity: pill ? 1 : 0,
        }}
      />
      {NAV_ITEMS.map((item, i) => (
        <button
          key={item.to}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          onMouseEnter={() => moveTo(i)}
          onFocus={() => moveTo(i)}
          onBlur={() => setPill(null)}
          onClick={() => onNavigate(item.to)}
          className="relative px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 focus-visible:text-neutral-900 outline-none transition-colors"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

/** Small floating metric chips that drift with the cursor (parallax via CSS variables). */
const HeroChips: React.FC = () => {
  const chips: { icon: React.ReactNode; label: string; value: string; pos: string; depth: number; delay: string }[] = [
    { icon: <Activity className="w-4 h-4 text-emerald-600" />, label: 'Keystroke jitter', value: '42 ms', pos: 'left-[4%] top-[30%]', depth: 22, delay: '0s' },
    { icon: <ClipboardPaste className="w-4 h-4 text-amber-600" />, label: 'Paste ratio', value: '2%', pos: 'left-[10%] top-[62%]', depth: -16, delay: '1.2s' },
    { icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, label: 'Tests passed', value: '12 / 12', pos: 'right-[5%] top-[28%]', depth: -24, delay: '0.6s' },
    { icon: <Cpu className="w-4 h-4 text-neutral-700" />, label: 'Anomaly score', value: '18 · Normal', pos: 'right-[9%] top-[60%]', depth: 18, delay: '1.8s' },
  ];
  return (
    <div className="hidden xl:block absolute inset-0 pointer-events-none" aria-hidden>
      {chips.map((c) => (
        <div
          key={c.label}
          className={`absolute ${c.pos}`}
          style={{
            transform: `translate3d(calc(var(--mx, 0) * ${c.depth}px), calc(var(--my, 0) * ${c.depth * 0.7}px), 0)`,
            transition: 'transform 250ms ease-out',
          }}
        >
          <div
            className="viq-chip flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-md border border-neutral-200/80 px-4 py-3 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.25)]"
            style={{ animationDelay: c.delay }}
          >
            <span className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center">{c.icon}</span>
            <div className="leading-tight">
              <p className="text-[11px] text-neutral-500">{c.label}</p>
              <p className="text-sm font-semibold tabular-nums">{c.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Category>('normal');
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Header turns into a more solid, shadowed bar once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cursor position (-1..1) exposed as CSS variables for the hero parallax chips.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', String(((e.clientX - r.left) / r.width - 0.5) * 2));
      el.style.setProperty('--my', String(((e.clientY - r.top) / r.height - 0.5) * 2));
    };
    const onLeave = () => {
      el.style.setProperty('--mx', '0');
      el.style.setProperty('--my', '0');
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-white text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white"
      style={{ fontFamily: "'Inter Tight', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      <style>{`
        @keyframes viq-chip { 0%,100% { translate: 0 0; } 50% { translate: 0 -10px; } }
        @keyframes viq-hero-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .viq-chip { animation: viq-chip 6s ease-in-out infinite; }
        .viq-hero-in { animation: viq-hero-in 700ms cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .viq-chip, .viq-hero-in { animation: none !important; } }
      `}</style>

      {/* ---------------- Floating pill navbar ---------------- */}
      <header className="sticky top-0 z-40 px-4 pt-4">
        <div
          className={
            'mx-auto h-14 rounded-full pl-5 pr-3 flex items-center justify-between gap-4 backdrop-blur-xl border transition-all duration-300 ' +
            (scrolled
              ? 'max-w-2xl bg-white/85 border-neutral-200 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18)]'
              : 'max-w-3xl bg-white/55 border-white/70 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]')
          }
        >
          <button className="flex items-center gap-2" onClick={() => navigate('/')}>
            <span className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </span>
            <span className="text-lg font-semibold tracking-tight">VerifyIQ</span>
          </button>

          <NavLinks onNavigate={navigate} />

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-900/[0.06] rounded-full transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-700 rounded-full transition-colors"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section ref={heroRef} className="relative -mt-[72px] overflow-hidden">
        <HeroBackground />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 50% at 50% 48%, rgba(255,255,255,0.8), rgba(255,255,255,0) 72%)' }}
        />
        <HeroChips />
        <div className="relative max-w-5xl mx-auto px-6 pt-44 pb-24 text-center">
        <div className="viq-hero-in mx-auto w-[84px] h-[84px] rounded-[26px] bg-neutral-100 border border-neutral-200/70 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] flex items-center justify-center">
          <Shield className="w-9 h-9 text-neutral-900" strokeWidth={1.75} />
        </div>

        <h1 style={{ animationDelay: '80ms' }} className="viq-hero-in mt-10 text-5xl md:text-7xl font-semibold tracking-[-0.04em] leading-[1.02] max-w-4xl mx-auto">
          Assessment integrity through evidence, not accusations.
        </h1>

        <p style={{ animationDelay: '160ms' }} className="viq-hero-in mt-6 text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          Privacy-conscious behavioral telemetry, ML anomaly scoring (0–100), neutral AI evidence
          summaries and verifiable W3C credentials for every coding assessment.
        </p>

        <div style={{ animationDelay: '240ms' }} className="viq-hero-in mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <PillButton onClick={() => navigate('/ask')}>Open Examiner Console</PillButton>
          <PillButton variant="light" onClick={() => navigate('/candidate')}>
            Try Candidate Mode
            <span className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </span>
          </PillButton>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 text-sm text-neutral-500">
          <EyeOff className="w-4 h-4" />
          No keylogging. No webcam surveillance. Objective telemetry only.
        </div>

        {/* Tech strip */}
        <div className="mt-16">
          <p className="text-sm text-neutral-500">Built on a trusted, open stack</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xl font-semibold tracking-tight text-neutral-400">
            {TECH.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* ---------------- Product preview panel ---------------- */}
      <section className="px-4 md:px-6">
        <div className="max-w-6xl mx-auto rounded-[40px] bg-neutral-100 pt-10 md:pt-16 px-4 md:px-12 overflow-hidden">
          <div className="bg-white rounded-t-3xl px-5 md:px-8 pt-5 pb-10 shadow-[0_-2px_30px_rgba(0,0,0,0.04)]">
            {/* App top bar */}
            <div className="flex items-center gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-5 text-sm">
                <span className="font-medium text-neutral-900">Sessions</span>
                <span className="text-neutral-400">Candidates</span>
              </div>
              <div className="flex-1 max-w-md mx-auto h-10 rounded-full bg-neutral-100 flex items-center gap-2 px-4 text-sm text-neutral-400">
                <Search className="w-4 h-4 text-neutral-500" />
                Search sessions, candidates, signals…
              </div>
              <div className="hidden md:flex items-center gap-3">
                <span className="text-xs font-medium border border-neutral-200 rounded-full px-3 py-1.5">
                  Issue credential
                </span>
                <span className="w-8 h-8 rounded-full bg-neutral-300" />
              </div>
            </div>

            {/* Browse columns */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
              {EXPLORE_COLUMNS.map((col) => (
                <div key={col.heading}>
                  <p className="text-xs text-neutral-500 mb-2">{col.heading}</p>
                  <ul className="space-y-1">
                    {col.items.map((item) => (
                      <li key={item} className="text-lg md:text-xl font-semibold tracking-tight leading-snug">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Filter row */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <div className="inline-flex rounded-full bg-neutral-100 p-1">
                <span className="px-3 py-1 rounded-full bg-white shadow-sm font-medium">Live</span>
                <span className="px-3 py-1 text-neutral-500">Completed</span>
              </div>
              <span className="font-medium underline underline-offset-8 decoration-2">Latest</span>
              <span className="text-neutral-400">Highest score</span>
              <span className="text-neutral-400">Most flagged</span>
            </div>

            {/* Session preview cards */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['normal', 'review_recommended', 'high_anomaly_signal'] as Category[]).map((cat, i) => {
                const s = SAMPLE_SESSIONS[cat][0];
                return (
                  <div key={cat} className="rounded-3xl bg-neutral-100 p-5 flex flex-col justify-between min-h-[220px]">
                    <span className="self-start text-[11px] font-medium rounded-md bg-neutral-300/70 px-2 py-0.5 text-neutral-700">
                      {i === 0 ? 'New' : i === 1 ? 'Updated' : 'Flagged'}
                    </span>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold">{s.title}</p>
                      <div className="mt-3 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${CATEGORY_META[cat].bar}`}
                          style={{ width: `${SAMPLE_SESSIONS[cat][0].score}%` }}
                        />
                      </div>
                      <div className="mt-3">
                        <ScoreBadge category={cat} score={SAMPLE_SESSIONS[cat][0].score} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Big stat with floating icons ---------------- */}
      <section className="relative max-w-6xl mx-auto px-6 py-28 md:py-40 text-center overflow-hidden">
        <div className="hidden md:block">
          {FLOATING_ICONS.map((f, i) => (
            <div
              key={i}
              className={`absolute ${f.pos} w-16 h-16 rounded-[20px] ${f.tone} border border-neutral-200/70 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] flex items-center justify-center`}
            >
              {f.icon}
            </div>
          ))}
        </div>
        <p className="relative text-xl font-medium tracking-tight">Every session is measured across</p>
        <p className="relative mt-2 text-7xl md:text-9xl font-semibold tracking-[-0.05em] leading-none">
          19 signals
        </p>
        <p className="relative mt-6 text-neutral-500 max-w-xl mx-auto text-lg">
          Keystroke jitter, burstiness, paste ratios and time-to-first-run — extracted from timing
          streams, never from what the candidate types.
        </p>
      </section>

      {/* ---------------- Tabs: find the signal ---------------- */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.04em] text-center leading-[1.05]">
          Find the signal
          <br />
          in seconds.
        </h2>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex flex-wrap justify-center rounded-full bg-neutral-100 p-1.5 gap-1">
            {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
              <button
                key={c}
                onClick={() => setTab(c)}
                className={
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors ' +
                  (tab === c ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-900')
                }
              >
                {CATEGORY_META[c].label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-neutral-500 max-w-xl mx-auto">
          <span className="font-medium text-neutral-900">Score {CATEGORY_META[tab].range}.</span>{' '}
          {CATEGORY_META[tab].desc}
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {SAMPLE_SESSIONS[tab].map((s) => (
            <div key={s.title} className="rounded-[28px] border border-neutral-200 bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold tracking-tight">{s.title}</p>
                <span className="text-3xl font-semibold tracking-tight tabular-nums">{s.score}</span>
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                <div className={`h-full rounded-full ${CATEGORY_META[tab].bar}`} style={{ width: `${s.score}%` }} />
              </div>
              <ul className="mt-5 space-y-2.5">
                {s.signals.map((sig) => (
                  <li key={sig.text} className="flex items-center gap-2.5 text-sm text-neutral-600">
                    <span className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                      {sig.icon}
                    </span>
                    {sig.text}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <ScoreBadge category={tab} score={s.score} />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500">
          VerifyIQ never states “cheating proven” or “AI detected”. Scores are statistical signals that
          support human review.
        </p>
      </section>

      {/* ---------------- From telemetry to credential ---------------- */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.04em] text-center leading-[1.05]">
          From telemetry to credential.
        </h2>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div>
            <div className="rounded-[32px] bg-neutral-100 h-72 flex items-center justify-center p-6">
              <div className="w-full max-w-[270px] rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Cpu className="w-3.5 h-3.5" /> Why this score?
                </div>
                {[
                  ['Paste ratio', 72],
                  ['Window defocus', 48],
                  ['Typing jitter', 20],
                ].map(([k, v]) => (
                  <div key={k as string} className="mt-3">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{k}</span>
                      <span className="text-neutral-400 tabular-nums">+{v}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-neutral-900" style={{ width: `${v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <h3 className="mt-5 text-center text-lg font-semibold tracking-tight">Explainable ML scoring</h3>
            <p className="mt-1.5 text-center text-neutral-500 text-[15px] leading-relaxed px-4">
              Calibrated XGBoost and Random Forest ensemble with SHAP, so every score shows which
              signals moved it.
            </p>
          </div>

          {/* Card 2 */}
          <div>
            <div className="rounded-[32px] bg-neutral-100 h-72 flex items-center justify-center p-6">
              <div className="w-full max-w-[270px] rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <FileText className="w-3.5 h-3.5" /> Evidence summary
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-800">
                  Candidate pasted a single large block at 14:02 and ran no tests for the next 9
                  minutes. Typing before that was steady.
                </p>
                <div className="mt-3 rounded-xl bg-neutral-100 px-3 py-2 text-xs text-neutral-500">
                  Neutral wording. Final decision stays with the examiner.
                </div>
              </div>
            </div>
            <h3 className="mt-5 text-center text-lg font-semibold tracking-tight">Neutral AI evidence</h3>
            <p className="mt-1.5 text-center text-neutral-500 text-[15px] leading-relaxed px-4">
              AI turns raw telemetry into plain-language findings, with no accusations and no verdicts.
            </p>
          </div>

          {/* Card 3 */}
          <div>
            <div className="rounded-[32px] bg-neutral-100 h-72 flex items-center justify-center p-6">
              <div className="w-full max-w-[270px] rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Award className="w-3.5 h-3.5" /> Verifiable credential
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-neutral-900 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="text-xs space-y-1 text-neutral-600">
                    <p className="font-semibold text-neutral-900 text-sm">Backend Assessment</p>
                    <p>Signed with Ed25519</p>
                    <p className="inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" /> No telemetry inside
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="mt-5 text-center text-lg font-semibold tracking-tight">W3C digital credentials</h3>
            <p className="mt-1.5 text-center text-neutral-500 text-[15px] leading-relaxed px-4">
              Tamper-evident, QR-verifiable proof of the result, with zero behavioral data exposed.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- Sandboxed IDE strip ---------------- */}
      <section className="px-4 md:px-6 pb-24">
        <div className="max-w-6xl mx-auto rounded-[40px] bg-neutral-100 px-6 md:px-14 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.04em] leading-[1.05]">
              A sandboxed IDE your candidates already know.
            </h2>
            <p className="mt-5 text-neutral-500 text-lg leading-relaxed max-w-md">
              Monaco-powered editor with code executed in isolated Docker containers through Judge0 and
              checked by automated assertions.
            </p>
            <div className="mt-7">
              <PillButton variant="light" onClick={() => navigate('/candidate')}>
                Experience Candidate Focus Mode
              </PillButton>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 text-neutral-100 p-5 shadow-xl text-[13px] leading-relaxed font-mono">
            <div className="flex gap-1.5 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
            </div>
            <p className="text-neutral-500">def two_sum(nums, target):</p>
            <p className="pl-4">seen = {'{}'}</p>
            <p className="pl-4">for i, n in enumerate(nums):</p>
            <p className="pl-8">if target - n in seen:</p>
            <p className="pl-12">return [seen[target - n], i]</p>
            <p className="pl-8">seen[n] = i</p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> 12 / 12 tests passed
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="px-6 pb-28 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.04em] leading-[1.05]">
          Fair assessments start here.
        </h2>
        <p className="mt-5 text-lg text-neutral-500">
          Run your first assessment and see what evidence-based review looks like.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <PillButton onClick={() => navigate('/login')}>Join for free</PillButton>
          <PillButton variant="light" onClick={() => navigate('/plans')}>
            See our plans
            <span className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </span>
          </PillButton>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-neutral-200 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-neutral-900 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="font-semibold text-neutral-900">VerifyIQ</span>
          </div>
          <p>Behavioral telemetry and verified digital credentials for coding assessments.</p>
        </div>
      </footer>
    </div>
  );
};
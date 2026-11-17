import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Shield, CheckCircle2, QrCode, Cpu, Activity, Zap } from 'lucide-react';

/**
 * Shared visuals for the auth screens (Login + Register).
 * - <AuthStyles />  : keyframes and helper classes (render once per page)
 * - <AuthShowcase /> : animated right-hand panel
 */

const DEFAULT_SLIDES = [
  {
    title: 'Evidence, not accusations.',
    text: 'Every session gets an anomaly score from 0 to 100, built only from timing signals. No keylogging, no webcam.',
  },
  {
    title: 'Explainable by design.',
    text: 'SHAP breakdowns show exactly which behaviors moved a score, so reviewers can see the why.',
  },
  {
    title: 'Credentials anyone can verify.',
    text: 'Results are issued as signed W3C credentials with QR verification and no telemetry inside.',
  },
];

const SLIDE_MS = 5000;

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Animates a number from 0 to `target` whenever `trigger` changes. */
function useCountUp(target: number, trigger: unknown, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, trigger, duration]);
  return value;
}

/* ------------------------------------------------------------------ */
/* Side panel visuals                                                 */
/* ------------------------------------------------------------------ */

const ScoreGauge: React.FC<{ active: boolean }> = ({ active }) => {
  const score = useCountUp(31, active);
  const r = 70;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-[200px]">
      <svg viewBox="0 0 180 100" className="w-full">
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" strokeLinecap="round" />
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="#34d399"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="text-4xl font-semibold tracking-tight text-white tabular-nums">{score}</p>
        <p className="text-[11px] text-neutral-400">Normal distribution</p>
      </div>
    </div>
  );
};

const KeystrokeWave: React.FC = () => (
  <div className="flex items-end gap-[3px] h-12">
    {Array.from({ length: 34 }).map((_, i) => (
      <span
        key={i}
        className="viq-bar w-[3px] rounded-full bg-emerald-400/80"
        style={{ animationDelay: `${i * 55}ms`, ['--h' as any]: `${20 + ((i * 37) % 80)}%` }}
      />
    ))}
  </div>
);

const ShapBars: React.FC<{ active: boolean }> = ({ active }) => {
  const rows = useMemo(
    () => [
      { k: 'Paste ratio', v: 72 },
      { k: 'Window defocus', v: 48 },
      { k: 'Typing jitter', v: 26 },
      { k: 'Time to first run', v: 14 },
    ],
    []
  );
  return (
    <div className="w-[260px] space-y-3">
      {rows.map((r, i) => (
        <div key={r.k}>
          <div className="flex justify-between text-xs text-neutral-300">
            <span>{r.k}</span>
            <span className="tabular-nums text-neutral-500">+{r.v}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-[width] duration-1000 ease-out"
              style={{ width: active ? `${r.v}%` : '0%', transitionDelay: `${i * 120}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const CredentialCard: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="w-[270px] flex items-center gap-4">
    <div className="relative w-24 h-24 rounded-2xl bg-white flex items-center justify-center overflow-hidden">
      <QrCode className="w-16 h-16 text-neutral-900" strokeWidth={1.5} />
      {active && <span className="viq-scan absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_12px_#10b981]" />}
    </div>
    <div className="text-xs text-neutral-300 space-y-1.5">
      <p className="text-sm font-semibold text-white">Backend Assessment</p>
      <p>Signed with Ed25519</p>
      <p className="inline-flex items-center gap-1 text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
      </p>
    </div>
  </div>
);

export const AuthShowcase: React.FC<{ slides?: { title: string; text: string }[] }> = ({ slides = DEFAULT_SLIDES }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, paused]);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  }, []);

  const depth = (d: number) => ({
    transform: `translate3d(${tilt.x * d}px, ${tilt.y * d}px, 0)`,
    transition: 'transform 200ms ease-out',
  });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        setTilt({ x: 0, y: 0 });
        setPaused(false);
      }}
      onMouseEnter={() => setPaused(true)}
      className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-[32px] bg-neutral-950 p-10 text-white"
    >
      {/* Background layers */}
      <div className="absolute inset-0 viq-grid opacity-[0.35]" />
      <div className="viq-orb absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="viq-orb-2 absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-teal-400/20 blur-3xl" />

      {/* Top brand */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-300" />
          </span>
          <span className="font-semibold tracking-tight">VerifyIQ</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs text-neutral-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live session monitoring
        </span>
      </div>

      {/* Center stage */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* back floating chips */}
        <div style={depth(-18)} className="absolute left-0 top-[12%] viq-float">
          <div className="rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur px-4 py-3 flex items-center gap-3">
            <Activity className="w-4 h-4 text-emerald-300" />
            <div>
              <p className="text-[11px] text-neutral-400">Keystroke jitter</p>
              <p className="text-sm font-medium tabular-nums">42 ms</p>
            </div>
          </div>
        </div>
        <div style={depth(22)} className="absolute right-0 bottom-[10%] viq-float-2">
          <div className="rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur px-4 py-3 flex items-center gap-3">
            <Zap className="w-4 h-4 text-amber-300" />
            <div>
              <p className="text-[11px] text-neutral-400">Tests passed</p>
              <p className="text-sm font-medium tabular-nums">12 / 12</p>
            </div>
          </div>
        </div>

        {/* main glass card */}
        <div style={depth(10)} className="relative">
          <div className="rounded-[28px] bg-white/[0.07] border border-white/12 backdrop-blur-xl p-8 w-[340px] min-h-[260px] shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
              <Cpu className="w-3.5 h-3.5" />
              {index === 0 ? 'Anomaly score' : index === 1 ? 'Why this score?' : 'Verifiable credential'}
            </div>
            <div className="flex items-center justify-center min-h-[140px]">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={
                    'transition-all duration-500 ' +
                    (i === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none absolute')
                  }
                >
                  {i === 0 && (
                    <div className="flex flex-col items-center gap-5">
                      <ScoreGauge active={index === 0} />
                      <KeystrokeWave />
                    </div>
                  )}
                  {i === 1 && <ShapBars active={index === 1} />}
                  {i === 2 && <CredentialCard active={index === 2} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copy + progress */}
      <div className="relative">
        <div className="min-h-[132px]">
          <h2 key={index} className="viq-rise text-3xl xl:text-4xl font-semibold tracking-[-0.03em] leading-[1.1]">
            {slides[index].title}
          </h2>
          <p key={`p${index}`} className="viq-rise mt-3 text-neutral-400 max-w-md leading-relaxed">
            {slides[index].text}
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="relative h-1.5 rounded-full bg-white/15 overflow-hidden transition-all duration-300"
              style={{ width: i === index ? 56 : 20 }}
            >
              {i === index && (
                <span
                  key={`${index}-${paused}`}
                  className="viq-progress absolute inset-y-0 left-0 bg-white rounded-full"
                  style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AuthStyles: React.FC = () => (
    <style>{`
      @keyframes viq-bar { 0%,100% { height: 15%; } 50% { height: var(--h); } }
      @keyframes viq-float { 0%,100% { translate: 0 0; } 50% { translate: 0 -12px; } }
      @keyframes viq-orb { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,30px) scale(1.15); } }
      @keyframes viq-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      @keyframes viq-progress { from { width: 0; } to { width: 100%; } }
      @keyframes viq-scan { 0% { top: 8%; } 50% { top: 88%; } 100% { top: 8%; } }
      @keyframes viq-shake { 0%,100% { transform: none; } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
      @keyframes viq-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      .viq-bar { height: 15%; animation: viq-bar 1.5s ease-in-out infinite; }
      .viq-float { animation: viq-float 6s ease-in-out infinite; }
      .viq-float-2 { animation: viq-float 7.5s ease-in-out infinite reverse; }
      .viq-orb { animation: viq-orb 14s ease-in-out infinite; }
      .viq-orb-2 { animation: viq-orb 18s ease-in-out infinite reverse; }
      .viq-rise { animation: viq-rise 600ms cubic-bezier(.2,.7,.2,1) both; }
      .viq-progress { animation-name: viq-progress; animation-timing-function: linear; animation-fill-mode: forwards; }
      .viq-scan { animation: viq-scan 2.2s ease-in-out infinite; }
      .viq-shake { animation: viq-shake 450ms ease; }
      .viq-in { animation: viq-in 500ms cubic-bezier(.2,.7,.2,1) both; }
      .viq-grid {
        background-image: radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px);
        background-size: 26px 26px;
        mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
      }
      @media (prefers-reduced-motion: reduce) {
        .viq-bar, .viq-float, .viq-float-2, .viq-orb, .viq-orb-2, .viq-scan, .viq-rise, .viq-in { animation: none !important; }
      }
    `}</style>
);
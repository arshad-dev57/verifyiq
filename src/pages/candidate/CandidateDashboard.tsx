import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidateDashboard } from '../../hooks/queries';
import { formatDate } from '../../lib/utils';
import {
  FileCode,
  Award,
  CheckCircle2,
  Clock,
  Shield,
  ShieldCheck,
  ArrowRight,
  Terminal,
  ListChecks,
  Target,
  Lock,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Animates 0 -> target once when the target changes. */
function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const scoreTone = (score: number) =>
  score >= 80
    ? { stroke: 'stroke-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' }
    : score >= 50
    ? { stroke: 'stroke-amber-500', text: 'text-amber-600 dark:text-amber-400' }
    : { stroke: 'stroke-rose-500', text: 'text-rose-600 dark:text-rose-400' };

const difficultyChip = (d?: string) => {
  switch ((d || 'medium').toLowerCase()) {
    case 'easy':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
    case 'hard':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300';
    default:
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
  }
};

/* Shared class strings so light/dark stay consistent across the page */
const SURFACE =
  'rounded-3xl border border-[#e0ded8] bg-[#f8f7f4] dark:border-neutral-800 dark:bg-neutral-900/70';
const MUTED = 'text-neutral-600 dark:text-neutral-400';
const BTN_PRIMARY =
  'group inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300';
const BTN_OUTLINE =
  'group inline-flex items-center justify-center gap-1.5 rounded-full border border-[#e0ded8] bg-[#f8f7f4] px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-[#efede8] active:scale-[0.98] dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800';

const Skel: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-[#e2e0da] dark:bg-neutral-800 ${className}`} />
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
  delay: number;
}> = ({ icon, label, value, suffix = '', hint, delay }) => {
  const shown = useCountUp(value);
  return (
    <div className={`${SURFACE} viq-rise p-5`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ebe9e3] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
        {shown}
        <span className="text-xl text-neutral-400">{suffix}</span>
      </p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      {hint && <p className={`mt-0.5 text-xs ${MUTED}`}>{hint}</p>}
    </div>
  );
};

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const r = 24;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Number(score) || 0));
  const tone = scoreTone(pct);
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" strokeWidth="5" className="stroke-[#dedcd5] dark:stroke-neutral-800" />
        <circle
          cx="30"
          cy="30"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className={`${tone.stroke} transition-[stroke-dashoffset] duration-1000 ease-out`}
          strokeDasharray={c}
          strokeDashoffset={ready ? c - (pct / 100) * c : c}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums ${tone.text}`}>
        {pct}%
      </span>
    </div>
  );
};

const SectionTitle: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => (
  <div className="flex items-end justify-between">
    <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
    {hint && <span className={`text-xs ${MUTED}`}>{hint}</span>}
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export const CandidateDashboard: React.FC = () => {
  const { data, isLoading } = useCandidateDashboard();
  const navigate = useNavigate();

  const styles = (
    <style>{`
      @keyframes viq-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      .viq-rise { animation: viq-rise 550ms cubic-bezier(.2,.7,.2,1) both; }
      @media (prefers-reduced-motion: reduce) { .viq-rise { animation: none !important; } }
    `}</style>
  );

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        {styles}
        <Skel className="h-14 w-72" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skel key={i} className="h-36" />
          ))}
        </div>
        <Skel className="h-72 w-full rounded-3xl" />
        <Skel className="h-56 w-full rounded-3xl" />
      </div>
    );
  }

  const candidateUser = data.user || data.candidate || {
    name: 'Candidate',
    pseudonym_id: 'cnd-verified',
  };
  const active_assessment =
    data.active_assessment ||
    (data.available_assessments && data.available_assessments.length > 0 ? data.available_assessments[0] : null);
  const recent_sessions = data.recent_sessions || [];
  const credentials = data.credentials || [];
  const available_assessments = data.available_assessments || [];

  // Derived stats
  const scores = recent_sessions.map((s: any) => Number(s.score) || 0);
  const avgScore = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
  const testsPassed = recent_sessions.reduce((a: number, s: any) => a + (Number(s.tests_passed) || 0), 0);
  const testsTotal = recent_sessions.reduce((a: number, s: any) => a + (Number(s.tests_total) || 0), 0);

  const onSpotlight = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 text-neutral-800 dark:text-neutral-100">
      {styles}

      {/* ---------------- Welcome header ---------------- */}
      <div className="viq-rise flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className={`text-sm ${MUTED}`}>{greeting()},</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{candidateUser.name}</h1>
          <p className={`mt-2 flex items-center gap-2 text-sm ${MUTED}`}>
            <span className="rounded-full bg-[#ebe9e3] px-2.5 py-0.5 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {candidateUser.pseudonym_id}
            </span>
            Your identity stays pseudonymous during assessments.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#e0ded8] bg-[#f8f7f4] px-4 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900/70 sm:self-auto">
          <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium tabular-nums">{credentials.length}</span>
          <span className={MUTED}>issued credentials</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard delay={40} icon={<ListChecks className="h-4 w-4" />} label="Completed" value={recent_sessions.length} hint="assessments submitted" />
        <StatCard delay={100} icon={<Target className="h-4 w-4" />} label="Average score" value={avgScore} suffix="%" hint="across completed sessions" />
        <StatCard
          delay={160}
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Tests verified"
          value={testsPassed}
          suffix={testsTotal ? ` / ${testsTotal}` : ''}
          hint="passed vs. total"
        />
        <StatCard delay={220} icon={<Award className="h-4 w-4" />} label="Credentials" value={credentials.length} hint="Ed25519 verifiable badges" />
      </div>

      {active_assessment ? (
        <div
          onMouseMove={onSpotlight}
          className="viq-rise group relative overflow-hidden rounded-[32px] border border-[#dcdad3] bg-[#e9e7e1] p-6 dark:border-neutral-800 dark:bg-neutral-900 md:p-10"
          style={{ animationDelay: '260ms' }}
        >
                    <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), rgba(16,185,129,0.14), transparent 60%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(0,0,0,0.12)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom_right,black,transparent_70%)] dark:[background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)]"
          />

          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Shield className="h-3.5 w-3.5" /> Assigned assessment
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{active_assessment.title}</h2>
              <p className={`mt-3 max-w-xl leading-relaxed ${MUTED}`}>{active_assessment.description}</p>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d6d4cd] bg-[#f8f7f4]/70 px-3 py-1.5 backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/60">
                  <Clock className="h-3.5 w-3.5" /> {active_assessment.duration_minutes} minutes
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d6d4cd] bg-[#f8f7f4]/70 px-3 py-1.5 backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/60">
                  <Lock className="h-3.5 w-3.5" /> Timing intervals only
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d6d4cd] bg-[#f8f7f4]/70 px-3 py-1.5 backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/60">
                  <Terminal className="h-3.5 w-3.5" /> Monaco sandboxed IDE
                </span>
              </div>

              <button
                onClick={() =>
                  navigate(`/candidate/consent?assessment_id=${encodeURIComponent(active_assessment.id)}`)
                }
                className={`${BTN_PRIMARY} mt-8`}
              >
                Start pre-check &amp; consent
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            <ol className="relative space-y-4 rounded-3xl border border-[#e0ded8] bg-[#f8f7f4]/80 p-6 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/50">
              <p className="text-sm font-semibold">What happens next</p>
              {[
                { icon: <ShieldCheck className="h-4 w-4" />, title: 'Pre-check and consent', text: 'Review what is measured before you begin.' },
                { icon: <FileCode className="h-4 w-4" />, title: 'Solve in the IDE', text: 'Write and run code with automated tests.' },
                { icon: <Award className="h-4 w-4" />, title: 'Earn your credential', text: 'Passing results become a verifiable badge.' },
              ].map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                    {s.icon}
                    {i < 2 && (
                      <span className="absolute left-1/2 top-9 h-4 w-px -translate-x-1/2 bg-neutral-300 dark:bg-neutral-700" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-tight">{s.title}</p>
                    <p className={`mt-0.5 text-xs ${MUTED}`}>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className={`${SURFACE} viq-rise flex flex-col items-center px-6 py-14 text-center`} style={{ animationDelay: '260ms' }}>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ebe9e3] dark:bg-neutral-800">
            <FileCode className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-lg font-semibold">No active assessment assigned</h3>
          <p className={`mt-1 max-w-sm text-sm ${MUTED}`}>
            Check back soon or ask your examiner for your invitation link.
          </p>
        </div>
      )}
      {available_assessments.length > 1 && (
        <section className="space-y-4">
          <SectionTitle title="Available assessments" hint={`${available_assessments.length - 1} more to take`} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {available_assessments.slice(1).map((asm: any, i: number) => (
              <div
                key={asm.id}
                className={`${SURFACE} viq-rise flex flex-col justify-between p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-18px_rgba(0,0,0,0.3)] dark:hover:border-neutral-700`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${difficultyChip(asm.difficulty)}`}>
                      {asm.difficulty || 'medium'}
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${MUTED}`}>
                      <Clock className="h-3.5 w-3.5" /> {asm.duration_minutes} min
                    </span>
                  </div>
                  <h4 className="text-base font-semibold tracking-tight">{asm.title}</h4>
                  <p className={`mt-1.5 line-clamp-2 text-sm ${MUTED}`}>{asm.description}</p>
                </div>
                <div className="mt-5 flex justify-end border-t border-[#e4e2dc] pt-4 dark:border-neutral-800">
                  <button
                    onClick={() =>
                      navigate(`/candidate/consent?assessment_id=${encodeURIComponent(asm.id)}`)
                    }
                    className={BTN_OUTLINE}
                  >
                    Take assessment
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="space-y-4 pb-6">
        <SectionTitle title="Completed submissions and badges" hint={recent_sessions.length ? `${recent_sessions.length} total` : undefined} />

        {recent_sessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recent_sessions.map((session: any, i: number) => {
              const total = Number(session.tests_total) || 0;
              const passed = Number(session.tests_passed) || 0;
              const pct = total ? Math.round((passed / total) * 100) : 0;
              return (
                <div
                  key={session.id}
                  className={`${SURFACE} viq-rise p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-18px_rgba(0,0,0,0.3)] dark:hover:border-neutral-700`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <ScoreRing score={session.score} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold tracking-tight">{session.assessment_title}</p>
                      <p className={`mt-0.5 text-xs ${MUTED}`}>Completed {formatDate(session.start_time)}</p>
                      <p className="mt-1 font-mono text-[11px] text-neutral-400">{session.id}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={MUTED}>Tests verified</span>
                      <span className="font-medium tabular-nums">
                        {passed}/{total}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#ebe9e3] dark:bg-neutral-800">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end border-t border-[#e4e2dc] pt-4 dark:border-neutral-800">
                    <button onClick={() => navigate(`/candidate/result?session_id=${session.id}`)} className={BTN_OUTLINE}>
                      View result
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`${SURFACE} flex flex-col items-center px-6 py-12 text-center`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <h4 className="mt-4 text-base font-semibold">No submissions yet</h4>
            <p className={`mt-1 max-w-md text-sm ${MUTED}`}>
              Take your first assessment above to earn an Ed25519 verifiable credential badge.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
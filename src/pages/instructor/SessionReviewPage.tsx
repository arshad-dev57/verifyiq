import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useSession,
  useSessionAnalysis,
  useSessionEvents,
  useSessionCodeHistory,
  useSubmitReview,
  useIssueCredential,
} from '../../hooks/queries';
import { AnomalyBadge } from '../../components/ui/AnomalyBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useThemeStore } from '../../stores/themeStore';
import { SourceCard } from '../../components/ui/SourceCard';
import { StreamingMarkdown } from '../../components/ui/StreamingMarkdown';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ArrowLeft,
  Sparkles,
  Sliders,
  History,
  FileCode2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Award,
  Clock,
  Code,
  Eye,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { getFeatureFriendlyName, formatDuration, formatDate } from '../../lib/utils';
import { ReviewDecision } from '../../types';

export const SessionReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useThemeStore();
  const sessionId = id || 'S-1003';

  const [activeTab, setActiveTab] = useState<'features' | 'timeline' | 'code' | 'rules' | 'decision'>('features');

  // Decision form state
  const [decision, setDecision] = useState<ReviewDecision>('cleared');
  const [notes, setNotes] = useState('');
  const [decisionSuccess, setDecisionSuccess] = useState(false);

  // Code replay snapshot index
  const [currentSnapshotIdx, setCurrentSnapshotIdx] = useState(0);

  const { data: session, isLoading: isSessionLoading } = useSession(sessionId);
  const { data: analysis, isLoading: isAnalysisLoading } = useSessionAnalysis(sessionId);
  const { data: events, isLoading: isEventsLoading } = useSessionEvents(sessionId);
  const { data: codeSnapshots, isLoading: isCodeLoading } = useSessionCodeHistory(sessionId);

  const submitReviewMutation = useSubmitReview();
  const issueCredentialMutation = useIssueCredential();

  if (isSessionLoading || isAnalysisLoading || !session || !analysis) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReviewMutation.mutateAsync({
      sessionId,
      decision,
      notes: notes || `Audit decision recorded by examiner: ${decision}.`,
    });
    setDecisionSuccess(true);
    setTimeout(() => setDecisionSuccess(false), 3000);
  };

  const handleIssueCredential = async () => {
    await issueCredentialMutation.mutateAsync(sessionId);
    navigate('/credentials');
  };

  // Convert top features to source items for display
  const evidenceSources = analysis.top_features.map((feat, idx) => ({
    type: 'feature' as const,
    id: String(feat.feature_name),
    label: feat.label,
    snippet: `Observed: ${feat.observed_value.toFixed(2)}${feat.unit || ''} (Reference Range: ${feat.reference_min}–${feat.reference_max})`,
    anomaly_score: analysis.anomaly_score,
    category: analysis.category,
  }));

  // Chart data for features comparison
  const featureChartData = analysis.top_features.map((feat) => ({
    name: feat.label,
    observed: feat.observed_value,
    refMax: feat.reference_max,
    refMin: feat.reference_min,
    deviation: feat.deviation_type,
  }));

  const activeSnapshot = codeSnapshots?.[currentSnapshotIdx] || codeSnapshots?.[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Top Breadcrumb & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sessions')}
            className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-text-primary">{session.id}</h1>
              <AnomalyBadge
                category={session.category}
                score={session.anomaly_score}
                size="md"
              />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Candidate: <span className="text-text-secondary font-medium">{session.candidate_name}</span>{' '}
              <span className="font-mono text-text-subtle">({session.pseudonym_id})</span> •{' '}
              {session.assessment_title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-text-secondary font-mono">
              Score: {session.score}%
            </div>
            <div className="text-[11px] text-text-subtle">
              {session.tests_passed}/{session.tests_total} Unit Tests Passed
            </div>
          </div>
          {session.review_decision && (
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium ${
                session.review_decision === 'cleared'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {session.review_decision === 'cleared' ? 'Decision: Cleared' : 'Decision: Needs Follow-up'}
            </div>
          )}
        </div>
      </div>

      {/* TOP: AI-Written Evidence Summary Banner (Strict Neutral Language) */}
      <Card className="p-6 bg-surface border-border shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Machine-Generated Behavioral Evidence Summary
            </span>
          </div>
          <span className="text-[11px] font-mono text-text-subtle">
            Model: {analysis.model_used}
          </span>
        </div>

        <div className="bg-surface-elevated/80 rounded-xl p-4 border border-border/80">
          <StreamingMarkdown content={analysis.summary_text} />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-text-subtle">
          <span>Prompt Policy: Strictly neutral evidence • Speculation prohibited</span>
          <span className="text-teal-400/90 font-medium">
            Behavioral signal only — not proof of misconduct
          </span>
        </div>
      </Card>

      {/* Grounded Source & Evidence Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-text-muted">
          <span>Key Behavioral Deviation Indicators ({evidenceSources.length})</span>
          <span className="text-[11px] text-text-subtle font-normal normal-case">
            Ranked by SHAP contribution to anomaly score
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {evidenceSources.map((source, idx) => (
            <SourceCard key={source.id} source={source} index={idx} />
          ))}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-border flex items-center gap-2">
        {[
          { key: 'features', label: '19 Behavioral Features', icon: Sliders },
          { key: 'timeline', label: 'Event Timeline', icon: History, count: events?.length },
          { key: 'code', label: 'Code Replay', icon: FileCode2, count: codeSnapshots?.length },
          { key: 'rules', label: 'Triggered Rules', icon: ShieldAlert, count: analysis.triggered_rules.length },
          { key: 'decision', label: 'Examiner Decision', icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-xs transition-colors ${
                isActive
                  ? 'border-teal-500 text-teal-300'
                  : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-surface-elevated text-text-muted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: 19 FEATURES DEEP DIVE */}
      {activeTab === 'features' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Feature Deviations Chart */}
          <Card className="p-6 bg-surface border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Top Telemetry Features vs. Normal Cohort Bounds
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Green and amber bars indicate candidate values; horizontal markers denote the expected upper reference bound.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#171A21' : '#FFFFFF',
                      borderColor: isDark ? '#262B36' : '#E2E8F0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: isDark ? '#F1F5F9' : '#0F172A',
                      boxShadow: isDark ? 'none' : '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
                    }}
                    itemStyle={{
                      color: isDark ? '#F1F5F9' : '#0F172A',
                    }}
                  />
                  <Bar dataKey="observed" radius={[6, 6, 0, 0]}>
                    {featureChartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.deviation === 'elevated' ? '#F43F5E' : entry.deviation === 'suppressed' ? '#F59E0B' : '#10B981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Complete 19 Features Table */}
          <Card className="overflow-hidden p-0 bg-surface border-border">
            <div className="p-4 border-b border-border bg-surface-elevated/40 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-text-primary">
                  All 19 Behavioral Features
                </h4>
                <p className="text-[11px] text-text-muted">
                  Extracted from privacy-safe event timing stream (no character contents recorded).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated text-text-muted font-medium">
                    <th className="px-4 py-2.5">Feature Name</th>
                    <th className="px-4 py-2.5">Observed Value</th>
                    <th className="px-4 py-2.5">Cohort Normal Range (Min–Max)</th>
                    <th className="px-4 py-2.5">Cohort Median</th>
                    <th className="px-4 py-2.5 text-right">Variance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {Object.entries(analysis.features).map(([featKey, val]) => {
                    const stats = analysis.reference_stats[featKey] || { min: 0, max: 1, mean: 0.5 };
                    const isElevated = val > stats.max;
                    const isSuppressed = val < stats.min;
                    const isNormal = !isElevated && !isSuppressed;

                    return (
                      <tr key={featKey} className="hover:bg-surface-elevated/40 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-text-secondary">
                          {getFeatureFriendlyName(featKey)}
                        </td>
                        <td className="px-4 py-2.5 font-mono font-semibold text-text-primary">
                          {typeof val === 'number' ? val.toFixed(2) : val}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-text-muted">
                          {stats.min} – {stats.max}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-text-subtle">
                          {stats.mean}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {isElevated ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              Elevated
                            </span>
                          ) : isSuppressed ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              Suppressed
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: TIMELINE */}
      {activeTab === 'timeline' && (
        <Card className="p-6 bg-surface border-border space-y-4 animate-in fade-in duration-150">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Raw Behavioral Event Chronology
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Chronological sequence of telemetry events. Content is redacted; only timing and sizes are stored.
            </p>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
            {events?.map((evt, idx) => {
              const startMs = events[0].ts_ms;
              const relativeSec = Math.floor((evt.ts_ms - startMs) / 1000);
              const isPaste = evt.event_type === 'paste';
              const isBlur = evt.event_type === 'blur';
              const isTest = evt.event_type === 'run_test';

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Dot indicator */}
                  <span
                    className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-surface ${
                      isPaste
                        ? 'bg-rose-500 ring-4 ring-rose-500/20'
                        : isBlur
                        ? 'bg-amber-400'
                        : isTest
                        ? 'bg-teal-400'
                        : 'bg-surface-elevated'
                    }`}
                  />

                  <div className="flex-1 bg-surface-elevated/70 p-3 rounded-xl border border-border/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-semibold text-text-secondary uppercase">
                        {evt.event_type.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-text-subtle">
                        +{formatDuration(relativeSec)}
                      </span>
                    </div>

                    <div className="text-xs text-text-muted">
                      {isPaste && (
                        <span className="text-rose-300 font-mono">
                          Pasted block: {evt.metadata.paste_length} characters
                        </span>
                      )}
                      {evt.event_type === 'key_interval' && (
                        <span className="font-mono">
                          Keystroke delta: {evt.metadata.inter_key_ms}ms
                        </span>
                      )}
                      {evt.event_type === 'code_change' && (
                        <span className="font-mono">
                          Chars added: +{evt.metadata.chars_added}, removed: -{evt.metadata.chars_removed || 0}
                        </span>
                      )}
                      {isBlur && (
                        <span className="text-amber-300">
                          Window focus lost (candidate switched tabs/apps)
                        </span>
                      )}
                      {isTest && (
                        <span className="text-teal-300 font-mono">
                          Execution #{evt.metadata.test_run_index}: {evt.metadata.test_passed ? 'PASSED' : 'FAILED'}
                        </span>
                      )}
                      {evt.metadata.reason && !isBlur && (
                        <span className="text-text-subtle ml-2">({evt.metadata.reason})</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB 3: CODE REPLAY */}
      {activeTab === 'code' && (
        <Card className="p-6 bg-surface border-border space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-teal-400" />
                Step-by-Step Code Construction Playback
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Snapshot {currentSnapshotIdx + 1} of {codeSnapshots?.length || 1}:{' '}
                <span className="text-text-secondary font-medium">
                  {activeSnapshot?.action_label || 'Code State'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentSnapshotIdx <= 0}
                onClick={() => setCurrentSnapshotIdx((prev) => prev - 1)}
              >
                Previous Step
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={!codeSnapshots || currentSnapshotIdx >= codeSnapshots.length - 1}
                onClick={() => setCurrentSnapshotIdx((prev) => prev + 1)}
              >
                Next Step
              </Button>
            </div>
          </div>

          {/* Slider */}
          {codeSnapshots && codeSnapshots.length > 1 && (
            <div className="px-2 py-2 bg-surface-elevated rounded-xl">
              <input
                type="range"
                min={0}
                max={codeSnapshots.length - 1}
                value={currentSnapshotIdx}
                onChange={(e) => setCurrentSnapshotIdx(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-text-subtle font-mono mt-1">
                <span>Start</span>
                <span>Submitted Solution</span>
              </div>
            </div>
          )}

          {/* Code Viewer */}
          <div className="bg-surface-elevated border border-border rounded-xl p-4 overflow-x-auto font-mono text-xs leading-relaxed text-text-primary max-h-[500px]">
            <pre>{activeSnapshot?.code || session.final_code}</pre>
          </div>
        </Card>
      )}

      {/* TAB 4: TRIGGERED RULES */}
      {activeTab === 'rules' && (
        <Card className="p-6 bg-surface border-border space-y-4 animate-in fade-in duration-150">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Deterministic Heuristic Triggers
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Configured boundary policies evaluated alongside the statistical ML model.
            </p>
          </div>

          {analysis.triggered_rules.length > 0 ? (
            <div className="space-y-3">
              {analysis.triggered_rules.map((rule) => (
                <div
                  key={rule.rule_id}
                  className="p-4 rounded-xl bg-surface-elevated/70 border border-border/80 flex items-start gap-3"
                >
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      rule.severity === 'high' ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-semibold text-text-secondary">
                        {rule.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                        {rule.rule_id}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed mb-2">
                      {rule.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-[11px] font-mono text-text-muted bg-surface/60 p-2 rounded-lg">
                      <span>Observed: <strong className="text-rose-300">{rule.observed_metric}</strong></span>
                      <span>Condition: <code>{rule.threshold_condition}</code></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-text-muted">
              <ShieldAlert className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-medium text-text-secondary">No Heuristic Rules Triggered</p>
              <p className="text-xs text-text-subtle mt-1">
                Candidate telemetry adhered to all standard timing and clipboard thresholds.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* TAB 5: EXAMINER DECISION & AUDIT LOG */}
      {activeTab === 'decision' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <Card className="p-6 bg-surface border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Record Formal Examiner Audit Decision
            </h3>
            <p className="text-xs text-text-muted mb-4">
              All examiner decisions and notes are cryptographically logged in the tamper-evident audit journal.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Examiner Determination:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('cleared')}
                    className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      decision === 'cleared'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-surface-elevated border-border text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Cleared
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('needs_followup')}
                    className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      decision === 'needs_followup'
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : 'bg-surface-elevated border-border text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" /> Needs Follow-up
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Examiner Audit Notes:
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record rationale (e.g. candidate justified external documentation lookup, or scheduled oral code walkthrough)..."
                  className="w-full bg-surface-elevated border border-border rounded-xl p-3 text-xs text-text-secondary placeholder:text-text-subtle focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitReviewMutation.isPending}
                >
                  Save Decision to Audit Log
                </Button>

                {decisionSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Decision logged!
                  </span>
                )}
              </div>
            </form>
          </Card>

          {/* Credential Issuance Section */}
          <Card className="p-6 bg-surface border-border flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-3">
                <Award className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                W3C Verifiable Digital Credential
              </h3>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                If the session has passed all test cases and the examiner has certified the session as Cleared, issue a cryptographically signed Ed25519 digital credential with QR code.
              </p>

              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border text-xs space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-text-muted">Tests Verification:</span>
                  <span className="text-text-secondary font-mono">
                    {session.tests_passed}/{session.tests_total} ({session.score}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Examiner Review:</span>
                  <span className="text-text-secondary font-medium">
                    {session.review_decision || 'Pending determination'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Cryptographic Standard:</span>
                  <span className="text-teal-400 font-mono">Ed25519Signature2020</span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={handleIssueCredential}
              disabled={session.score! < 70 || session.review_decision === 'needs_followup'}
              className="w-full"
            >
              <Award className="w-4 h-4 text-teal-400 mr-2" />
              Issue Verifiable Credential
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

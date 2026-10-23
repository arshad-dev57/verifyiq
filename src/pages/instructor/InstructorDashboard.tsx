import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/queries';
import { useThemeStore } from '../../stores/themeStore';
import { Card } from '../../components/ui/Card';
import { AnomalyBadge } from '../../components/ui/AnomalyBadge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const InstructorDashboard: React.FC = () => {
  const { data, isLoading } = useAdminDashboard();
  const navigate = useNavigate();
  const { isDark } = useThemeStore();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-elevated animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const stats = data.stats || {
    total_sessions: data.kpis?.total_sessions ?? 0,
    total_candidates: data.kpis?.total_candidates ?? 0,
    total_assessments: data.kpis?.total_assessments ?? 0,
    credentials_issued: data.kpis?.total_credentials ?? 0,
    review_recommended_count: data.category_breakdown?.review_recommended ?? 0,
    high_anomaly_count: data.category_breakdown?.high_anomaly_signal ?? 0,
    normal_percentage: data.kpis?.total_sessions
      ? Math.round(((data.category_breakdown?.normal ?? 0) / data.kpis.total_sessions) * 100)
      : 100,
    active_model: data.active_model?.name ?? 'rule_based',
  };

  const rawDistribution = data.distribution || data.score_distribution || [];
  const distribution = rawDistribution.map((d: any) => ({
    bin: d.bin || d.bucket || '0-20',
    count: d.count ?? 0,
  }));

  const rawFlagged = data.recent_flagged || data.recent_flagged_sessions || [];
  const recent_flagged = rawFlagged.map((s: any) => ({
    id: s.id,
    candidate_name: s.candidate_name || s.candidate_pseudonym || 'Candidate',
    pseudonym_id: s.pseudonym_id || s.candidate_pseudonym || 'Unknown',
    assessment_title: s.assessment_title || 'Programming Assessment',
    category: s.category || 'normal',
    anomaly_score: s.anomaly_score ?? 0,
    score: s.score ?? 0,
    tests_passed: s.tests_passed ?? 0,
    tests_total: s.tests_total ?? 0,
  }));

  const kpis = [
    {
      label: 'Total Sessions Evaluated',
      value: stats.total_sessions ?? 0,
      sub: `${stats.normal_percentage ?? 100}% within normal distribution`,
      icon: Activity,
      color: 'text-teal-400',
    },
    {
      label: 'Review Recommended',
      value: stats.review_recommended_count ?? 0,
      sub: 'Moderate behavioral variance',
      icon: AlertTriangle,
      color: 'text-amber-400',
    },
    {
      label: 'High Anomaly Signal',
      value: stats.high_anomaly_count ?? 0,
      sub: 'Significant telemetry deviation',
      icon: AlertTriangle,
      color: 'text-rose-400',
    },
    {
      label: 'Verifiable Credentials',
      value: stats.credentials_issued ?? 0,
      sub: 'Signed with Ed25519',
      icon: Award,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Examiner Overview
          </h1>
          <p className="text-text-muted text-xs mt-1">
            Real-time behavioral telemetry distribution and automated ML anomaly classification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-secondary">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-mono text-[11px] text-text-muted">Active Engine:</span>
            <span className="font-semibold text-text-secondary">{stats.active_model}</span>
          </div>
          <Button size="sm" variant="primary" onClick={() => navigate('/ask')}>
            Ask VerifyIQ
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4 bg-surface border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-semibold text-text-primary font-mono">
                {kpi.value}
              </div>
              <p className="text-[11px] text-text-subtle mt-1">{kpi.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* Anomaly Distribution Chart */}
      <Card className="p-6 bg-surface border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              Cohort Anomaly Score Distribution (0–100)
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Calibrated histogram showing participant telemetry anomaly scores across 10 deciles.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> &lt;45 Normal
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> 45–74 Review
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> &ge;75 High Signal
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="bin" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
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
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {distribution.map((entry, index) => {
                  let fill = '#10B981'; // normal
                  if (index >= 4 && index <= 6) fill = '#F59E0B'; // review
                  if (index >= 7) fill = '#F43F5E'; // high
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Flagged Sessions Requiring Attention */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Recent Flagged Sessions Awaiting Examiner Follow-up
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Sessions that tripped non-linear feature bounds or heuristic thresholds.
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/sessions')}>
            View All 40 Sessions <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {recent_flagged.map((session) => (
            <Card
              key={session.id}
              variant="interactive"
              onClick={() => navigate(`/sessions/${session.id}`)}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-teal-400">
                  {session.id}
                </span>
                <AnomalyBadge
                  category={session.category}
                  score={session.anomaly_score}
                  size="sm"
                />
              </div>

              <h4 className="text-sm font-medium text-text-secondary line-clamp-1">
                {session.candidate_name}
              </h4>
              <p className="text-[11px] text-text-muted font-mono mt-0.5">
                Pseudonym: {session.pseudonym_id}
              </p>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Score: {session.score}% ({session.tests_passed}/{session.tests_total} tests)</span>
                <span className="text-teal-400 group-hover:underline text-[11px] font-medium">
                  Review &rarr;
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

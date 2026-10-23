import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions, useAssessments } from '../../hooks/queries';
import { AnomalyBadge } from '../../components/ui/AnomalyBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const SessionsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assessmentFilter, setAssessmentFilter] = useState('all');

  const { data: assessments } = useAssessments();
  const { data, isLoading } = useSessions({
    page,
    limit: 12,
    search: search || undefined,
    category: categoryFilter,
    status: statusFilter,
    assessment_id: assessmentFilter,
  });

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'normal', label: 'Normal' },
    { value: 'review_recommended', label: 'Review Recommended' },
    { value: 'high_anomaly_signal', label: 'High Anomaly Signal' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Candidate Assessment Sessions
          </h1>
          <p className="text-text-muted text-xs mt-1">
            Telemetry logs, ML anomaly scoring, and examiner audit decisions across 40 recorded sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearch('');
              setCategoryFilter('all');
              setStatusFilter('all');
              setAssessmentFilter('all');
              setPage(1);
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-surface border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-subtle absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search ID, name, or pseudonym..."
              className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-secondary placeholder:text-text-subtle focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-text-secondary focus:outline-none focus:border-teal-500"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Assessment Filter */}
          <select
            value={assessmentFilter}
            onChange={(e) => {
              setAssessmentFilter(e.target.value);
              setPage(1);
            }}
            className="bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-text-secondary focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Assessments</option>
            {assessments?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-text-secondary focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="scored">Scored (Pending Review)</option>
            <option value="reviewed">Examiner Reviewed</option>
            <option value="submitted">Submitted</option>
          </select>
        </div>
      </Card>

      {/* Sessions Table */}
      <Card className="overflow-hidden p-0 bg-surface border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-elevated text-text-muted font-medium">
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Candidate & Pseudonym</th>
                <th className="px-4 py-3">Assessment</th>
                <th className="px-4 py-3">Anomaly Signal</th>
                <th className="px-4 py-3">Code Score</th>
                <th className="px-4 py-3">Review Decision</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : data && data.sessions.length > 0 ? (
                data.sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-surface-elevated/60 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/sessions/${session.id}`)}
                  >
                    {/* Session ID */}
                    <td className="px-4 py-3 font-mono font-semibold text-teal-400">
                      {session.id}
                    </td>

                    {/* Candidate */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-secondary">
                        {session.candidate_name}
                      </div>
                      <div className="text-[11px] font-mono text-text-subtle">
                        {session.pseudonym_id}
                      </div>
                    </td>

                    {/* Assessment */}
                    <td className="px-4 py-3 text-text-secondary max-w-xs truncate">
                      {session.assessment_title}
                    </td>

                    {/* Anomaly Signal */}
                    <td className="px-4 py-3">
                      <AnomalyBadge
                        category={session.category}
                        score={session.anomaly_score}
                        size="sm"
                      />
                    </td>

                    {/* Code Score */}
                    <td className="px-4 py-3 font-mono">
                      <span className="font-medium text-text-secondary">
                        {session.score}%
                      </span>
                      <span className="text-text-subtle text-[11px] ml-1">
                        ({session.tests_passed}/{session.tests_total})
                      </span>
                    </td>

                    {/* Review Decision */}
                    <td className="px-4 py-3">
                      {session.review_decision === 'cleared' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" /> Cleared
                        </span>
                      ) : session.review_decision === 'needs_followup' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5" /> Needs Follow-up
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-subtle font-mono">
                          Pending Review
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sessions/${session.id}`);
                        }}
                      >
                        Inspect <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-subtle">
                    No sessions match the current query criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
            <div>
              Showing {data.sessions.length > 0 ? (data.page - 1) * data.limit + 1 : 0} to{' '}
              {Math.min(data.page * data.limit, data.total)} of {data.total} recorded sessions
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>
              <span className="font-mono px-2">Page {page}</span>
              <Button
                size="sm"
                variant="outline"
                disabled={page * data.limit >= data.total}
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidateDashboard } from '../../hooks/queries';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  FileCode,
  Award,
  Play,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const CandidateDashboard: React.FC = () => {
  const { data, isLoading } = useCandidateDashboard();
  const navigate = useNavigate();

  if (isLoading || !data) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Candidate Workspace
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Logged in as <span className="text-text-secondary font-medium">{candidateUser.name}</span>{' '}
            <span className="font-mono text-teal-400">({candidateUser.pseudonym_id})</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-secondary flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-400" />
            <span>{credentials.length} Issued Credentials</span>
          </div>
        </div>
      </div>

      {/* Active Assigned Assessment Card */}
      {active_assessment ? (
        <Card className="p-6 bg-surface border-border shadow-md">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[11px] font-medium mb-2">
                <Shield className="w-3 h-3" />
                <span>Assigned Assessment</span>
              </div>
              <h2 className="text-lg font-semibold text-text-primary">
                {active_assessment.title}
              </h2>
              <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
                {active_assessment.description}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-mono text-text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-text-subtle" />
                {active_assessment.duration_minutes} minutes
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span>Privacy Guarantee: Timing intervals only</span>
              <span>•</span>
              <span>Monaco Sandboxed IDE</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/candidate/consent')}
            >
              Start Pre-Check & Consent <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-surface border-border text-center py-8">
          <FileCode className="w-8 h-8 text-teal-400 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-text-primary">No Active Assessment Assigned</h3>
          <p className="text-xs text-text-muted mt-1">
            Check back soon or consult your examiner for your invitation link.
          </p>
        </Card>
      )}

      {/* Available Assessments (if more than 1) */}
      {available_assessments.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">
            Available Assessment Catalog
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {available_assessments.slice(1).map((asm: any) => (
              <Card key={asm.id} className="p-4 bg-surface border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300">
                      {asm.difficulty || 'medium'}
                    </span>
                    <span className="text-xs font-mono text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {asm.duration_minutes}m
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-text-secondary">{asm.title}</h4>
                  <p className="text-xs text-text-muted line-clamp-2 mt-1">{asm.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/candidate/consent')}
                  >
                    Take Assessment <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Assessments History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Completed Submissions & Digital Badges
        </h3>

        {recent_sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent_sessions.map((session: any) => (
              <Card key={session.id} className="p-4 bg-surface border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold text-teal-400">
                    {session.id}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Score: {session.score}%
                  </span>
                </div>

                <h4 className="text-sm font-medium text-text-secondary line-clamp-1 mb-1">
                  {session.assessment_title}
                </h4>
                <p className="text-[11px] text-text-subtle">
                  Completed on {formatDate(session.start_time)}
                </p>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">
                    {session.tests_passed}/{session.tests_total} Tests Verified
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/candidate/result?session_id=${session.id}`)}
                  >
                    View Result <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 bg-surface border-border text-center py-6">
            <p className="text-xs text-text-subtle">
              No completed assessment submissions yet. Take your first test above to earn an Ed25519 verifiable credential badge.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

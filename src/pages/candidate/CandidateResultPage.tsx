import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/queries';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCode,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const CandidateResultPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get('session_id') || 'S-1001';

  const { data: session, isLoading } = useSession(sessionId);

  if (isLoading || !session) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isPassing = (session.score || 0) >= 70;
  const isCredentialIssued = isPassing && session.review_decision !== 'needs_followup';

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in duration-200 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
        <Award className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">
        Assessment Results
      </h1>
      <p className="text-xs text-text-muted max-w-sm mx-auto mb-8">
        Your unit test evaluation for <strong className="text-text-secondary">{session.assessment_title}</strong>.
      </p>

      {/* Score Summary Card */}
      <Card className="p-6 md:p-8 bg-surface border-border shadow-xl space-y-6 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <span className="text-xs text-text-muted block">Overall Score</span>
            <span className="text-3xl font-mono font-bold text-text-primary">
              {session.score}%
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-text-muted block">Test Verification</span>
            <span className="text-sm font-mono text-emerald-400 font-semibold flex items-center justify-end gap-1">
              <CheckCircle2 className="w-4 h-4" /> {session.tests_passed} of {session.tests_total} Passed
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-text-secondary">
          <div className="flex justify-between py-1 border-b border-border/60">
            <span className="text-text-subtle">Session ID:</span>
            <span className="font-mono text-text-secondary">{session.id}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/60">
            <span className="text-text-subtle">Candidate Pseudonym:</span>
            <span className="font-mono text-text-secondary">{session.pseudonym_id}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/60">
            <span className="text-text-subtle">Submitted At:</span>
            <span className="font-mono text-text-secondary">{formatDate(session.end_time || session.start_time)}</span>
          </div>
        </div>

        {/* Verifiable Credential Box */}
        {isCredentialIssued ? (
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>W3C Digital Credential Ready</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your solution meets all certification standards. A verifiable credential signed with Ed25519 cryptography has been generated.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/candidate/credentials')}
              className="w-full"
            >
              View My Credential & QR Code <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-elevated border border-border text-xs text-text-muted">
            Digital credential review pending examiner confirmation.
          </div>
        )}

        <div className="pt-2 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/candidate')}
          >
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

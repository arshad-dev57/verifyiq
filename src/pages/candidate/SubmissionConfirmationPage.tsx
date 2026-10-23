import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, ShieldCheck, ArrowRight, Award } from 'lucide-react';

export const SubmissionConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id') || 'S-1001';

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-4 text-teal-400">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">
        Assessment Solution Submitted
      </h1>
      <p className="text-xs text-text-muted max-w-sm mx-auto mb-8 leading-relaxed">
        Your test suite execution results and telemetry timestamps have been safely committed. Telemetry capture is now closed.
      </p>

      <Card className="p-6 bg-surface border-border text-left space-y-4 mb-6">
        <div className="flex justify-between items-center text-xs pb-3 border-b border-border">
          <span className="text-text-muted">Session Identifier:</span>
          <span className="font-mono text-teal-400 font-semibold">{sessionId}</span>
        </div>

        <div className="flex justify-between items-center text-xs pb-3 border-b border-border">
          <span className="text-text-muted">Status:</span>
          <span className="font-medium text-emerald-400">Submitted & Validated</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted">Digital Credential Eligibility:</span>
          <span className="text-text-secondary font-medium">Eligible (Score &ge; 70%)</span>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="secondary"
          onClick={() => navigate('/candidate')}
        >
          Return to Dashboard
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`/candidate/result?session_id=${sessionId}`)}
        >
          View Assessment Result <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};

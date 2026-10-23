import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, Check, EyeOff, Lock, ArrowRight } from 'lucide-react';
import { sessionsApi, assessmentsApi } from '../../lib/api';

export const ConsentPage: React.FC = () => {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [assessmentId, setAssessmentId] = useState<string>(searchParams.get('assessment_id') || '');

  useEffect(() => {
    if (!assessmentId) {
      assessmentsApi.getAssessments().then((list) => {
        if (list && list.length > 0) {
          setAssessmentId(list[0].id);
        } else {
          setAssessmentId('asm-py-101');
        }
      }).catch(() => {
        setAssessmentId('asm-py-101');
      });
    }
  }, [assessmentId]);

  const handleProceed = async () => {
    if (!agreed) return;
    setIsSubmitting(true);
    try {
      const res = await sessionsApi.createSession({
        assessment_id: assessmentId || 'asm-py-101',
        consent: true,
      });
      navigate(`/candidate/precheck?session_id=${res.id}&assessment_id=${res.assessment_id}`);
    } catch (err: any) {
      console.error('Session creation failed:', err);
      // If candidate already has an in-progress session, fetch it
      try {
        const sessionsRes = await sessionsApi.getSessions({ status: 'in_progress' });
        if (sessionsRes.sessions && sessionsRes.sessions.length > 0) {
          const active = sessionsRes.sessions[0];
          navigate(`/candidate/precheck?session_id=${active.id}&assessment_id=${active.assessment_id}`);
          return;
        }
      } catch {}
      navigate(`/candidate/precheck?assessment_id=${assessmentId || 'asm-py-101'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-200">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 text-teal-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Privacy-Conscious Telemetry Consent
        </h1>
        <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
          VerifyIQ verifies technical competence through behavioral timing distributions without intrusive surveillance.
        </p>
      </div>

      <Card className="p-6 md:p-8 bg-surface border-border shadow-xl space-y-6">
        {/* What is tracked vs What is NOT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tracked */}
          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-teal-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
              <Check className="w-4 h-4 text-teal-400" />
              <span>What We Track (Telemetry)</span>
            </div>
            <ul className="text-xs text-text-secondary space-y-2 list-disc pl-4 leading-relaxed">
              <li>
                <strong>Keystroke Delays:</strong> Millisecond intervals between presses (e.g. 210ms cadence).
              </li>
              <li>
                <strong>Clipboard Metrics:</strong> Character count of pasted text (never actual content).
              </li>
              <li>
                <strong>Execution Bursts:</strong> Timestamps of unit test trials and compilation passes.
              </li>
              <li>
                <strong>Window Defocus:</strong> Total seconds the browser window lost active focus.
              </li>
            </ul>
          </div>

          {/* Not Tracked */}
          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-rose-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
              <EyeOff className="w-4 h-4 text-rose-400" />
              <span>What We NEVER Track</span>
            </div>
            <ul className="text-xs text-text-secondary space-y-2 list-disc pl-4 leading-relaxed">
              <li>
                <strong>No Keylogging:</strong> Raw characters typed are never captured or sent to server.
              </li>
              <li>
                <strong>No Video/Webcam:</strong> Zero camera or audio surveillance streams.
              </li>
              <li>
                <strong>No Screen Sharing:</strong> External desktop windows are completely inaccessible.
              </li>
              <li>
                <strong>No Biometrics:</strong> No facial recognition or physical behavioral scanning.
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Cryptographic statement */}
        <div className="p-4 rounded-xl bg-surface-elevated border border-border flex items-start gap-3">
          <Lock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-text-primary">Cryptographic Verifiable Integrity</h4>
            <p className="text-text-muted leading-relaxed">
              Upon successful completion, your session results may be signed with an Ed25519 W3C-standard Verifiable Credential. Raw event telemetry is automatically scheduled for purge after 90 days in compliance with GDPR Art. 5(1)(e).
            </p>
          </div>
        </div>

        {/* Agreement checkbox */}
        <div className="pt-2 border-t border-border">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border bg-surface-elevated text-teal-500 focus:ring-teal-500/30"
            />
            <span className="text-xs text-text-secondary group-hover:text-text-primary leading-relaxed">
              I acknowledge the collection of interaction timing telemetry and understand that my code submission will be scored with objective behavioral models.
            </span>
          </label>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            disabled={!agreed}
            isLoading={isSubmitting}
            onClick={handleProceed}
            className="w-full sm:w-auto"
          >
            Agree & Proceed to Pre-Check <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

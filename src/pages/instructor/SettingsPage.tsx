import React, { useState } from 'react';
import { useSystemSettings, useUpdateSettings } from '../../hooks/queries';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Settings, Shield, Clock, Sliders, Check, Lock } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { data: settings, isLoading } = useSystemSettings();
  const updateMutation = useUpdateSettings();

  const [retentionDays, setRetentionDays] = useState<number>(90);
  const [consentText, setConsentText] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setRetentionDays(settings.raw_events_retention_days);
      setConsentText(settings.consent_text);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      raw_events_retention_days: retentionDays,
      consent_text: consentText,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Platform Governance & Data Retention
        </h1>
        <p className="text-text-muted text-xs mt-0.5">
          Configure telemetry retention policies, consent disclosures, and privacy guarantees.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Retention Policy */}
        <Card className="p-6 bg-surface border-border space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              Raw Behavioral Event Lifecycle
            </h3>
          </div>
          <p className="text-xs text-text-muted">
            Raw event streams (inter-key timings, mouse coordinates) are automatically purged via scheduled retention jobs once feature vectors have been extracted.
          </p>

          <div className="max-w-xs space-y-1">
            <label className="block text-xs font-medium text-text-secondary">
              Retention Duration (Days)
            </label>
            <input
              type="number"
              min={7}
              max={365}
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-teal-500 font-mono"
            />
            <p className="text-[11px] text-text-subtle">
              Purges all raw event JSON records older than {retentionDays} days.
            </p>
          </div>
        </Card>

        {/* Consent Disclosure Text */}
        <Card className="p-6 bg-surface border-border space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              Candidate Pre-Session Consent Disclosure
            </h3>
          </div>
          <p className="text-xs text-text-muted">
            Explicit privacy disclosure presented to candidates before session initialization. Candidates must provide opt-in consent to start an assessment.
          </p>

          <textarea
            rows={8}
            value={consentText}
            onChange={(e) => setConsentText(e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded-xl p-3 text-xs text-text-secondary focus:outline-none focus:border-teal-500 font-mono leading-relaxed"
          />
        </Card>

        {/* AI & Security Standards */}
        <Card className="p-6 bg-surface border-border space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              Cryptographic & LLM Integrity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-surface-elevated rounded-xl border border-border">
              <span className="text-text-subtle block mb-1">Evidence Summary Engine</span>
              <span className="text-text-secondary font-mono font-medium">
                {settings.llm_evidence_model}
              </span>
            </div>

            <div className="p-3 bg-surface-elevated rounded-xl border border-border">
              <span className="text-text-subtle block mb-1">Digital Signature Suite</span>
              <span className="text-teal-400 font-mono font-medium">
                Ed25519Signature2020 (W3C standard)
              </span>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="w-4 h-4" /> System settings updated successfully
            </span>
          ) : (
            <span className="text-xs text-text-subtle">
              Changes take effect immediately on new sessions.
            </span>
          )}

          <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

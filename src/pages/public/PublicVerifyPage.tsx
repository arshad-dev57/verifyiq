import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { credentialsApi } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ShieldCheck,
  Ban,
  AlertCircle,
  KeyRound,
  Calendar,
  Building,
  User,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import confetti from 'canvas-confetti';

export const PublicVerifyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const credentialId = id || '';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    status: 'valid' | 'revoked' | 'not_found';
    skill?: string;
    issued_at?: string;
    issuer?: string;
    pseudonym_id?: string;
    assessment_title?: string;
  } | null>(null);

  useEffect(() => {
    async function checkCred() {
      setLoading(true);
      try {
        const result = await credentialsApi.verifyPublicCredential(credentialId);
        setData(result);
        if (result.status === 'valid') {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
      } catch (err) {
        setData({ status: 'not_found' });
      } finally {
        setLoading(false);
      }
    }
    checkCred();
  }, [credentialId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-surface border-border text-center space-y-4">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    );
  }

  const isValid = data?.status === 'valid';
  const isRevoked = data?.status === 'revoked';

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between py-12 px-4">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Status Header */}
        <div className="text-center">
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border shadow-xl ${
              isValid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : isRevoked
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-surface-elevated/30 border-border text-text-muted'
            }`}
          >
            {isValid ? (
              <ShieldCheck className="w-8 h-8" />
            ) : isRevoked ? (
              <Ban className="w-8 h-8" />
            ) : (
              <AlertCircle className="w-8 h-8" />
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-1">
            {isValid
              ? 'Valid & Authenticated Credential'
              : isRevoked
              ? 'Revoked Digital Credential'
              : 'Credential Record Not Found'}
          </h1>
          <p className="text-xs text-text-muted">
            {isValid
              ? 'W3C cryptographic proof verified with Ed25519 signature.'
              : isRevoked
              ? 'This credential was revoked by the issuing authority.'
              : 'No matching cryptographic proof registered in the decentralized registry.'}
          </p>
        </div>

        {/* Credential Data Card */}
        {data && data.status !== 'not_found' && (
          <Card className="p-6 bg-surface border-border shadow-2xl space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 block mb-1">
                Certified Competency
              </span>
              <h2 className="text-base font-semibold text-text-primary leading-snug">
                {data.skill}
              </h2>
              <p className="text-xs text-text-muted mt-1">
                {data.assessment_title}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-text-subtle" />
                  Candidate Subject:
                </span>
                <span className="font-mono text-text-secondary">{data.pseudonym_id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-text-subtle" />
                  Issuing Authority:
                </span>
                <span className="text-text-secondary text-right truncate max-w-[200px]">
                  {data.issuer}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-text-subtle" />
                  Issuance Date:
                </span>
                <span className="font-mono text-text-secondary">
                  {formatDate(data.issued_at || '')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-text-subtle" />
                  Cryptography:
                </span>
                <span className="font-mono text-teal-300 text-[11px]">
                  Ed25519Signature2020
                </span>
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="p-3 rounded-xl bg-surface-elevated/60 border border-border text-[11px] text-text-muted leading-relaxed">
              <strong>Zero Behavioral Exposure:</strong> This public proof confirms certified programming skill while permanently protecting candidate telemetry.
            </div>
          </Card>
        )}

        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            VerifyIQ Platform Home
          </Button>
        </div>
      </div>

      <footer className="text-center text-[11px] text-text-subtle font-mono mt-8">
        VerifyIQ Cryptographic Verifier • Standard W3C VC 1.0 Compliant
      </footer>
    </div>
  );
};

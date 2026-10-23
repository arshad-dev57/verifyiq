import React, { useState } from 'react';
import { useCredentials } from '../../hooks/queries';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Award, ShieldCheck, QrCode, Download, ExternalLink, KeyRound } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '../../lib/utils';
import { VerifiableCredential } from '../../types';

export const CandidateCredentialsPage: React.FC = () => {
  const { data: credentials, isLoading } = useCredentials();
  const [selectedCred, setSelectedCred] = useState<VerifiableCredential | null>(null);

  if (isLoading || !credentials) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const validCredentials = credentials.filter((c) => c.status === 'valid');

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-2">
          <KeyRound className="w-3.5 h-3.5" />
          <span>W3C Verifiable Credentials</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          My Digital Credentials & Badges
        </h1>
        <p className="text-text-muted text-xs mt-0.5">
          Verifiable credentials proving your certified skills. Share the public link or QR code with employers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {validCredentials.map((cred) => (
          <Card key={cred.id} className="p-6 bg-surface border-border flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" /> Cryptographically Valid
                </span>
                <span className="text-[10px] text-text-subtle font-mono">
                  {formatDate(cred.issued_at)}
                </span>
              </div>

              <h3 className="text-base font-semibold text-text-primary mb-1">
                {cred.skill}
              </h3>
              <p className="text-xs text-text-muted mb-4">
                Assessment: {cred.assessment_title}
              </p>

              <div className="p-3 bg-surface-elevated/70 rounded-xl border border-border text-xs space-y-1 font-mono text-text-secondary mb-2">
                <div className="flex justify-between">
                  <span className="text-text-subtle">Subject:</span>
                  <span>{cred.pseudonym_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-subtle">Signer:</span>
                  <span>Ed25519</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-subtle">Passing Score:</span>
                  <span className="text-emerald-400 font-bold">{cred.score}%</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setSelectedCred(cred)}
                className="flex-1"
              >
                <QrCode className="w-3.5 h-3.5 mr-1.5" />
                Show QR Code
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(cred.qr_url, '_blank')}
                className="flex-1"
              >
                Public Verify <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* QR Modal */}
      {selectedCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-sm p-6 bg-surface border-border shadow-2xl text-center space-y-4">
            <h3 className="text-base font-semibold text-text-primary">
              Public Verification QR
            </h3>
            <p className="text-xs text-text-muted">
              Point your camera or share this QR with employers for instant cryptographic verification.
            </p>

            <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-inner">
              <QRCodeSVG
                value={`${window.location.origin}${selectedCred.qr_url}`}
                size={180}
                level="M"
              />
            </div>

            <div className="text-xs font-mono text-text-muted truncate">
              ID: {selectedCred.id}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCred(null)}
              className="w-full"
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useCredentials, useRevokeCredential } from '../../hooks/queries';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Award,
  ShieldCheck,
  Ban,
  QrCode,
  Download,
  ExternalLink,
  KeyRound,
  Check,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '../../lib/utils';
import { VerifiableCredential } from '../../types';

export const CredentialsManagementPage: React.FC = () => {
  const { data: credentials, isLoading } = useCredentials();
  const revokeMutation = useRevokeCredential();
  const [selectedCred, setSelectedCred] = useState<VerifiableCredential | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleRevoke = async (id: string) => {
    if (confirm('Are you sure you want to revoke this digital credential? This action is recorded on the cryptographic registry.')) {
      await revokeMutation.mutateAsync({ id, reason: 'Revocation requested by examiner audit.' });
    }
  };

  const downloadJson = (cred: VerifiableCredential) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cred, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${cred.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (isLoading || !credentials) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-2">
          <KeyRound className="w-3.5 h-3.5" />
          <span>W3C Decentralized Identity & Ed25519 Signatures</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Digital Credentials Registry
        </h1>
        <p className="text-text-muted text-xs mt-0.5">
          Verifiable credentials issued to candidates who passed assessments with certified behavioral integrity.
        </p>
      </div>

      {/* Credentials Table */}
      <Card className="overflow-hidden p-0 bg-surface border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-elevated text-text-muted font-medium">
                <th className="px-4 py-3">Credential ID</th>
                <th className="px-4 py-3">Candidate & Pseudonym</th>
                <th className="px-4 py-3">Certified Competency</th>
                <th className="px-4 py-3">Issued Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {credentials.map((cred) => (
                <tr key={cred.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-teal-400">
                    {cred.id.slice(0, 16)}...
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-text-secondary">{cred.candidate_name}</div>
                    <div className="text-[11px] font-mono text-text-subtle">{cred.pseudonym_id}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-xs truncate">
                    {cred.skill}
                  </td>
                  <td className="px-4 py-3 text-text-muted font-mono">
                    {formatDate(cred.issued_at)}
                  </td>
                  <td className="px-4 py-3">
                    {cred.status === 'valid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
                        <ShieldCheck className="w-3 h-3" /> Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-medium">
                        <Ban className="w-3 h-3" /> Revoked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedCred(cred);
                        setShowQRModal(true);
                      }}
                      title="View QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5 text-teal-400" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadJson(cred)}
                      title="Download JSON"
                    >
                      <Download className="w-3.5 h-3.5 text-text-muted" />
                    </Button>
                    {cred.status === 'valid' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevoke(cred.id)}
                        title="Revoke Credential"
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* QR Code & Cryptographic Verification Modal */}
      {showQRModal && selectedCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-sm p-6 bg-surface border-border shadow-2xl text-center space-y-4">
            <h3 className="text-base font-semibold text-text-primary">
              Scan to Verify Authenticity
            </h3>
            <p className="text-xs text-text-muted">
              Anyone can scan this QR code or navigate to the public URL to verify cryptographic validity without accessing behavioral telemetry.
            </p>

            <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-inner">
              <QRCodeSVG
                value={`${window.location.origin}${selectedCred.qr_url}`}
                size={180}
                level="M"
              />
            </div>

            <div className="p-3 bg-surface-elevated rounded-xl border border-border text-left text-xs font-mono text-text-secondary space-y-1">
              <div>
                <span className="text-text-subtle">Subject ID:</span> {selectedCred.pseudonym_id}
              </div>
              <div className="truncate">
                <span className="text-text-subtle">Signer:</span> Ed25519 ({selectedCred.issuer.id})
              </div>
              <div>
                <span className="text-text-subtle">Status:</span>{' '}
                <span className={selectedCred.status === 'valid' ? 'text-emerald-400' : 'text-rose-400'}>
                  {selectedCred.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQRModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.open(selectedCred.qr_url, '_blank')}
                className="flex-1"
              >
                Open URL <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

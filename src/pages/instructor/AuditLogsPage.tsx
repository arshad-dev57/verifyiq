import React from 'react';
import { useAuditLogs } from '../../hooks/queries';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Layers, Shield, FileText } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const AuditLogsPage: React.FC = () => {
  const { data: logs, isLoading } = useAuditLogs();

  if (isLoading || !logs) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>Immutable Audit Log Journal</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          System & Examiner Audit Trail
        </h1>
        <p className="text-text-muted text-xs mt-0.5">
          Every session inspection, examiner review determination, and model parameter modification is logged.
        </p>
      </div>

      <Card className="overflow-hidden p-0 bg-surface border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-elevated text-text-muted font-medium">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Examiner / Actor</th>
                <th className="px-4 py-3">Action Recorded</th>
                <th className="px-4 py-3">Target Resource</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-text-muted whitespace-nowrap">
                    {formatDate(log.ts)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-text-secondary">{log.actor_email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-teal-300 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-text-secondary">
                    {log.resource_type}: <span className="text-text-primary font-semibold">{log.resource_id}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-text-subtle text-[11px]">
                    {log.ip}
                  </td>
                  <td className="px-4 py-3 text-text-muted text-[11px] font-mono max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

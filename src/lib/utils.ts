import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnomalyCategory } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPseudonym(pseudoId: string): string {
  if (!pseudoId) return 'anon-0000';
  return pseudoId.toUpperCase();
}

export function getCategoryMeta(category?: AnomalyCategory) {
  switch (category) {
    case 'normal':
      return {
        label: 'Normal',
        shortLabel: 'Normal',
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        dotColor: 'bg-emerald-400',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        description: 'Behavioral indicators within expected standard distribution',
      };
    case 'review_recommended':
      return {
        label: 'Review Recommended',
        shortLabel: 'Review',
        badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dotColor: 'bg-amber-400',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        description: 'Moderate behavioral deviation detected; human review advised',
      };
    case 'high_anomaly_signal':
      return {
        label: 'High Anomaly Signal',
        shortLabel: 'High Signal',
        badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        dotColor: 'bg-rose-400',
        textColor: 'text-rose-400',
        borderColor: 'border-rose-500/30',
        description: 'Significant behavioral variance across multiple telemetry vectors',
      };
    default:
      return {
        label: 'Unscored',
        shortLabel: 'Pending',
        badgeBg: 'bg-surface-elevated text-text-muted border-border',
        dotColor: 'bg-text-subtle',
        textColor: 'text-text-muted',
        borderColor: 'border-border',
        description: 'Session awaiting feature extraction and model scoring',
      };
  }
}

export function getScoreColor(score: number): string {
  if (score < 45) return 'text-emerald-400';
  if (score < 75) return 'text-amber-400';
  return 'text-rose-400';
}

export function getFeatureFriendlyName(featureName: string): string {
  const names: Record<string, string> = {
    mean_inter_key_ms: 'Mean Keystroke Interval (ms)',
    std_inter_key_ms: 'Keystroke Jitter (Std Dev ms)',
    typing_speed_cv: 'Typing Speed Variability (CV)',
    burstiness: 'Keystroke Burstiness Index',
    backspace_ratio: 'Backspace / Edit Ratio',
    paste_count: 'Large Paste Events',
    paste_ratio: 'Pasted Character Ratio',
    tab_switch_count: 'Window / Tab Switches',
    tab_switch_rate: 'Tab Switch Frequency (per min)',
    focus_loss_seconds: 'Unfocused Window Duration (s)',
    mouse_distance: 'Total Cursor Path (px)',
    click_rate: 'Mouse Click Frequency (per min)',
    idle_ratio: 'Idle Inactivity Ratio',
    edit_run_ratio: 'Edits per Test Execution',
    time_to_first_run: 'Time to First Code Run (s)',
    run_count: 'Test Executions Count',
    failed_run_ratio: 'Failed Test Execution Ratio',
    revision_count: 'Structural Revisions Count',
    total_duration: 'Total Active Duration (s)',
  };
  return names[featureName] || featureName.replace(/_/g, ' ');
}

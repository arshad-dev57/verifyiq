import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Shield,
  Sparkles,
  ArrowRight,
  Activity,
  Cpu,
  Award,
  Lock,
  CheckCircle2,
  AlertTriangle,
  EyeOff,
  Terminal,
} from 'lucide-react';
import { AnomalyBadge } from '../../components/ui/AnomalyBadge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-teal-500/30">
      {/* Top Navigation */}
      <header className="h-16 border-b border-border bg-surface/70 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-teal-400" />
          </div>
          <span className="font-semibold text-base tracking-tight text-text-primary">
            Verify<span className="text-teal-400">IQ</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-text-muted font-medium">
          <button onClick={() => navigate('/ask')} className="hover:text-text-secondary transition-colors">
            Ask VerifyIQ
          </button>
          <button onClick={() => navigate('/sessions')} className="hover:text-text-secondary transition-colors">
            Sessions
          </button>
          <button onClick={() => navigate('/ml-lab')} className="hover:text-text-secondary transition-colors">
            ML Research Lab
          </button>
          <button onClick={() => navigate('/plans')} className="hover:text-text-secondary transition-colors">
            Pricing Plans
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/ask')}>
            Examiner Console <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Non-Invasive AI Behavioral Telemetry</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary leading-tight max-w-4xl mx-auto">
          Assessment Integrity Through{' '}
          <span className="text-teal-400 underline decoration-teal-500/40 decoration-wavy underline-offset-8">
            Evidence
          </span>
          , Not Accusations.
        </h1>

        <p className="text-sm md:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
          VerifyIQ collects privacy-conscious behavioral telemetry during coding assessments, evaluates sessions with ML anomaly classifiers (0–100), synthesizes neutral evidence with AI, and issues verifiable W3C digital credentials.
        </p>

        {/* Ethical Guarantee Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-border text-xs text-text-secondary shadow-inner">
          <EyeOff className="w-4 h-4 text-teal-400" />
          <span>Zero keylogging • Zero webcam surveillance • Strictly objective telemetry</span>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" variant="primary" onClick={() => navigate('/ask')}>
            Launch Examiner Console (Ask VerifyIQ)
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/candidate')}>
            Experience Candidate Focus Mode
          </Button>
        </div>
      </section>

      {/* Core Paradigm: 3 Categories Showcase */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
            Ethical Categorization Paradigm
          </h2>
          <p className="text-xs text-text-muted mt-1 max-w-lg mx-auto">
            VerifyIQ NEVER claims "cheating proven" or "AI detected". We provide statistical behavioral signals to inform human review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-surface border-border space-y-3">
            <AnomalyBadge category="normal" score={18} size="lg" />
            <h3 className="text-sm font-semibold text-text-primary pt-2">Normal Distribution</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Keystroke timings, backspace corrections, and incremental test compilation align with cohort distributions (score 0–44).
            </p>
          </Card>

          <Card className="p-6 bg-surface border-border space-y-3">
            <AnomalyBadge category="review_recommended" score={58} size="lg" />
            <h3 className="text-sm font-semibold text-text-primary pt-2">Review Recommended</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Mild to moderate telemetry deviation (e.g. repeated external window defocus or elevated paste frequency; score 45–74).
            </p>
          </Card>

          <Card className="p-6 bg-surface border-border space-y-3">
            <AnomalyBadge category="high_anomaly_signal" score={84} size="lg" />
            <h3 className="text-sm font-semibold text-text-primary pt-2">High Anomaly Signal</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Significant multi-vector behavioral variance (e.g. monolithic paste blocks with absent syntax iterations; score 75–100).
            </p>
          </Card>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="py-16 px-6 max-w-5xl mx-auto border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-text-muted">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-teal-400 mb-2">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-text-secondary text-sm">19 Behavioral Features</h4>
            <p className="leading-relaxed">
              Mean keystroke jitter, burstiness, paste ratios, and time-to-first-run extracted safely from timing streams.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-teal-400 mb-2">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-text-secondary text-sm">Ensemble ML & SHAP</h4>
            <p className="leading-relaxed">
              Calibrated XGBoost and Random Forest models with frozen thresholds and explainable feature contributions.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-teal-400 mb-2">
              <Terminal className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-text-secondary text-sm">Judge0 Sandboxed IDE</h4>
            <p className="leading-relaxed">
              Monaco-powered coding tests executed in isolated Docker containers with automated assertions.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-teal-400 mb-2">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-text-secondary text-sm">W3C Ed25519 Credentials</h4>
            <p className="leading-relaxed">
              Tamper-evident verifiable credentials with QR verification and zero behavioral telemetry exposure.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center text-xs text-text-subtle font-mono">
        VerifyIQ Assessment Platform • Behavioral Telemetry & Verified Digital Credentials
      </footer>
    </div>
  );
};

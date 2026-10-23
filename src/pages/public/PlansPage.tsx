import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Check, Sparkles, Shield, Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PlansPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free Starter',
      desc: 'Ideal for independent educators and small cohorts.',
      price: '$0',
      period: 'forever',
      badge: null,
      icon: User,
      buttonText: 'Get Started',
      buttonVariant: 'outline' as const,
      features: [
        'Up to 15 candidate sessions/month',
        'Standard Python & JS Monaco editor',
        'Rule-based heuristic baseline scoring',
        'Standard W3C Verifiable Credentials',
        '30-day raw telemetry retention',
        'Community discussion support',
      ],
    },
    {
      name: 'Pro Examiner',
      desc: 'For professional software teams & bootcamps.',
      price: billingCycle === 'monthly' ? '$79' : '$64',
      period: 'per month, billed ' + billingCycle,
      badge: 'MOST POPULAR',
      icon: Sparkles,
      buttonText: 'Start Pro Trial',
      buttonVariant: 'primary' as const,
      features: [
        'Up to 250 candidate sessions/month',
        'Ensemble XGBoost & Random Forest ML scoring',
        'Ask VerifyIQ natural language query assistant',
        'Step-by-step code replay with diff playback',
        '90-day retention with scheduled purge',
        'Validation set threshold tuning & freezing',
        'SHAP feature importance explanations',
      ],
    },
    {
      name: 'Institution & Enterprise',
      desc: 'For universities, accreditation bodies, and high-volume recruiters.',
      price: billingCycle === 'monthly' ? '$399' : '$320',
      period: 'per month, billed ' + billingCycle,
      badge: 'CUSTOM ML LAB',
      icon: Building2,
      buttonText: 'Contact Enterprise Sales',
      buttonVariant: 'outline' as const,
      features: [
        'Unlimited candidate sessions & test runners',
        'Dedicated ML Lab with custom cohort training',
        'Zero-leakage participant 70/15/15 partitioning',
        'Custom Ed25519 root authority & public DID keys',
        'Judge0 sandboxed execution on dedicated VPS',
        'Configurable audit log export & SOC2 compliance',
        '24/7 dedicated examiner onboarding',
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-in fade-in duration-200">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Transparent & Predictable Pricing</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">
          Verify<span className="text-teal-400">IQ</span> Subscription Plans
        </h1>
        <p className="text-xs text-text-muted max-w-md mx-auto">
          Privacy-conscious behavioral telemetry and verifiable assessment credentials scaled for any team size.
        </p>

        {/* Billing cycle toggle */}
        <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-surface border border-border text-xs">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-lg transition-colors font-medium ${
              billingCycle === 'monthly'
                ? 'bg-surface-elevated text-teal-300 shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-1.5 rounded-lg transition-colors font-medium ${
              billingCycle === 'annual'
                ? 'bg-surface-elevated text-teal-300 shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Annual Billing <span className="text-teal-400 text-[10px] ml-1 font-mono">(Save 20%)</span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`p-6 flex flex-col justify-between relative transition-all duration-200 ${
                plan.badge
                  ? 'bg-surface-elevated border-teal-500/50 shadow-xl ring-1 ring-teal-500/20'
                  : 'bg-surface border-border'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-teal-500 text-slate-950 font-semibold text-[10px] tracking-wider uppercase shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
                    <Icon className="w-5 h-5 text-teal-400" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-text-primary mb-1">{plan.name}</h3>
                <p className="text-xs text-text-muted mb-6 leading-relaxed">{plan.desc}</p>

                <div className="mb-6 pb-6 border-b border-border">
                  <span className="text-3xl font-mono font-bold text-text-primary">
                    {plan.price}
                  </span>
                  <span className="text-xs text-text-subtle ml-1.5 block mt-0.5">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 text-xs text-text-secondary">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={plan.buttonVariant}
                className="w-full"
                onClick={() => navigate('/login')}
              >
                {plan.buttonText}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

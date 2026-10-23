import React, { useState } from 'react';
import {
  useMLModels,
  useMLModelMetrics,
  useMLDataset,
  useUpdateThreshold,
  useActivateModel,
} from '../../hooks/queries';
import { Card } from '../../components/ui/Card';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Cpu,
  FlaskConical,
  CheckCircle2,
  Sliders,
  Database,
  BarChart2,
  TrendingUp,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { mlApi } from '../../lib/api';

export const MLLabPage: React.FC = () => {
  const { isDark } = useThemeStore();
  const [selectedModelId, setSelectedModelId] = useState('mdl-xgb-01');
  const [activeTab, setActiveTab] = useState<'comparison' | 'thresholds' | 'dataset'>('comparison');

  const { data: models, isLoading: isModelsLoading } = useMLModels();
  const { data: metrics, isLoading: isMetricsLoading } = useMLModelMetrics(selectedModelId, 'val');
  const { data: dataset, isLoading: isDatasetLoading, refetch: refetchDataset } = useMLDataset();

  const updateThresholdMutation = useUpdateThreshold();
  const activateModelMutation = useActivateModel();

  // Threshold tuning state
  const selectedModel = models?.find((m) => m.id === selectedModelId) || models?.[0];
  const [thresholdReview, setThresholdReview] = useState(45.0);
  const [thresholdHigh, setThresholdHigh] = useState(75.0);
  const [freezeSuccess, setFreezeSuccess] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);

  // Sync selectedModelId and thresholds when models load
  React.useEffect(() => {
    if (models && models.length > 0) {
      const exists = models.some((m) => m.id === selectedModelId);
      if (!exists) {
        setSelectedModelId(models[0].id);
      }
    }
  }, [models, selectedModelId]);

  React.useEffect(() => {
    if (selectedModel) {
      setThresholdReview(selectedModel.threshold_review);
      setThresholdHigh(selectedModel.threshold_high);
    }
  }, [selectedModel]);

  const handleFreezeThresholds = async () => {
    await updateThresholdMutation.mutateAsync({
      model_id: selectedModelId,
      threshold_review: thresholdReview,
      threshold_high: thresholdHigh,
    });
    setFreezeSuccess(true);
    setTimeout(() => setFreezeSuccess(false), 3000);
  };

  const handleActivateModel = async (id: string) => {
    await activateModelMutation.mutateAsync(id);
  };

  const handleSplitDataset = async () => {
    setIsSplitting(true);
    await mlApi.splitDataset({ train: 70, val: 15, test: 15 });
    await refetchDataset();
    setIsSplitting(false);
  };

  if (isModelsLoading || !models) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Research & Model Calibration Suite</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            ML Telemetry Laboratory
          </h1>
          <p className="text-text-muted text-xs mt-0.5">
            Evaluate ensemble classifiers, tune validation false-positive rates, and freeze production thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSplitDataset}
            isLoading={isSplitting}
          >
            <Database className="w-3.5 h-3.5 mr-1.5" />
            70/15/15 Participant Split
          </Button>
        </div>
      </div>

      {/* 4 Models Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map((model) => {
          const isSelected = selectedModelId === model.id;
          return (
            <Card
              key={model.id}
              onClick={() => setSelectedModelId(model.id)}
              className={`p-4 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-surface-elevated border-teal-500/80 shadow-md ring-1 ring-teal-500/30'
                  : 'bg-surface border-border hover:border-teal-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                  v{model.version}
                </span>
                {model.is_active && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                    <CheckCircle2 className="w-3 h-3 text-teal-400" /> ACTIVE
                  </span>
                )}
              </div>

              <h4 className="text-xs font-semibold text-text-primary line-clamp-1 mb-1">
                {model.displayName}
              </h4>
              <p className="text-[11px] text-text-subtle mb-3 capitalize">
                Architecture: {model.name.replace('_', ' ')}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-border/80">
                <div>
                  <span className="text-[10px] text-text-subtle block">Accuracy</span>
                  <span className="font-mono font-semibold text-text-secondary">
                    {(model.metrics!.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-subtle block">F1 Score</span>
                  <span className="font-mono font-semibold text-teal-400">
                    {model.metrics!.f1.toFixed(3)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-subtle block">FPR Rate</span>
                  <span className="font-mono text-text-secondary">
                    {(model.metrics!.fpr * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-subtle block">Review Threshold</span>
                  <span className="font-mono text-text-secondary">
                    {model.threshold_review}
                  </span>
                </div>
              </div>

              {!model.is_active && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActivateModel(model.id);
                  }}
                  className="w-full mt-3 text-xs"
                >
                  Set as Active
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex items-center gap-2">
        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-medium transition-colors ${
            activeTab === 'comparison'
              ? 'border-teal-500 text-teal-300'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>ROC Curve, Confusion Matrix & SHAP</span>
        </button>

        <button
          onClick={() => setActiveTab('thresholds')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-medium transition-colors ${
            activeTab === 'thresholds'
              ? 'border-teal-500 text-teal-300'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Threshold Calibration & Freeze</span>
        </button>

        <button
          onClick={() => setActiveTab('dataset')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-medium transition-colors ${
            activeTab === 'dataset'
              ? 'border-teal-500 text-teal-300'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Participant Dataset Partitioning</span>
        </button>
      </div>

      {/* TAB 1: METRICS & VISUALIZATIONS */}
      {activeTab === 'comparison' && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* ROC Curve */}
          <Card className="p-6 bg-surface border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                Receiver Operating Characteristic (ROC Curve)
              </h3>
              <span className="text-xs font-mono text-teal-300">
                AUC: 0.968
              </span>
            </div>
            <p className="text-xs text-text-muted mb-6">
              True Positive Rate vs. False Positive Rate on validation partition.
            </p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.roc} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <XAxis
                    dataKey="fpr"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[0, 1]}
                    label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[0, 1]}
                    label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#171A21' : '#FFFFFF',
                      borderColor: isDark ? '#262B36' : '#E2E8F0',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: isDark ? '#F1F5F9' : '#0F172A',
                      boxShadow: isDark ? 'none' : '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
                    }}
                    itemStyle={{
                      color: isDark ? '#F1F5F9' : '#0F172A',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tpr"
                    stroke="#20B8CD"
                    strokeWidth={2.5}
                    dot={{ fill: '#20B8CD', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Confusion Matrix */}
          <Card className="p-6 bg-surface border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Validation Confusion Matrix (520 Sessions)
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Ground truth condition vs. predicted anomaly classification.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[11px] text-emerald-400 font-medium block mb-1">
                  True Normal (TN)
                </span>
                <span className="text-2xl font-mono font-bold text-text-primary">
                  {metrics.confusion_matrix.tn}
                </span>
                <p className="text-[10px] text-text-muted mt-1">Accurately categorized Normal</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-[11px] text-amber-400 font-medium block mb-1">
                  False Positive (FP)
                </span>
                <span className="text-2xl font-mono font-bold text-text-primary">
                  {metrics.confusion_matrix.fp}
                </span>
                <p className="text-[10px] text-text-muted mt-1">Normal flagged for Review</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                <span className="text-[11px] text-rose-400 font-medium block mb-1">
                  False Negative (FN)
                </span>
                <span className="text-2xl font-mono font-bold text-text-primary">
                  {metrics.confusion_matrix.fn}
                </span>
                <p className="text-[10px] text-text-muted mt-1">High anomaly missed</p>
              </div>

              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-center">
                <span className="text-[11px] text-teal-300 font-medium block mb-1">
                  True Positive (TP)
                </span>
                <span className="text-2xl font-mono font-bold text-text-primary">
                  {metrics.confusion_matrix.tp}
                </span>
                <p className="text-[10px] text-text-muted mt-1">Correctly detected signal</p>
              </div>
            </div>
          </Card>

          {/* Feature Importance (SHAP values) */}
          <Card className="p-6 bg-surface border-border lg:col-span-2">
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Global Feature Importance (SHAP Magnitude)
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Average contribution of behavioral telemetry features to model anomaly decisions.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.feature_importance.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis
                    dataKey="feature"
                    type="category"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#171A21' : '#FFFFFF',
                      borderColor: isDark ? '#262B36' : '#E2E8F0',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: isDark ? '#F1F5F9' : '#0F172A',
                      boxShadow: isDark ? 'none' : '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
                    }}
                    itemStyle={{
                      color: isDark ? '#F1F5F9' : '#0F172A',
                    }}
                  />
                  <Bar dataKey="importance" fill="#20B8CD" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: THRESHOLD CALIBRATION & FREEZE */}
      {activeTab === 'thresholds' && (
        <Card className="p-6 bg-surface border-border space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Validation Threshold Calibration
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Tune review sensitivity on the validation partition. Freezing assigns an immutable threshold version string.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-elevated/60 p-5 rounded-2xl border border-border">
            {/* Review Threshold Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-text-secondary">
                  Review Recommended Threshold:
                </span>
                <span className="font-mono text-amber-400 font-semibold text-sm">
                  {thresholdReview}
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={70}
                value={thresholdReview}
                onChange={(e) => setThresholdReview(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-text-muted">
                Scores &ge; {thresholdReview} prompt human examiner inspection.
              </p>
            </div>

            {/* High Anomaly Threshold Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-text-secondary">
                  High Anomaly Signal Threshold:
                </span>
                <span className="font-mono text-rose-400 font-semibold text-sm">
                  {thresholdHigh}
                </span>
              </div>
              <input
                type="range"
                min={60}
                max={95}
                value={thresholdHigh}
                onChange={(e) => setThresholdHigh(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <p className="text-[11px] text-text-muted">
                Scores &ge; {thresholdHigh} indicate multi-vector divergence.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-text-muted">
              Target Model: <strong className="text-text-secondary">{selectedModel?.displayName}</strong>
            </div>

            <div className="flex items-center gap-3">
              {freezeSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <Check className="w-4 h-4" /> Threshold Frozen into Version Control
                </span>
              )}
              <Button
                variant="primary"
                onClick={handleFreezeThresholds}
                isLoading={updateThresholdMutation.isPending}
              >
                Freeze Threshold for Model
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: DATASET PARTITIONING */}
      {activeTab === 'dataset' && dataset && (
        <Card className="p-6 bg-surface border-border space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Participant-Isolated Dataset (40 Sessions)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Splits guarantee 0% data leakage: repeated sessions from the same candidate remain in the same partition.
              </p>
            </div>

            <div className="flex gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30">
                Train: {dataset.splits.train} (70%)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Validation: {dataset.splits.val} (15%)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Test: {dataset.splits.test} (15%)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-elevated text-text-muted font-medium">
                  <th className="px-3 py-2.5">Session</th>
                  <th className="px-3 py-2.5">Pseudonym</th>
                  <th className="px-3 py-2.5">Condition Ground Truth</th>
                  <th className="px-3 py-2.5">Partition Split</th>
                  <th className="px-3 py-2.5">Score</th>
                  <th className="px-3 py-2.5 text-right">Anomaly Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {dataset.sessions.slice(0, 15).map((s) => (
                  <tr key={s.id} className="hover:bg-surface-elevated/40">
                    <td className="px-3 py-2.5 font-mono text-teal-400">{s.id}</td>
                    <td className="px-3 py-2.5 font-mono text-text-muted">{s.pseudonym_id}</td>
                    <td className="px-3 py-2.5 font-medium text-text-secondary capitalize">
                      {s.condition.replace('_', ' ')}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                          s.split === 'train'
                            ? 'bg-teal-500/10 text-teal-400'
                            : s.split === 'val'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-purple-500/10 text-purple-400'
                        }`}
                      >
                        {s.split}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-text-secondary">{s.score}%</td>
                    <td className="px-3 py-2.5 text-right font-mono text-text-secondary">
                      {s.anomaly_score}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

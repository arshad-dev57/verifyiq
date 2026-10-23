import React, { useState } from 'react';
import { useAssessments, useCreateAssessment } from '../../hooks/queries';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { FileCode, Plus, Clock, Users, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AssessmentsListPage: React.FC = () => {
  const { data: assessments, isLoading } = useAssessments();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDuration, setNewDuration] = useState(45);
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const createMutation = useCreateAssessment();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createMutation.mutateAsync({
      title: newTitle,
      description: newDescription,
      duration_minutes: newDuration,
      difficulty: newDifficulty,
      status: 'published',
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  if (isLoading || !assessments) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Programming Assessments
          </h1>
          <p className="text-text-muted text-xs mt-1">
            Author algorithmic challenges, configure unit test suites, and enforce telemetry capture.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.map((asm) => (
          <Card
            key={asm.id}
            variant="interactive"
            className="p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                    asm.difficulty === 'hard'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : asm.difficulty === 'medium'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {asm.difficulty}
                </span>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    asm.status === 'published'
                      ? 'bg-teal-500/10 text-teal-300'
                      : 'bg-surface-elevated/50 text-text-muted'
                  }`}
                >
                  {asm.status}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-text-primary mb-1.5 leading-snug">
                {asm.title}
              </h3>

              <p className="text-xs text-text-muted line-clamp-3 mb-4 leading-relaxed">
                {asm.description}
              </p>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-text-subtle" />
                {asm.duration_minutes} mins
              </span>
              <span className="text-teal-400 text-[11px] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Configure Tasks <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md p-6 bg-surface border-border shadow-2xl">
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Create New Assessment
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Add problem specifications and time boundaries.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Assessment Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus in Python"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summary of problem domains evaluated..."
                  className="w-full bg-surface-elevated border border-border rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-teal-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={createMutation.isPending}
                >
                  Create Assessment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

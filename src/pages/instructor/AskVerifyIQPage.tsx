import React, { useState } from 'react';
import { Search, Sparkles, CornerDownLeft, RefreshCw, ArrowRight } from 'lucide-react';
import { assistantApi } from '../../lib/api';
import { AssistantSource } from '../../types';
import { StreamingMarkdown } from '../../components/ui/StreamingMarkdown';
import { SourceCard } from '../../components/ui/SourceCard';
import { Card } from '../../components/ui/Card';

export const AskVerifyIQPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [answerStream, setAnswerStream] = useState<string>('');
  const [sources, setSources] = useState<AssistantSource[]>([]);

  const suggestionChips = [
    'Which sessions need review this week?',
    'Compare Random Forest vs XGBoost',
    'Why was session S-1003 flagged?',
    'What features most strongly correlate with anomaly flags?',
  ];

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim() || isSubmitting) return;

    setActiveQuestion(questionText);
    setAnswerStream('');
    setSources([]);
    setIsSubmitting(true);

    try {
      const response = await assistantApi.ask(
        questionText,
        undefined,
        (chunk) => {
          setAnswerStream((prev) => prev + chunk);
        }
      );
      setSources(response.sources || []);
    } catch (err) {
      setAnswerStream('Unable to retrieve behavioral analysis. Please verify your query or connectivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAsk(query);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* If no question has been asked yet, show centered Perplexity-style hero */}
      {!activeQuestion ? (
        <div className="text-center pt-12 pb-8 animate-in fade-in duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Telemetry Intelligence Assistant</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-3">
            Ask Verify<span className="text-teal-400">IQ</span>
          </h1>
          <p className="text-text-muted text-sm max-w-lg mx-auto mb-8">
            Query cohort distributions, behavioral anomaly explanations, model benchmark metrics, or specific session evidence.
          </p>

          {/* Centered Large Search Input Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center bg-surface border border-border/90 hover:border-teal-500/50 rounded-2xl shadow-xl transition-all focus-within:border-teal-500/80 focus-within:ring-2 focus-within:ring-teal-500/20">
              <Search className="w-5 h-5 text-text-muted ml-4 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about candidate sessions, telemetry features, or ML models..."
                className="w-full bg-transparent px-3 py-4 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none"
              />
              <button
                onClick={() => handleAsk(query)}
                disabled={!query.trim() || isSubmitting}
                className="mr-3 p-2 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-30 disabled:hover:bg-teal-500 text-slate-950 transition-colors"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            <span className="text-xs text-text-subtle mr-1">Suggested:</span>
            {suggestionChips.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setQuery(chip);
                  handleAsk(chip);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-surface-elevated hover:bg-surface-elevated text-text-secondary hover:text-text-primary border border-border transition-colors text-left flex items-center gap-1.5 group"
              >
                <span>{chip}</span>
                <ArrowRight className="w-3 h-3 text-text-subtle group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Answer Page State */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Query Bar at Top of Answer Page */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 flex items-center bg-surface border border-border rounded-xl">
              <Search className="w-4 h-4 text-text-muted ml-3.5 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a follow-up inquiry..."
                className="w-full bg-transparent px-3 py-2.5 text-xs text-text-primary placeholder:text-text-subtle focus:outline-none"
              />
              <button
                onClick={() => handleAsk(query)}
                disabled={!query.trim() || isSubmitting}
                className="mr-2 px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:opacity-30 text-slate-950 text-xs font-medium transition-colors"
              >
                Search
              </button>
            </div>
            <button
              onClick={() => {
                setActiveQuestion(null);
                setAnswerStream('');
                setSources([]);
                setQuery('');
              }}
              className="p-2.5 rounded-xl border border-border bg-surface text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
              title="Reset search"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Active Question Title */}
          <div className="pt-2">
            <h2 className="text-xl md:text-2xl font-semibold text-text-primary tracking-tight">
              {activeQuestion}
            </h2>
          </div>

          {/* Sources Section (Numbered Cards) */}
          {sources.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <span>Sources & Grounded Evidence</span>
                <span className="text-teal-400 font-mono">({sources.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {sources.map((source, idx) => (
                  <SourceCard key={`${source.id}-${idx}`} source={source} index={idx} />
                ))}
              </div>
            </div>
          )}

          {/* Answer Card with Streaming Markdown */}
          <Card className="p-6 md:p-8 bg-surface border-border">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Synthesized Evidence Answer
              </span>
              {isSubmitting && (
                <span className="text-xs text-teal-400 animate-pulse font-mono ml-auto">
                  Generating telemetry analysis...
                </span>
              )}
            </div>

            <StreamingMarkdown
              content={answerStream || (isSubmitting ? 'Querying cohort database and evaluating behavioral deviations...' : '')}
              isStreaming={isSubmitting}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';

interface StreamingMarkdownProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  content,
  isStreaming = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'prose prose-invert max-w-none text-sm text-text-secondary leading-relaxed space-y-3',
        className
      )}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-text-primary tracking-tight mt-4 mb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-text-primary tracking-tight mt-3 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-teal-400 mt-2 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-text-secondary leading-relaxed mb-2.5">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 my-2 text-text-secondary">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 my-2 text-text-secondary">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-text-primary">{children}</strong>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-surface-elevated text-teal-300 font-mono text-xs border border-border">
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-border">
              <table className="w-full text-left text-xs border-collapse divide-y divide-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-elevated text-text-secondary font-medium">{children}</thead>
          ),
          th: ({ children }) => <th className="px-3 py-2 border-b border-border">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 border-b border-border/60 text-text-secondary">{children}</td>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-teal-500/50 pl-3 py-1 my-2 italic text-text-muted bg-surface/40 rounded-r-lg">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-teal-400 animate-pulse align-middle" />
      )}
    </div>
  );
};

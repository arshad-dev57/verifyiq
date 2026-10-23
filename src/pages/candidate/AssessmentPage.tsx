import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useThemeStore } from '../../stores/themeStore';
import { sessionsApi, assessmentsApi } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Play,
  Send,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  Terminal,
  FileText,
} from 'lucide-react';
import { Assessment, Task } from '../../types';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sessionId, setSessionId] = useState<string>(searchParams.get('session_id') || '');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [testOutput, setTestOutput] = useState<{
    tests_passed: number;
    tests_total: number;
    results: any[];
    output: string;
  } | null>(null);

  const { isDark } = useThemeStore();

  const { trackCodeChange, trackTestRun, trackSubmitAttempt } = useTelemetry({
    sessionId: sessionId || 'temp-session',
    enabled: !!sessionId,
  });

  // Load Assessment & Active Session
  useEffect(() => {
    let isMounted = true;
    const initEnvironment = async () => {
      try {
        let sid = sessionId;
        let asmId = searchParams.get('assessment_id') || '';

        // If no session passed, find or create one
        if (!sid) {
          const listRes = await sessionsApi.getSessions({ status: 'in_progress' });
          if (listRes.sessions && listRes.sessions.length > 0) {
            sid = listRes.sessions[0].id;
            asmId = listRes.sessions[0].assessment_id;
          } else {
            // Fetch first available assessment
            const asms = await assessmentsApi.getAssessments();
            if (asms.length > 0) {
              asmId = asms[0].id;
              const newSession = await sessionsApi.createSession({
                assessment_id: asmId,
                consent: true,
              });
              sid = newSession.id;
            }
          }
          if (sid && isMounted) setSessionId(sid);
        }

        // Fetch session or assessment
        if (sid) {
          try {
            const sess = await sessionsApi.getSession(sid);
            asmId = sess.assessment_id;
          } catch { }
        }

        if (!asmId) asmId = 'asm-py-101';
        let asm: Assessment | null = null;
        try {
          asm = await assessmentsApi.getAssessment(asmId);
        } catch {
          try {
            const allAsms = await assessmentsApi.getAssessments();
            if (allAsms.length > 0) {
              asm = allAsms.find((a) => a.id === asmId) || allAsms[0];
            }
          } catch { }
        }

        if (isMounted && asm) {
          setAssessment(asm);
          const t: Task = (asm.tasks && asm.tasks.length > 0) ? asm.tasks[0] : {
            id: `tsk-${asm.id}`,
            assessment_id: asm.id,
            title: `${asm.title} - Main Task`,
            statement: asm.description || 'Implement the solution according to the requirements.',
            language: 'python' as const,
            starter_code: `# Assessment: ${asm.title}\n\ndef solve(*args, **kwargs):\n    # Write your solution below\n    return True\n\nif __name__ == '__main__':\n    print("Executing solution:", solve())\n`,
            test_config: {
              test_cases: [
                {
                  id: 'tc-1',
                  input: 'solve()',
                  expected_output: 'True',
                  is_hidden: false,
                  explanation: 'Initial verification run',
                },
              ],
              timeout_ms: 5000,
              memory_limit_mb: 256,
            },
            points: 100,
          };
          setTask(t);
          if (t) {
            setCode(t.starter_code);
          }
          setTimeLeft((asm.duration_minutes || 45) * 60);
        }
      } catch (err) {
        console.error('Failed to initialize assessment:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initEnvironment();
    return () => {
      isMounted = false;
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [code, sessionId]);

  const handleEditorChange = (val: string | undefined) => {
    const newCode = val || '';
    const charsAdded = Math.max(0, newCode.length - code.length);
    const charsRemoved = Math.max(0, code.length - newCode.length);
    setCode(newCode);

    // Track character delta and timestamp without logging the actual characters
    trackCodeChange(charsAdded, charsRemoved, newCode.length);
  };

  const handleRunCode = async () => {
    if (!sessionId || !task) return;
    setIsRunning(true);
    try {
      const res = await sessionsApi.runCode(sessionId, code, task.id);
      setTestOutput(res);
      trackTestRun(1, res.tests_passed === res.tests_total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || !sessionId) return;
    if (!confirm('Are you ready to finalize and submit your assessment solution? Telemetry recording will conclude.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await trackSubmitAttempt();
      await sessionsApi.submitSession(sessionId, code);
      navigate(`/candidate/confirmation?session_id=${sessionId}`);
    } catch (err) {
      navigate(`/candidate/confirmation?session_id=${sessionId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-8 space-y-4 bg-background">
        <Skeleton className="h-12 w-full" />
        <div className="flex-1 grid grid-cols-12 gap-4">
          <Skeleton className="col-span-5 h-[500px]" />
          <Skeleton className="col-span-7 h-[500px]" />
        </div>
      </div>
    );
  }

  if (!assessment || !task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background min-h-[60vh] space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-text-primary">
          Assessment Session Unavailable
        </h2>
        <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
          The requested assessment or session ID could not be retrieved. Please check your invitation link or return to your dashboard.
        </p>
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/candidate')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeCritical = timeLeft < 300; // < 5 mins

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3rem)] overflow-hidden bg-background">
      {/* Top Controls Bar */}
      <div className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-text-primary truncate max-w-sm">
            {task.title}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-teal-300 border border-border">
            {task.language.toUpperCase()}
          </span>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 text-[10px] text-teal-300 border border-teal-500/20 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>PRIVACY TELEMETRY ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-semibold border ${isTimeCritical
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                : 'bg-surface-elevated border-border text-text-secondary'
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleRunCode}
            isLoading={isRunning}
          >
            <Play className="w-3.5 h-3.5 mr-1 text-teal-400" />
            Run Tests
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Submit Solution
          </Button>
        </div>
      </div>

      {/* Main Split Body: Left = Problem Statement, Right = Monaco Editor + Output */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left: Problem Statement & Test Cases (5 Cols) */}
        <div className="md:col-span-5 border-r border-border p-6 overflow-y-auto bg-surface/40 space-y-6">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Problem Statement</span>
            </div>
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">
              {task.title}
            </h2>
          </div>

          <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">
            {task.statement}
          </div>

          <div className="pt-4 border-t border-border space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Visible Test Cases
            </h3>
            <div className="space-y-2">
              {task.test_config?.test_cases
                ?.filter((tc) => !tc.is_hidden)
                .map((tc, idx) => (
                  <div
                    key={tc.id || idx}
                    className="p-3 rounded-xl bg-surface-elevated/70 border border-border text-xs space-y-1 font-mono"
                  >
                    <span className="text-[10px] text-text-subtle font-sans block">
                      Case #{idx + 1}: {tc.explanation || 'Sample assertion'}
                    </span>
                    <div className="text-text-secondary">
                      <span className="text-text-subtle">Input:</span> {tc.input}
                    </div>
                    <div className="text-teal-300">
                      <span className="text-text-subtle">Expected:</span> {tc.expected_output}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right: Monaco Editor + Output Drawer (7 Cols) */}
        <div className="md:col-span-7 flex flex-col h-full overflow-hidden bg-surface">
          {/* Monaco Editor Canvas */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage={task.language === 'python' ? 'python' : 'javascript'}
              value={code}
              theme={isDark ? 'vs-dark' : 'light'}
              onChange={handleEditorChange}
              options={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                roundedSelection: true,
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>

          {/* Test Execution Output Drawer */}
          <div className="h-48 border-t border-border bg-surface-elevated/70 flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-surface border-b border-border flex items-center justify-between text-xs">
              <span className="font-semibold text-text-secondary flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                Execution Results & Sandbox Stdout
              </span>
              {testOutput && (
                <span
                  className={`font-mono text-[11px] px-2 py-0.5 rounded-full font-semibold ${testOutput.tests_passed === testOutput.tests_total
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                >
                  {testOutput.tests_passed}/{testOutput.tests_total} Tests Passed
                </span>
              )}
            </div>

            <div className="p-4 overflow-y-auto font-mono text-xs text-text-secondary leading-relaxed space-y-2">
              {isRunning ? (
                <div className="text-text-subtle animate-pulse">
                  Dispatching code execution to isolated runner sandbox...
                </div>
              ) : testOutput ? (
                <>
                  <div className="whitespace-pre-wrap text-text-secondary">
                    {testOutput.output}
                  </div>
                  {testOutput.results?.map((res, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[11px] pt-1 text-text-muted"
                    >
                      {res.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span>Test Case #{i + 1} ({res.duration_ms}ms):</span>
                      <span className="text-text-secondary">{res.stdout}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-text-subtle">
                  Click <strong className="text-text-secondary">"Run Tests"</strong> above to compile and execute test assertions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

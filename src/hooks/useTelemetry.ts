import { useEffect, useRef, useCallback } from 'react';
import { TelemetryEvent, EventType } from '../types';
import { telemetryApi } from '../lib/api';

interface UseTelemetryOptions {
  sessionId: string;
  enabled?: boolean;
}

export function useTelemetry({ sessionId, enabled = true }: UseTelemetryOptions) {
  const eventQueueRef = useRef<TelemetryEvent[]>([]);
  const lastKeyTimeRef = useRef<number>(Date.now());
  const idleTimerRef = useRef<any>(null);
  const isIdleRef = useRef<boolean>(false);
  const mouseDistanceAccumulatorRef = useRef<number>(0);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const lastMouseMoveFlushRef = useRef<number>(Date.now());
  const batchIntervalRef = useRef<any>(null);
  const retryCountRef = useRef<number>(0);

  // Helper to enqueue event strictly adhering to privacy guarantees
  const enqueueEvent = useCallback(
    (eventType: EventType, metadata: TelemetryEvent['metadata']) => {
      if (!enabled || !sessionId) return;

      const event: TelemetryEvent = {
        session_id: sessionId,
        event_type: eventType,
        ts_ms: Date.now(),
        metadata,
      };

      eventQueueRef.current.push(event);
    },
    [enabled, sessionId]
  );

  // Reset idle timer (flags idle > 5 seconds)
  const resetIdleTimer = useCallback(() => {
    if (isIdleRef.current) {
      isIdleRef.current = false;
      enqueueEvent('idle_end', { reason: 'user_activity_resumed' });
    }

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      enqueueEvent('idle_start', { duration_ms: 5000 });
    }, 5000);
  }, [enqueueEvent]);

  // Flush queued events to backend
  const flushQueue = useCallback(async () => {
    if (eventQueueRef.current.length === 0 || !sessionId) return;

    // Flush any pending mouse movement summary
    if (mouseDistanceAccumulatorRef.current > 0) {
      eventQueueRef.current.push({
        session_id: sessionId,
        event_type: 'mouse_move_summary',
        ts_ms: Date.now(),
        metadata: { distance_px: Math.round(mouseDistanceAccumulatorRef.current) },
      });
      mouseDistanceAccumulatorRef.current = 0;
    }

    const eventsToSend = [...eventQueueRef.current];
    eventQueueRef.current = [];

    try {
      await telemetryApi.sendBatch(sessionId, eventsToSend);
      retryCountRef.current = 0;
    } catch (err) {
      // Re-queue un-sent events with exponential backoff
      eventQueueRef.current = [...eventsToSend, ...eventQueueRef.current];
      retryCountRef.current = Math.min(retryCountRef.current + 1, 5);
      console.warn(`[Telemetry] Batch failed, retrying (attempt ${retryCountRef.current})`, err);
    }
  }, [sessionId]);

  // Global listeners for keydown/keyup timing, paste length, focus/blur
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const handleKeyDown = () => {
      resetIdleTimer();
      const now = Date.now();
      const interKeyMs = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // PRIVACY RULE: Never capture key character or code, only elapsed timing delta
      enqueueEvent('key_interval', {
        inter_key_ms: Math.min(interKeyMs, 10000),
      });
    };

    const handlePaste = (e: ClipboardEvent) => {
      resetIdleTimer();
      const pastedText = e.clipboardData?.getData('text') || '';
      // PRIVACY RULE: Never store text content; only measure length of inserted payload
      enqueueEvent('paste', {
        paste_length: pastedText.length,
      });
    };

    const handleCut = (e: ClipboardEvent) => {
      resetIdleTimer();
      const selected = window.getSelection()?.toString() || '';
      enqueueEvent('cut', {
        cut_length: selected.length,
      });
    };

    const handleFocus = () => {
      enqueueEvent('focus', { reason: 'window_focused' });
    };

    const handleBlur = () => {
      enqueueEvent('blur', { reason: 'window_blurred' });
    };

    const handleVisibilityChange = () => {
      enqueueEvent('visibility_change', {
        reason: document.hidden ? 'document_hidden' : 'document_visible',
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      resetIdleTimer();
      if (lastMousePosRef.current) {
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        mouseDistanceAccumulatorRef.current += Math.sqrt(dx * dx + dy * dy);
      }
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      const now = Date.now();
      // Throttle mouse distance summary every 3 seconds
      if (now - lastMouseMoveFlushRef.current > 3000 && mouseDistanceAccumulatorRef.current > 10) {
        enqueueEvent('mouse_move_summary', {
          distance_px: Math.round(mouseDistanceAccumulatorRef.current),
        });
        mouseDistanceAccumulatorRef.current = 0;
        lastMouseMoveFlushRef.current = now;
      }
    };

    const handleClick = (e: MouseEvent) => {
      resetIdleTimer();
      const target = (e.target as HTMLElement)?.tagName?.toLowerCase() || 'unknown';
      enqueueEvent('click', { click_target: target });
    };

    const handleScroll = () => {
      resetIdleTimer();
    };

    // Unload beacon to guarantee delivery on page exit
    const handleBeforeUnload = () => {
      if (eventQueueRef.current.length > 0) {
        const payload = JSON.stringify({ events: eventQueueRef.current });
        const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/sessions/${sessionId}/telemetry`;
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('cut', handleCut);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Batch sender every 5 seconds
    batchIntervalRef.current = setInterval(() => {
      flushQueue();
    }, 5000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('cut', handleCut);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      flushQueue();
    };
  }, [enabled, sessionId, enqueueEvent, resetIdleTimer, flushQueue]);

  // Hook helpers for Monaco code change tracking
  const trackCodeChange = useCallback(
    (charsAdded: number, charsRemoved: number, totalLength: number) => {
      resetIdleTimer();
      enqueueEvent('code_change', {
        chars_added: charsAdded,
        chars_removed: charsRemoved,
        code_length: totalLength,
      });
    },
    [enqueueEvent, resetIdleTimer]
  );

  const trackTestRun = useCallback(
    (runIndex: number, passed: boolean) => {
      enqueueEvent('run_test', {
        test_run_index: runIndex,
        test_passed: passed,
      });
      flushQueue();
    },
    [enqueueEvent, flushQueue]
  );

  const trackSubmitAttempt = useCallback(
    (reason = 'candidate_submit') => {
      enqueueEvent('submit_attempt', { reason });
      return flushQueue();
    },
    [enqueueEvent, flushQueue]
  );

  return {
    trackCodeChange,
    trackTestRun,
    trackSubmitAttempt,
    flushQueue,
    getQueuedCount: () => eventQueueRef.current.length,
  };
}

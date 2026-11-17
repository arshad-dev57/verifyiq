import React, { useEffect, useRef } from 'react';

/**
 * Interactive "telemetry field" background.
 *
 * - A dot grid breathes slowly on its own (so the page feels alive without a cursor).
 * - Dots near the cursor get pushed away, grow and turn emerald.
 * - Thin lines connect the cursor to nearby dots, like a signal being traced.
 * - A soft glow trails the cursor with a little lag.
 * - Clicking sends a ripple across the grid.
 *
 * It fills its nearest positioned parent and ignores pointer events, so page content
 * stays fully clickable. Listeners are attached to the parent element.
 */

const SPACING = 30;
const RADIUS = 150;
const BASE = [163, 163, 163]; // neutral-400
const HOT = [16, 185, 129]; // emerald-500

type Dot = { x: number; y: number; ox: number; oy: number };
type Ripple = { x: number; y: number; t0: number };

export const HeroBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let dots: Dot[] = [];
    let raf = 0;
    let running = true;
    const ripples: Ripple[] = [];

    // target = real pointer, glow = lagged pointer used for the soft light
    const pointer = { x: -9999, y: -9999, active: false };
    const glow = { x: 0, y: 0, a: 0 };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;
      const offX = (w - (cols - 1) * SPACING) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // stagger every other row for a more organic look
          const x = offX + c * SPACING + (r % 2 ? SPACING / 2 : 0);
          dots.push({ x, y: r * SPACING, ox: 0, oy: 0 });
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = pointer.y > -40 && pointer.y < rect.height + 40;
      if (glow.a === 0 && pointer.active) {
        glow.x = pointer.x;
        glow.y = pointer.y;
      }
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onDown = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t0: performance.now() });
      if (ripples.length > 4) ripples.shift();
    };

    const draw = (now: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // ease the glow towards the pointer
      glow.x += (pointer.x - glow.x) * 0.12;
      glow.y += (pointer.y - glow.y) * 0.12;
      glow.a += ((pointer.active ? 1 : 0) - glow.a) * 0.08;

      if (glow.a > 0.01) {
        const g = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, 280);
        g.addColorStop(0, `rgba(16,185,129,${0.14 * glow.a})`);
        g.addColorStop(0.5, `rgba(16,185,129,${0.05 * glow.a})`);
        g.addColorStop(1, 'rgba(16,185,129,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // drop finished ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].t0 > 1400) ripples.splice(i, 1);
      }

      const t = now / 1000;
      const lines: { x: number; y: number; k: number }[] = [];

      for (const d of dots) {
        let tx = 0;
        let ty = 0;
        let influence = 0;

        // cursor repulsion
        if (pointer.active) {
          const dx = d.x - pointer.x;
          const dy = d.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS && dist > 0.001) {
            const k = 1 - dist / RADIUS;
            influence = k;
            const push = k * k * 26;
            tx += (dx / dist) * push;
            ty += (dy / dist) * push;
          }
        }

        // click ripples
        for (const rp of ripples) {
          const age = now - rp.t0;
          const front = age * 0.55; // px per ms
          const dx = d.x - rp.x;
          const dy = d.y - rp.y;
          const dist = Math.hypot(dx, dy);
          const band = Math.abs(dist - front);
          if (band < 70 && dist > 0.001) {
            const k = (1 - band / 70) * (1 - age / 1400);
            tx += (dx / dist) * k * 20;
            ty += (dy / dist) * k * 20;
            influence = Math.max(influence, k);
          }
        }

        // ease dot towards its target offset
        d.ox += (tx - d.ox) * 0.16;
        d.oy += (ty - d.oy) * 0.16;

        // idle breathing
        const wave = reduceMotion ? 0 : (Math.sin(t * 0.9 + d.x * 0.012 + d.y * 0.01) + 1) / 2;

        const px = d.x + d.ox;
        const py = d.y + d.oy;
        const size = 1.1 + wave * 0.55 + influence * 2.4;
        const mix = Math.min(1, influence * 1.3);
        const r = BASE[0] + (HOT[0] - BASE[0]) * mix;
        const g = BASE[1] + (HOT[1] - BASE[1]) * mix;
        const b = BASE[2] + (HOT[2] - BASE[2]) * mix;
        const alpha = 0.35 + wave * 0.2 + influence * 0.45;

        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${Math.min(alpha, 1)})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();

        if (influence > 0.3 && pointer.active) lines.push({ x: px, y: py, k: influence });
      }

      // cursor-to-dot "signal trace" lines
      if (lines.length) {
        ctx.lineWidth = 1;
        for (const l of lines) {
          ctx.strokeStyle = `rgba(16,185,129,${l.k * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(l.x, l.y);
          ctx.stroke();
        }
        // small ring around the cursor
        ctx.strokeStyle = 'rgba(16,185,129,0.55)';
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // pause rendering while the hero is off screen
    const io = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      if (visible && !running) {
        running = true;
        raf = requestAnimationFrame(draw);
      } else if (!visible) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(host);

    // listen on window so the effect works even though content sits above the canvas
    window.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('pointerdown', onDown);

    if (reduceMotion) {
      // draw a single static frame
      draw(performance.now());
      running = false;
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointerdown', onDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
      }}
    />
  );
};
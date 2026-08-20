'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Footer.module.css';

/* --- the dot field -------------------------------------------------------- */
/* Grid pitch and dot radius as fractions of the font size, carried over from the CSS
   treatment this replaces so the texture is unchanged — 0.075em cells, 0.0255em dots. */
const CELL_EM = 0.075;
const DOT_EM = 0.0255;
const ALPHA_MIN = 128;

/** Room around the text for dots that have been pushed out of the letterform. */
const BLEED = 46;

/** Above this the draw call starts to cost real milliseconds, so the grid coarsens instead. */
const MAX_DOTS = 9000;

/* --- the physics ---------------------------------------------------------- */
/** Repulsion reach, in CSS px. Scaled with the type so it covers a similar span of letters
    at every viewport, with a floor for the small end. */
const REACH_EM = 1.8;
const REACH_MIN = 90;

/** Acceleration at the centre of the cursor, falling linearly to zero at the reach. */
const PUSH = 2.6;

/** Spring home. 0.075/0.82 settles in about half a second without overshooting into wobble. */
const STIFFNESS = 0.075;
const DAMPING = 0.82;

/** Speed below which a dot counts as stopped. When none are moving, the loop shuts down. */
const REST = 0.06;

/** Net acceleration below which the forces on a dot count as balanced. A dot merely away
    from its mark carries spring acceleration of offset x STIFFNESS — 0.07 per pixel out — so
    this only ever passes where the cursor's push genuinely cancels the spring. */
const REST_FORCE = 0.02;

/** The offset at which spring acceleration falls to REST_FORCE — the widest a dot could stop
    short of its mark. Snapping at exactly this distance means a dot that stops is always
    exactly home, with no sub-pixel residue left in the letterform. */
const HOME = REST_FORCE / STIFFNESS;

const TAU = Math.PI * 2;

type Field = {
  count: number;
  /** origin, current position, velocity */
  ox: Float32Array;
  oy: Float32Array;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  /** per-dot push strength and a fixed scatter direction, so the field breaks up unevenly
      rather than bulging as one clean radial ring */
  k: Float32Array;
  sx: Float32Array;
  sy: Float32Array;
};

/** Greedy wrap — the line has to fit the footer on a phone, where it breaks into three. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = words[0] ?? '';

  for (let i = 1; i < words.length; i += 1) {
    const next = `${line} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
    } else {
      lines.push(line);
      line = words[i];
    }
  }

  if (line) lines.push(line);
  return lines;
}

/** Walk the rendered glyphs on a `step` grid and keep a dot wherever there is ink. */
function sample(image: ImageData, cssW: number, cssH: number, dpr: number, step: number) {
  const points: number[] = [];
  const deviceW = image.width;
  const data = image.data;

  for (let py = step / 2; py < cssH; py += step) {
    const dy = Math.min(image.height - 1, Math.round(py * dpr));
    const row = dy * deviceW;

    for (let px = step / 2; px < cssW; px += step) {
      const dx = Math.min(deviceW - 1, Math.round(px * dpr));
      if (data[(row + dx) * 4 + 3] > ALPHA_MIN) points.push(px, py);
    }
  }

  return points;
}

function toField(points: number[]): Field {
  const count = points.length / 2;
  const field: Field = {
    count,
    ox: new Float32Array(count),
    oy: new Float32Array(count),
    x: new Float32Array(count),
    y: new Float32Array(count),
    vx: new Float32Array(count),
    vy: new Float32Array(count),
    k: new Float32Array(count),
    sx: new Float32Array(count),
    sy: new Float32Array(count),
  };

  for (let i = 0; i < count; i += 1) {
    const px = points[i * 2];
    const py = points[i * 2 + 1];
    field.ox[i] = px;
    field.oy[i] = py;
    field.x[i] = px;
    field.y[i] = py;

    field.k[i] = 0.55 + Math.random() * 0.9;
    const angle = Math.random() * TAU;
    field.sx[i] = Math.cos(angle);
    field.sy[i] = Math.sin(angle);
  }

  return field;
}

/**
 * The closing headline, drawn as a field of dots that scatter away from the cursor and ease
 * back into the letterform behind it — the treatment the reference site uses.
 *
 * Canvas rather than DOM or SVG: the line is a few thousand dots, and a few thousand elements
 * would each need their own style write per frame. Here every dot is a slot in a set of typed
 * arrays and the whole field is one path and one `fill()`.
 *
 * What keeps it cheap when nothing is happening:
 *   - the loop runs only while dots are actually moving and stops the moment the field is
 *     still — whether that is back in the letterform or held out under a resting cursor — so
 *     an untouched footer costs nothing and a motionless one costs nothing either;
 *   - an IntersectionObserver stops it whenever the panel is off screen, which is most of
 *     the time on a long page;
 *   - it stops on a hidden tab as well.
 *
 * The real text stays in the document as the heading — the canvas is decoration with
 * `aria-hidden`, and before hydration (or without JS at all) the heading is the visible
 * element, carrying the static CSS dot treatment.
 */
export default function FooterDotText({ text }: { text: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const heading = headingRef.current;
    if (!host || !canvas || !heading) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    let field: Field | null = null;
    let builtWidth = 0;
    let dotRadius = 1.5;
    let reach = REACH_MIN;
    let cssW = 0;
    let cssH = 0;
    let dpr = 1;

    let frame = 0;
    let running = false;
    /* read, not assumed — a page opened in a background tab starts hidden and no
       visibilitychange fires to correct it */
    let visible = document.visibilityState === 'visible';
    let onScreen = false;

    /* -1 parks the cursor out of reach of every dot without a separate flag to check. */
    let pointerX = -1e4;
    let pointerY = -1e4;
    let pointerLive = false;

    const draw = () => {
      if (!field) return;
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = '#0b0b0b';
      ctx.beginPath();

      const { count, x, y } = field;
      for (let i = 0; i < count; i += 1) {
        /* moveTo before each arc, or the arcs are strung together by connecting lines */
        ctx.moveTo(x[i] + dotRadius, y[i]);
        ctx.arc(x[i], y[i], dotRadius, 0, TAU);
      }

      ctx.fill();
    };

    /** One integration step. Returns whether anything is still in motion. */
    const step = () => {
      if (!field) return false;

      const { count, ox, oy, x, y, vx, vy, k, sx, sy } = field;
      const reach2 = reach * reach;
      let moving = false;

      for (let i = 0; i < count; i += 1) {
        let ax = 0;
        let ay = 0;

        if (pointerLive) {
          const dx = x[i] - pointerX;
          const dy = y[i] - pointerY;
          const d2 = dx * dx + dy * dy;

          /* squared compare first — the sqrt only runs for dots actually in reach */
          if (d2 < reach2) {
            const d = Math.sqrt(d2) || 0.0001;
            const falloff = (1 - d / reach) * PUSH * k[i];
            /* mostly straight out from the cursor, part along this dot's own fixed
               direction, which is what turns a clean bulge into a scatter */
            ax = ((dx / d) * 0.78 + sx[i] * 0.22) * falloff;
            ay = ((dy / d) * 0.78 + sy[i] * 0.22) * falloff;
          }
        }

        /* spring back to the letterform */
        ax += (ox[i] - x[i]) * STIFFNESS;
        ay += (oy[i] - y[i]) * STIFFNESS;

        let nvx = (vx[i] + ax) * DAMPING;
        let nvy = (vy[i] + ay) * DAMPING;
        let nx = x[i] + nvx;
        let ny = y[i] + nvy;

        /* At rest means slow *and* unforced. Speed alone is not enough: a dot on its way home
           passes through low speeds while the spring still has all its work ahead of it, and
           calling that settled strands it several pixels out of the letterform. Net
           acceleration is what separates the two cases — it is ~0 only where the cursor's
           push and the spring cancel, which is a real standstill, and it is large anywhere
           the dot is simply away from its mark.

           That distinction is also what lets the loop stop under a resting cursor: the field
           holds its scattered shape, nothing is changing, and redrawing it would be waste.
           The moment the cursor moves or leaves, the balance breaks and the loop restarts. */
        if (
          Math.abs(nvx) < REST &&
          Math.abs(nvy) < REST &&
          Math.abs(ax) < REST_FORCE &&
          Math.abs(ay) < REST_FORCE
        ) {
          /* Snap only once the cursor is gone. With a cursor still in reach, moving a dot
             onto its origin removes the spring force that was balancing the push, and the
             push alone throws it straight back out — a quarter-pixel limit cycle that would
             keep the loop alive forever under a resting cursor. Unforced, the snap is safe
             and it is what leaves the letterform exactly as it was sampled. */
          if (
            !pointerLive &&
            Math.abs(nx - ox[i]) < HOME &&
            Math.abs(ny - oy[i]) < HOME
          ) {
            nx = ox[i];
            ny = oy[i];
          }
          nvx = 0;
          nvy = 0;
        } else {
          moving = true;
        }

        vx[i] = nvx;
        vy[i] = nvy;
        x[i] = nx;
        y[i] = ny;
      }

      return moving;
    };

    const tick = () => {
      const moving = step();
      draw();

      /* Motion alone decides, not whether the cursor is present. A cursor resting in reach
         holds the field in a steady scattered shape, and re-running an identical frame for
         as long as someone leaves the mouse there is exactly the continuous cost this is
         meant to avoid. Any move restarts the loop through `onPointerMove`. */
      if (moving) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
        frame = 0;
      }
    };

    const start = () => {
      if (running || !field || !onScreen || !visible || reduced.matches) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      running = false;
    };

    const build = () => {
      const width = host.clientWidth;
      if (!width) return;
      builtWidth = width;

      const style = getComputedStyle(heading);
      const fontSize = parseFloat(style.fontSize) || 48;
      const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.06;
      const content = style.textTransform === 'uppercase' ? text.toUpperCase() : text;

      dotRadius = fontSize * DOT_EM;
      reach = Math.max(REACH_MIN, fontSize * REACH_EM);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      /* not in every engine yet; where it is missing the line is a hair wider, nothing more */
      if ('letterSpacing' in ctx) ctx.letterSpacing = style.letterSpacing;

      const lines = wrap(ctx, content, Math.max(80, width - BLEED * 2));

      cssW = width;
      cssH = lines.length * lineHeight + BLEED * 2;

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = style.letterSpacing;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000000';

      lines.forEach((line, index) => {
        ctx.fillText(line, cssW / 2, BLEED + lineHeight * (index + 0.5));
      });

      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

      /* Coarsen rather than let the draw call grow without limit — a very wide viewport would
         otherwise put tens of thousands of dots in one path. */
      let cell = Math.max(2, fontSize * CELL_EM);
      let points = sample(image, cssW, cssH, dpr, cell);
      while (points.length / 2 > MAX_DOTS && cell < fontSize * 0.2) {
        cell *= 1.15;
        points = sample(image, cssW, cssH, dpr, cell);
      }

      field = toField(points);
      draw();
      setPainted(true);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!field || !onScreen) return;

      const rect = canvas.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;

      /* in reach means inside the canvas grown by the repulsion radius, so dots start moving
         as the cursor approaches rather than only once it is over them */
      const near =
        px > -reach && px < rect.width + reach && py > -reach && py < rect.height + reach;

      const wasLive = pointerLive;
      pointerLive = near;
      pointerX = near ? px : -1e4;
      pointerY = near ? py : -1e4;

      /* `wasLive` matters as much as `near`: the loop may have idled with the field held out
         under a resting cursor, and the move that carries the cursor out of reach is then the
         only thing that can wake it up to spring home. Moves that were never near anything
         start nothing, so the rest of the page costs no frames. */
      if (near || wasLive) start();
    };

    /* The cursor leaving the window is the case that has to be caught explicitly: no further
       pointermove arrives, so without this the field would sit scattered around wherever the
       cursor was last seen. */
    const onPointerLeave = () => {
      pointerLive = false;
      pointerX = -1e4;
      pointerY = -1e4;
      /* keep running so the field can spring home rather than jumping back */
      start();
    };

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      if (visible) start();
      else stop();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? false;
        if (onScreen) start();
        else stop();
      },
      { rootMargin: '120px' },
    );

    let resizeFrame = 0;
    const onResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        /* ResizeObserver reports once the moment it starts observing, which would otherwise
           re-run the whole sample-and-build immediately after the first one. Rebuilding is
           only worth it when the width actually moved. */
        if (host.clientWidth === builtWidth) return;
        stop();
        build();
        start();
      });
    };

    let alive = true;
    const boot = () => {
      if (!alive) return;
      build();
      observer.observe(host);
    };

    /* the glyph shapes are the whole point, so sample the real face rather than the fallback */
    if (document.fonts?.status === 'loaded') boot();
    else document.fonts?.ready.then(boot).catch(boot) ?? boot();

    const sizeObserver = new ResizeObserver(onResize);
    sizeObserver.observe(host);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    /* on the root element, not on window — pointerleave does not bubble, so a window
       listener never hears the cursor leave the document */
    document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('blur', onPointerLeave);
    /* ResizeObserver is the accurate signal; this is the belt to its braces, for the case a
       throttled or non-compositing page never delivers the observation */
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', onResize);

    return () => {
      alive = false;
      stop();
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', onResize);
    };
  }, [text]);

  return (
    <div className={styles.dotStage} ref={hostRef}>
      <h2
        className={`${styles.dotHeadline} ${painted ? 'sr-only' : ''}`}
        ref={headingRef}
      >
        <span className={styles.dotText}>{text}</span>
      </h2>

      <canvas ref={canvasRef} className={styles.dotCanvas} aria-hidden="true" />
    </div>
  );
}

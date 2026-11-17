import { useEffect, useRef } from "react";
import { THUMB_COUNT } from "@/lib/thumb-count";

type Thumb = { src: string; alt: string };

const thumbs: Thumb[] = Array.from({ length: THUMB_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { src: `/thumbs/t${n}.webp`, alt: `Thumbnail ${n}` };
});

// Each row has its own direction and pace. `dir` -1 moves left, +1 moves
// right. `speed` is in px per second (desktop); `start` is where in the loop
// the row begins, so the rows never line up.
const rows = [
  { dir: -1, speed: 57, start: 0.1 },
  { dir: 1, speed: 50, start: 0.37 },
  { dir: -1, speed: 54, start: 0.58 },
] as const;

// Deal the thumbnails out one by one so no thumbnail appears in two rows.
const rowThumbs: Thumb[][] = rows.map((_, r) =>
  thumbs.filter((_, i) => i % rows.length === r),
);

// Deterministic "random" 0–1 so the entrance order is scattered but stable.
const scatter = (i: number, r: number) => {
  const x = Math.sin(i * 12.9898 + r * 78.233 + 4.1) * 43758.5453;
  return x - Math.floor(x);
};

function Strip({
  items,
  row,
  hidden,
}: {
  items: Thumb[];
  row: number;
  hidden?: boolean;
}) {
  return (
    <ul
      aria-hidden={hidden}
      className="flex shrink-0 items-center gap-4 pr-4 sm:gap-6 sm:pr-6"
    >
      {items.map((t, i) => (
        <li
          key={t.src}
          className="card-in shrink-0"
          style={
            { "--d": `${(scatter(i, row) * 1.1).toFixed(2)}s` } as React.CSSProperties
          }
        >
          <div className="overflow-hidden rounded-xl bg-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_18px_-10px_rgba(0,0,0,0.28)] ring-1 ring-black/5 sm:rounded-2xl">
            <img
              src={t.src}
              srcSet={`${t.src.replace(".webp", "-sm.webp")} 480w, ${t.src} 960w`}
              sizes="(max-width: 640px) 240px, 480px"
              alt={hidden ? "" : t.alt}
              width={960}
              height={540}
              // Everything loads during the intro (it hides the wait), so no
              // thumbnail ever pops in later. Visible ones go first.
              fetchPriority={i < 4 ? "high" : "auto"}
              decoding="async"
              draggable={false}
              className="pointer-events-none block h-[var(--row-h)] w-auto select-none"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

type RowState = {
  pos: number; // current translateX, always in (-width, 0]
  width: number; // width of ONE set of thumbnails
  dragging: boolean;
  lastX: number;
};

export function Marquee({ ready }: { ready: boolean }) {
  const tracks = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef<RowState[]>(
    rows.map(() => ({ pos: 0, width: 0, dragging: false, lastX: 0 })),
  );

  useEffect(() => {
    const states = state.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const wrap = (s: RowState) => {
      if (s.width <= 0) return;
      s.pos = -((((-s.pos) % s.width) + s.width) % s.width);
    };

    const measure = () => {
      tracks.current.forEach((el, i) => {
        if (!el) return;
        const s = states[i];
        const width = el.scrollWidth / 2;
        if (width <= 0 || width === s.width) return;
        // Keep the same place in the loop when the size changes.
        const frac = s.width ? s.pos / s.width : -rows[i].start;
        s.width = width;
        s.pos = frac * width;
        wrap(s);
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    tracks.current.forEach((el) => el && ro.observe(el));

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Cards are smaller on phones, so the rows move a bit slower there.
      const scale = (window.innerWidth <= 640 ? 0.8 : 1) * (reduce ? 0.25 : 1);
      tracks.current.forEach((el, i) => {
        const s = states[i];
        if (!el || s.width <= 0) return;
        if (!s.dragging) {
          s.pos += rows[i].dir * rows[i].speed * scale * dt;
          wrap(s);
        }
        el.style.transform = `translate3d(${s.pos.toFixed(2)}px,0,0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // Grab a row: it stops and follows the pointer exactly; let go and it
  // carries on from wherever you left it. No momentum.
  const onDown = (r: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = state.current[r];
    s.dragging = true;
    s.lastX = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (r: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const s = state.current[r];
    if (!s.dragging) return;
    s.pos += e.clientX - s.lastX;
    s.lastX = e.clientX;
  };
  const onUp = (r: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    state.current[r].dragging = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      className={`marquee-rows flex w-full flex-col ${ready ? "is-ready" : ""}`}
    >
      {rows.map((_, r) => (
        <div
          key={r}
          className="marquee relative overflow-hidden py-2 sm:py-3"
          onPointerDown={onDown(r)}
          onPointerMove={onMove(r)}
          onPointerUp={onUp(r)}
          onPointerCancel={onUp(r)}
        >
          <div
            ref={(el) => {
              tracks.current[r] = el;
            }}
            className="marquee-track flex w-max"
          >
            <Strip items={rowThumbs[r]} row={r} />
            <Strip items={rowThumbs[r]} row={r} hidden />
          </div>
          {/* Soft edges: plain overlays, cheaper than masking the whole row. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-[7%]"
            style={{
              background:
                "linear-gradient(to right, #fbfbfd, rgba(251,251,253,0))",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-[7%]"
            style={{
              background:
                "linear-gradient(to left, #fbfbfd, rgba(251,251,253,0))",
            }}
          />
        </div>
      ))}
    </div>
  );
}

import { lazy, Suspense, useEffect, useRef, useState } from "react";

// The WebGL glass effect is only downloaded where it is used (see below).
const GlassIconReveal = lazy(() =>
  import("@/components/ui/liquid-glass-logo-reveal").then((m) => ({
    default: m.GlassIconReveal,
  })),
);

const BG = "#eeeef0";
const MAX_WAIT_MS = 7000; // safety net if the animation never reports back

// The liquid-glass shader is heavy and rendered a black square on phone GPUs,
// so touch devices and narrow screens get a lightweight CSS version of the
// same idea instead (a glass tile, the logo resolving out of a blur).
const useGlass =
  typeof window !== "undefined" &&
  !window.matchMedia("(pointer: coarse)").matches &&
  window.innerWidth >= 640;

/**
 * Full-screen intro: the logo is revealed, then the overlay dissolves into
 * the site. `onReveal` fires as the dissolve starts (the page begins to
 * appear); `onGone` once the overlay can be removed.
 */
export function Intro({
  onReveal,
  onGone,
}: {
  onReveal: () => void;
  onGone: () => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const finished = useRef(false);
  const timers = useRef<number[]>([]);

  const finish = (delay: number) => {
    if (finished.current) return;
    finished.current = true;
    timers.current.push(
      window.setTimeout(() => {
        setLeaving(true);
        onReveal();
        timers.current.push(window.setTimeout(onGone, 1000));
      }, delay),
    );
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const safety = window.setTimeout(() => finish(0), MAX_WAIT_MS);
    const pending = timers.current;
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(safety);
      pending.forEach(window.clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={() => finish(0)}
      aria-hidden
      className="fixed inset-0 z-[100] transition-opacity duration-[900ms] ease-out"
      style={{
        backgroundColor: BG,
        opacity: leaving ? 0 : 1,
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      {useGlass ? (
        <Suspense fallback={null}>
          <GlassIconReveal
            logo="/logo-mark.png"
            label="Camilo Meza Ytuarte"
            look="light"
            background={BG}
            logoColor="#111113"
            loop={false}
            tileSize={300}
            logoScale={0.72}
            finalScale={0.72}
            tuning={{ present: 1.9, glide: 1.8 }}
            onDone={() => finish(450)}
            className="pointer-events-none h-full w-full cursor-default"
          />
        </Suspense>
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="intro-tile relative grid size-40 place-items-center rounded-[2.4rem] bg-white/60 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_24px_48px_-16px_rgba(0,0,0,0.18)] ring-1 ring-white">
            <img
              src="/logo-mark.png"
              alt=""
              width={96}
              height={96}
              draggable={false}
              onAnimationEnd={() => finish(350)}
              className="intro-logo size-24 select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

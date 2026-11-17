import { useEffect, useRef, useState } from "react";
import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal";

const BG = "#eeeef0";
const MAX_WAIT_MS = 7000; // safety net if WebGL is unavailable or the logo fails to load

/**
 * Full-screen intro: the logo is revealed through liquid glass, then the
 * overlay dissolves into the site. `onReveal` fires as the dissolve starts
 * (the page begins to appear); `onGone` once the overlay can be removed.
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
    </div>
  );
}

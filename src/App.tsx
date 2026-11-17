import { lazy, Suspense, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Intro } from "@/components/intro";
import { Marquee } from "@/components/marquee";
import { DISCORD, DISCORD_URL, NAME } from "@/lib/contact";

// The contact button pulls in the shader library; load it while the intro plays.
const ContactMenu = lazy(() =>
  import("@/components/contact-menu").then((m) => ({ default: m.ContactMenu })),
);

const skipIntro =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function App() {
  const [ready, setReady] = useState(skipIntro);
  const [introGone, setIntroGone] = useState(skipIntro);

  return (
    <>
      {!introGone && (
        <Intro onReveal={() => setReady(true)} onGone={() => setIntroGone(true)} />
      )}

      <div className="flex min-h-full flex-col">
        <header
          className={`page-fade mx-auto flex w-full max-w-[1800px] items-center justify-between px-5 py-5 sm:px-10 sm:py-7 ${ready ? "is-ready" : ""}`}
        >
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
            />
            <h1 className="max-w-[7.5rem] text-[15px] leading-tight font-semibold tracking-tight text-neutral-900 sm:max-w-none">
              {NAME}
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <p className="hidden text-[13px] text-neutral-500 sm:block">
              Let’s work together!
            </p>
            <Suspense fallback={<div className="h-[46px] w-[142px]" />}>
              <ContactMenu />
            </Suspense>
          </div>
        </header>

        {/* Rows + headline form one group; on tall screens the spare room is
            split above and below it instead of opening a gap in the middle. */}
        <main className="flex flex-1 flex-col justify-center">
          <Marquee ready={ready} />

          <section
            className={`page-fade mx-auto w-full max-w-[1800px] px-5 pt-5 pb-6 text-center sm:px-10 sm:pt-8 sm:pb-10 ${ready ? "is-ready" : ""}`}
          >
            <h2 className="text-4xl leading-[1.05] font-bold tracking-[-0.035em] text-neutral-950 sm:text-5xl lg:text-6xl">
              High-CTR Thumbnails
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-neutral-500 sm:mt-4 sm:text-lg">
              Made to stop the scroll. Built to win the click.
            </p>
          </section>
        </main>

        <footer
          className={`page-fade mx-auto flex w-full max-w-[1800px] items-center justify-center px-5 pb-7 text-xs text-neutral-400 sm:px-10 ${ready ? "is-ready" : ""}`}
        >
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 transition-colors hover:text-neutral-800"
          >
            <span>Discord</span>
            <span className="text-neutral-300">·</span>
            <span className="font-medium text-neutral-600">{DISCORD}</span>
            <ArrowUpRight
              size={12}
              className="text-neutral-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-700"
            />
          </a>
        </footer>
      </div>
    </>
  );
}

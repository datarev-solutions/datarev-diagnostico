"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DitheringShader } from "./dithering-shader";

export interface HeroFuturisticProps {
  /** Split on spaces and revealed one word at a time. */
  title: string;
  subtitle: string;
  /** Label for the scroll cue. Omit to hide it. */
  scrollLabel?: string;
  /** Anchor the scroll cue jumps to. */
  scrollTargetId?: string;
  eyebrow?: ReactNode;
  children?: ReactNode;
  colorFront?: string;
  colorBack?: string;
  className?: string;
}

/**
 * Full-bleed hero: a dithered sphere behind a word-by-word title reveal, a
 * sweeping scan line and a scroll cue.
 *
 * The sphere is WebGL2 (@paper-design/shaders-react) rather than the WebGPU
 * three.js build the original used — same look, ~50KB instead of ~1MB, and no
 * blank hero on browsers without WebGPU. The scan line and bloom that the
 * original did in a TSL post-processing pass are CSS here, which also keeps
 * them out of the print output.
 */
export function HeroFuturistic({
  title,
  subtitle,
  scrollLabel,
  scrollTargetId,
  eyebrow,
  children,
  colorFront = "#3987e5",
  colorBack = "#08080b",
  className,
}: HeroFuturisticProps) {
  const titleWords = useMemo(() => title.split(" "), [title]);
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);

  // Per-word delay, jittered so the reveal does not march in lockstep. Derived
  // from a hash of the index rather than Math.random() so server and client
  // agree, and rounded to 3dp because React serialises a full-precision float
  // differently on each side and that alone trips hydration.
  const wordDelays = useMemo(
    () =>
      titleWords.map((_, index) => {
        const noise = Math.sin((index + 1) * 12.9898) * 43758.5453;
        const jitter = (noise - Math.floor(noise)) * 0.07;
        return (index * 0.09 + jitter).toFixed(3);
      }),
    [titleWords],
  );

  // Restart the reveal when the copy changes (the language toggle). React's
  // documented adjust-state-during-render pattern; an effect here would fire a
  // second render pass after the stale title had already painted.
  const [renderedTitle, setRenderedTitle] = useState(title);
  if (renderedTitle !== title) {
    setRenderedTitle(title);
    setVisibleWords(0);
    setSubtitleVisible(false);
  }

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timer = setTimeout(() => setVisibleWords((n) => n + 1), 260);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setSubtitleVisible(true), 320);
    return () => clearTimeout(timer);
  }, [visibleWords, titleWords.length]);

  return (
    <section
      className={cn(
        "relative isolate flex min-h-[min(100svh,52rem)] w-full flex-col items-center justify-center overflow-hidden",
        className,
      )}
      style={{ background: colorBack }}
    >
      <div className="absolute inset-0 opacity-[0.45]">
        <DitheringShader
          shape="sphere"
          type="random"
          colorBack={colorBack}
          colorFront={colorFront}
          pxSize={2}
          speed={0.6}
          fallbackColor={colorBack}
        />
      </div>

      {/* Vignette keeps the type legible over the brightest part of the sphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(75% 55% at 50% 48%, rgba(8,8,11,0.86) 0%, rgba(8,8,11,0.62) 45%, rgba(8,8,11,0.35) 70%, rgba(8,8,11,0.8) 100%)",
        }}
      />
      <div className="hero-scanline pointer-events-none absolute inset-0 z-10" aria-hidden="true" />

      <div className="relative z-20 flex w-full max-w-5xl flex-col items-center px-6 text-center">
        {eyebrow ? <div className="mb-7 hero-fade-eyebrow">{eyebrow}</div> : null}

        <h1 className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[2rem] font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
          {/* One span per word drops the spaces from the accessible name and
              from copy-paste, so the intact string is exposed here and the
              animated pieces are hidden from assistive tech. */}
          <span className="sr-only">{title}</span>
          {titleWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              aria-hidden="true"
              className={cn("inline-block", index < visibleWords && "hero-word")}
              style={{
                animationDelay: `${wordDelays[index]}s`,
                opacity: index < visibleWords ? undefined : 0,
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        <p
          className={cn(
            "mt-5 max-w-2xl text-balance text-sm leading-relaxed text-white/70 sm:text-base lg:text-lg",
            subtitleVisible && "hero-subtitle",
          )}
          style={{ opacity: subtitleVisible ? undefined : 0 }}
        >
          {subtitle}
        </p>

        {children ? (
          <div
            className="mt-9 flex flex-wrap items-center justify-center gap-3 hero-fade-actions"
            style={{ animationDelay: `${(titleWords.length * 0.09 + 0.5).toFixed(3)}s` }}
          >
            {children}
          </div>
        ) : null}
      </div>

      {scrollLabel ? (
        // A plain anchor: the CSS `scroll-behavior` supplies the animation,
        // the reduced-motion override turns it into a jump, and it still
        // works with JavaScript disabled.
        <a
          href={scrollTargetId ? `#${scrollTargetId}` : undefined}
          className="hero-explore-btn absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
          style={{ animationDelay: `${(titleWords.length * 0.09 + 0.9).toFixed(3)}s` }}
        >
          {scrollLabel}
          <span className="hero-explore-arrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 5V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 12L11 17L16 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </a>
      ) : null}
    </section>
  );
}

export default HeroFuturistic;

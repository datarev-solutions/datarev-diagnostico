"use client";

import { Dithering, type DitheringProps } from "@paper-design/shaders-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

/**
 * The `dithering-shader` module the demo imports.
 *
 * Upstream the component is exported as `Dithering` from
 * `@paper-design/shaders-react`; this wrapper keeps the `DitheringShader`
 * name and adds three things the raw component does not do:
 *
 *  - defers to a static fallback until mounted, so SSR never ships a canvas
 *  - honours `prefers-reduced-motion` by freezing the animation
 *  - maps the deprecated `pxSize` prop onto the current `size` prop
 */
export interface DitheringShaderProps extends Omit<DitheringProps, "size"> {
  /** Pixel size of the dither cell. Alias of `size`. */
  pxSize?: number;
  size?: number;
  /** Solid colour painted before the shader mounts. Defaults to `colorBack`. */
  fallbackColor?: string;
}

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** The media query is an external store, so it is read as one — no effect. */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(MOTION_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
}

const noopSubscribe = () => () => {};
/** False on the server and through hydration, true once the client owns it. */
function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function DitheringShader({
  pxSize,
  size,
  speed = 1,
  className,
  colorBack = "#000000",
  colorFront = "#3987e5",
  fallbackColor,
  style,
  ...props
}: DitheringShaderProps) {
  const mounted = useIsClient();
  const reducedMotion = usePrefersReducedMotion();

  // Server render and first paint: a flat colour in place of the canvas, so
  // the hero never flashes a transparent hole while WebGL warms up.
  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={cn("absolute inset-0", className)}
        style={{ background: fallbackColor ?? colorBack, ...style }}
      />
    );
  }

  return (
    <Dithering
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full", className)}
      colorBack={colorBack}
      colorFront={colorFront}
      size={size ?? pxSize}
      // frame 0 with speed 0 renders one static composition rather than a
      // paused-mid-animation frame.
      speed={reducedMotion ? 0 : speed}
      style={style}
      {...props}
    />
  );
}

export default DitheringShader;

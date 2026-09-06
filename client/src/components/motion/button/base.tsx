"use client";
// beui.dev/components/motion/button

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import {
  forwardRef,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "children"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressScale?: number;
  /** Spawn a Material-style ripple from the press point. Off by default. */
  ripple?: boolean;
  /** 3D "raised" slab — hard offset shadow underneath + glossy sheen on top. */
  raised?: boolean;
  /** Stack the button on a light backing plate with a soft shadow (instead of a hard slab). */
  backing?: boolean;
  children?: ReactNode;
}

type Ripple = { id: number; x: number; y: number; size: number };

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "border border-primary bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  secondary:
    "border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
  ghost: "border border-transparent text-foreground hover:bg-accent",
  outline:
    "border border-input bg-popover text-foreground shadow-xs hover:bg-accent/50",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-lg",
  icon: "size-9 rounded-lg",
};

const RAISED_SHADOW = "0 4px 0 0 rgba(0, 0, 0, 0.3)";
const RAISED_SHADOW_HOVER = "0 6px 0 0 rgba(0, 0, 0, 0.3)";
const RAISED_SHADOW_PRESS = "0 2px 0 0 rgba(0, 0, 0, 0.3)";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      pressScale = 0.93,
      ripple = false,
      raised,
      backing,
      className,
      children,
      onPointerDown,
      style,
      ...rest
    },
    ref,
  ) {
    const reduce = useReducedMotion();
    const canHover = useHoverCapable();
    const useBacking = backing ?? false;
    const useSlab = !useBacking && (raised ?? false);
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const nextId = useRef(0);

    const handlePointerDown = useCallback(
      (event: PointerEvent<HTMLButtonElement>) => {
        if (ripple && !reduce) {
          const rect = event.currentTarget.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height) * 2;
          const id = nextId.current++;
          setRipples((prev) => [
            ...prev,
            {
              id,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              size,
            },
          ]);
        }
        onPointerDown?.(event);
      },
      [ripple, reduce, onPointerDown],
    );

    const renderButton = (onPlate: boolean) => (
      <motion.button
        ref={ref}
        type="button"
        whileTap={reduce ? undefined : onPlate ? { scale: pressScale } : useSlab ? { scale: 1, y: 2, boxShadow: RAISED_SHADOW_PRESS } : { scale: pressScale }}
        whileHover={reduce || !canHover ? undefined : onPlate ? { scale: 1.02 } : useSlab ? { y: -2, boxShadow: RAISED_SHADOW_HOVER } : { scale: 1.02 }}
        transition={useSlab && !onPlate ? { y: SPRING_PRESS, boxShadow: { type: "tween", duration: 0.15, ease: EASE_OUT } } : SPRING_PRESS}
        style={{ boxShadow: useSlab && !onPlate ? RAISED_SHADOW : undefined, ...style }}
        onPointerDown={handlePointerDown}
        className={cn(
          "inline-flex items-center justify-center font-medium select-none",
          "transition-colors",
          "disabled:pointer-events-none disabled:opacity-50",
          onPlate && "relative z-10 overflow-hidden",
          useSlab && !onPlate && "relative overflow-hidden",
          ripple && "relative overflow-hidden",
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          className,
        )}
        {...rest}
      >
        {ripple && !reduce ? (
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  className="absolute rounded-full bg-current"
                  style={{
                    left: r.x,
                    top: r.y,
                    width: r.size,
                    height: r.size,
                    x: "-50%",
                    y: "-50%",
                  }}
                  initial={{ scale: 0.05, opacity: 0.3 }}
                  animate={{ scale: 1, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, ease: EASE_OUT }}
                  onAnimationComplete={() =>
                    setRipples((prev) => prev.filter((x) => x.id !== r.id))
                  }
                />
              ))}
            </AnimatePresence>
          </span>
        ) : null}
        {children}
        {onPlate && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-white/10 to-transparent"
          />
        )}
      </motion.button>
    );

    return useBacking ? (
      <span className="relative inline-flex">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 translate-y-[3px] rounded-full bg-white shadow-[0_12px_22px_-8px_rgba(0,0,0,0.4)]"
        />
        {renderButton(true)}
      </span>
    ) : (
      renderButton(false)
    );
  },
);

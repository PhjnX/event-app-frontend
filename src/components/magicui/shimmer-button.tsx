import React, { type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#B5A65F",
      shimmerSize = "0.1em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(5, 5, 5, 1)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-8 py-3 text-white transition-all duration-300 active:scale-95",
          "[background:var(--bg)] [border-radius:var(--radius)]",
          className
        )}
        ref={ref}
        {...props}
      >
        <div
          className={cn(
            "absolute inset-0 -z-30 animate-shimmer",
            "[background:conic-gradient(from_calc(270deg-(var(--speed)*0.5)),rgba(0,0,0,0),var(--shimmer-color),rgba(0,0,0,0))] -inset-full"
          )}
        />

        <div
          className={cn(
            "absolute -z-10 [background:var(--bg)] [border-radius:var(--radius)] inset-(--cut)"
          )}
        />

        <span className="relative z-10 flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
          {children}
        </span>
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
export default ShimmerButton;

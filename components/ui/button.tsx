import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold uppercase tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-green disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-flow-green text-flow-dark hover:opacity-90": variant === "default",
            "border-2 border-flow-gray bg-transparent text-white hover:border-flow-green":
              variant === "outline",
            "bg-transparent hover:bg-flow-surface": variant === "ghost",
          },
          {
            "h-10 px-6 py-2 text-sm": size === "default",
            "h-8 px-4 text-xs": size === "sm",
            "h-12 px-8 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };


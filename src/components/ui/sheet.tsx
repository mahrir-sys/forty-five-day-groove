"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, style, ...props }, ref) => {
  // Bottom sheets can be swiped down to close (only when scrolled to the top).
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const drag = React.useRef<{ y: number; active: boolean } | null>(null);
  const [dy, setDy] = React.useState(0);
  const [settle, setSettle] = React.useState<"close" | "back" | null>(null);
  const swipe = side === "bottom" ? {
    onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-swipe]")) return;
      drag.current = { y: (e.touches[0]?.clientY ?? 0), active: e.currentTarget.scrollTop <= 0 };
    },
    onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => {
      if (!drag.current?.active) return;
      const d = (e.touches[0]?.clientY ?? 0) - drag.current.y;
      if (d > 0) { setSettle(null); setDy(d); } else if (dy) setDy(0);
      if (d < 0) drag.current.active = false;
    },
    onTouchEnd: () => {
      drag.current = null;
      if (!dy) return;
      if (dy > 100) {
        // Keep sliding down from the finger position, then close without the default animation jumping back.
        setSettle("close");
        window.setTimeout(() => { closeRef.current?.click(); window.setTimeout(() => { setSettle(null); setDy(0); }, 50); }, 220);
      } else {
        setSettle("back"); setDy(0);
        window.setTimeout(() => setSettle(null), 220);
      }
    },
  } : {};
  return (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)}
      style={settle === "close" ? { ...style, transform: "translateY(100%)", transition: "transform 220ms cubic-bezier(0.32,0.72,0,1)", animation: "none" }
        : settle === "back" ? { ...style, transform: "translateY(0)", transition: "transform 220ms cubic-bezier(0.32,0.72,0,1)" }
        : dy ? { ...style, transform: `translateY(${dy}px)`, transition: "none" } : style} {...swipe} {...props}>
      {side === "bottom" && <div aria-hidden className="mx-auto -mt-3 mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />}
      <SheetPrimitive.Close ref={closeRef} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

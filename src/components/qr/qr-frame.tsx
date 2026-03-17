"use client";

import type { FrameStyle, FrameFont } from "@/types";

interface QRFrameProps {
  frame: FrameStyle;
  label: string;
  font: FrameFont;
  color: string;
  children: React.ReactNode;
  className?: string;
}

export function QRFrame({ frame, label, font, color, children, className }: QRFrameProps) {
  if (frame === "none") {
    return <div className={className}>{children}</div>;
  }

  const textColor = getContrastColor(color);

  if (frame === "phone") {
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        <div
          className="rounded-[2rem] p-3 pb-6"
          style={{ backgroundColor: color }}
        >
          <div className="rounded-[1.25rem] overflow-hidden bg-white p-1">
            {children}
          </div>
          <p
            className="mt-2 text-center text-xs font-semibold"
            style={{ fontFamily: font, color: textColor }}
          >
            {label}
          </p>
        </div>
      </div>
    );
  }

  if (frame === "cine") {
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        <div className="relative p-1" style={{ backgroundColor: color }}>
          {/* Film holes left */}
          <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-evenly">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`l${i}`}
                className="h-2 w-1.5 rounded-sm"
                style={{ backgroundColor: textColor, opacity: 0.4 }}
              />
            ))}
          </div>
          {/* Film holes right */}
          <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-evenly">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`r${i}`}
                className="h-2 w-1.5 rounded-sm"
                style={{ backgroundColor: textColor, opacity: 0.4 }}
              />
            ))}
          </div>
          <div className="mx-4 bg-white rounded-sm overflow-hidden">
            {children}
          </div>
          <p
            className="mt-1 mb-0.5 text-center text-xs font-bold"
            style={{ fontFamily: font, color: textColor }}
          >
            {label}
          </p>
        </div>
      </div>
    );
  }

  const isTop = frame.includes("top");
  const isBalloon = frame.includes("balloon");
  const isRibbon = frame.includes("ribbon");

  const labelEl = (
    <div className="flex justify-center">
      {isBalloon ? (
        <div className="relative">
          <div
            className="rounded-full px-4 py-1.5"
            style={{ backgroundColor: color }}
          >
            <p
              className="text-xs font-semibold whitespace-nowrap"
              style={{ fontFamily: font, color: textColor }}
            >
              {label}
            </p>
          </div>
          {/* Triangle pointer */}
          <div className="flex justify-center">
            <div
              className={`h-0 w-0 border-x-[6px] border-x-transparent ${
                isTop ? "border-t-[6px]" : "border-b-[6px]"
              }`}
              style={{
                [isTop ? "borderTopColor" : "borderBottomColor"]: color,
                transform: isTop ? "" : "rotate(180deg)",
              }}
            />
          </div>
        </div>
      ) : isRibbon ? (
        <div className="relative">
          <div
            className="relative px-6 py-1.5"
            style={{ backgroundColor: color }}
          >
            <p
              className="text-xs font-semibold whitespace-nowrap"
              style={{ fontFamily: font, color: textColor }}
            >
              {label}
            </p>
            {/* Ribbon notches */}
            <div
              className="absolute left-0 top-0 bottom-0 w-2"
              style={{
                background: `linear-gradient(${isTop ? "135" : "45"}deg, transparent 33.33%, ${color} 33.33%, ${color} 66.67%, transparent 66.67%)`,
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-2"
              style={{
                background: `linear-gradient(${isTop ? "45" : "135"}deg, transparent 33.33%, ${color} 33.33%, ${color} 66.67%, transparent 66.67%)`,
              }}
            />
          </div>
        </div>
      ) : (
        /* Simple bar (bottom / top) */
        <div
          className="w-full rounded-md px-4 py-2 text-center"
          style={{ backgroundColor: color }}
        >
          <p
            className="text-xs font-semibold"
            style={{ fontFamily: font, color: textColor }}
          >
            {label}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`inline-flex flex-col items-center gap-1.5 ${className}`}>
      {isTop && labelEl}
      {children}
      {!isTop && labelEl}
    </div>
  );
}

/** Return white or black depending on bg luminance */
function getContrastColor(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

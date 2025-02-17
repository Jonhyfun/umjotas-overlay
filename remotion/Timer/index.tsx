import { loadFont } from "@remotion/google-fonts/Inter";

import React, { useEffect, useRef } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
loadFont();

export const TimerProps = z.object({
  seconds: z.number(),
});

export const Timer = ({
  seconds,
  onFinished,
}: z.infer<typeof TimerProps> & { onFinished?: VoidFunction }) => {
  const finished = useRef(false);
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const strokeProgress = interpolate(
    frame,
    [0, durationInFrames - 15],
    [0, 1260],
    { extrapolateRight: "clamp" },
  );

  //TODO dry, hook this logic somehow? interface at least
  useEffect(() => {
    if (!finished.current) {
      if (frame === durationInFrames - 1) {
        if (onFinished) {
          finished.current = true;
          onFinished();
        }
      }
    }
  }, [durationInFrames, frame, onFinished]);

  return (
    <div className="w-full h-full border-black border-[6px] bg-slate-600 rounded-full relative">
      <div className="shadow-[0_0_0px_6px_white] absolute border-black border-[3px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] rounded-full"></div>
      <div className="w-full h-full relative rounded-full">
        <span
          style={{ textShadow: "0 0 10px black" }}
          className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl tabular-nums -mt-1"
        >
          {seconds - Math.round(frame / fps)}
        </span>
        <div className="rotate-[270deg] -scale-y-100 relative w-full h-full">
          <svg
            className="overflow-visible"
            viewBox="48 47 404 410"
            preserveAspectRatio="xMinYMin meet"
          >
            <circle
              style={{
                strokeWidth: 16,
                strokeDasharray: 1260,
                strokeDashoffset: strokeProgress,
                fill: "transparent",
              }}
              className={
                frame / durationInFrames >= 0.6
                  ? "stroke-[#FF0000]"
                  : frame / durationInFrames <= 0.4
                    ? "stroke-[#00FF00]"
                    : "stroke-[#FFFF00]"
              }
              cx="250"
              cy="250"
              r="200"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

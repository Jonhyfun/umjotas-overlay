import { useEffect, useRef } from "react";
import {
  Audio,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export function Tchans({ onFinished }: { onFinished?: VoidFunction }) {
  const currentFrame = useCurrentFrame();
  const spread = interpolate(currentFrame, [0, 30, 60], [0, 100, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });
  const blur = interpolate(currentFrame, [0, 1, 30, 60], [0, 50, 200, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });

  const finished = useRef(false);

  const { durationInFrames } = useVideoConfig();

  useEffect(() => {
    if (!finished.current) {
      if (currentFrame === durationInFrames - 1) {
        if (onFinished) {
          finished.current = true;
          onFinished();
        }
      }
    }
  }, [durationInFrames, currentFrame, onFinished]);

  return (
    <>
      <div
        style={{ boxShadow: `inset 0 0 ${blur}px ${spread}px black` }}
        className="w-full h-full fixed"
      ></div>
      <Audio src={staticFile("/leaguematchspook.wav")} volume={0.8} />
    </>
  );
}

import { useEffect, useMemo, useRef } from "react";
import {
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

function randomIntFromInterval(min: number, max: number, seed: string) {
  return Math.floor(random(seed) * (max - min + 1) + min);
}

export function AnimeBurst({
  degrees,
  seed,
  onFinished,
}: {
  degrees: number;
  seed: string;
  onFinished?: VoidFunction;
}) {
  const spikeOffset = useMemo(() => randomIntFromInterval(0, 5, seed), [seed]);
  const speed = useMemo(() => randomIntFromInterval(45, 100, seed), [seed]);
  const currentFrame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const heightInput = useMemo(
    () =>
      Array.from({ length: durationInFrames })
        .map((_, i) => spikeOffset + (i + 1))
        .filter((_, i) => i % 2 == 0),
    [],
  );

  const heightOutput = useMemo(() => {
    const output = [];
    let pointer = 0;
    const outputInstance = [0, speed, speed, 0];
    while (output.length !== heightInput.length) {
      if (pointer === 4) pointer = 0;
      output.push(outputInstance[pointer]);
      pointer++;
    }
    return output;
  }, [heightInput, speed]);

  const height = interpolate(currentFrame, heightInput, heightOutput, {
    easing: Easing.linear,
    extrapolateRight: "clamp",
  });

  const finished = useRef(false);

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
    <div className="fixed w-full h-full">
      <div
        className="relative w-full h-full"
        style={{ transform: `rotate(${degrees}deg)` }}
      >
        <div
          style={{
            height: `4px`,
            width: `${(degrees > 315 && degrees < 50) || (degrees > 135 && degrees < 215) ? height : height}%`,
            top: 0,
            left: 0,
            transform: `translateY(0px) translateX(-50%) rotate(30deg)`,
            borderRadius: `30px 30px 30px 30px / 3px 3px 3px 3px`,
          }}
          className="bg-black absolute"
        ></div>
      </div>
    </div>
  );
}

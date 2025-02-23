import { useMemo } from "react";
import {
  Audio,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { SelfDestructComposition } from "../types";
import { useCompositionFinished } from "../../app/hooks/compositionFinished";

function randomIntFromInterval(min: number, max: number, seed: string) {
  return Math.floor(random(seed) * (max - min + 1) + min);
}

function Alien({ seed }: { seed: string }) {
  const currentFrame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const width = 200;

  const left = useMemo(
    () => randomIntFromInterval(0, 1, `${seed}-1`) === 0,
    [],
  );
  const top = useMemo(() => randomIntFromInterval(0, 1, `${seed}-2`) === 0, []);

  const initialY = useMemo(
    () => randomIntFromInterval(0, 1980 + width / 3, seed),
    [],
  );

  const rotation = interpolate(currentFrame, [0, durationInFrames], [-30, 5], {
    extrapolateRight: "identity",
    easing: Easing.elastic(5),
  });

  const sizePercent = interpolate(
    currentFrame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const positionX = interpolate(
    currentFrame,
    [0, durationInFrames],
    [left ? 0 : 1980 + width, left ? 1980 + width : 0],
    { easing: Easing.inOut(Easing.elastic(2)), extrapolateRight: "clamp" },
  );

  const positionY = interpolate(
    currentFrame,
    [0, durationInFrames],
    [top ? 0 : initialY, top ? initialY : 0],
    { easing: Easing.inOut(Easing.elastic(2)) },
  );

  return (
    <Img
      className="fixed -translate-x-full"
      style={{
        left: `${positionX}px`,
        top: `${positionY}px`,
        width: `${width}px`,
        transform: `scale(${sizePercent}) rotate(${rotation}deg)`,
      }}
      src={staticFile("/spaceship.png")}
    />
  );
}

export const Invasion: SelfDestructComposition = ({ onFinished }) => {
  void useCompositionFinished(onFinished);

  return (
    <div className="bg-[#0b5222A5] w-full h-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <Alien
          key={`alien-${i}`}
          seed={`${i % 2 === 0 ? "al13n-" : "esrever-n31la-"}${i * random(null) * 10}`}
        />
      ))}
      <Audio src={staticFile("/invasao.wav")} loop volume={0.8} />
    </div>
  );
};

import React, { useEffect, useMemo } from "react";
import {
  Audio,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { SelfDestructComposition } from "../types";
import { useCompositionFinished } from "../../app/hooks/compositionFinished";

function randomIntFromInterval(min: number, max: number, seed: string | null) {
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

export function AlienBlast({ from }: { from: number }) {
  const speed = 16;
  const { height, width } = useVideoConfig();
  const currentFrame = useCurrentFrame();

  const scale = interpolate(currentFrame, [from, from + speed], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const blastX = interpolate(
    currentFrame,
    [from, from + speed],
    [width - 600, 400],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const blastY = interpolate(
    currentFrame,
    [from, from + speed],
    [height - 400 + from * 2, 300],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <div
      style={{
        top: `${blastY}px`,
        left: `${blastX}px`,
        scale: scale,
        rotate: `
        ${randomIntFromInterval(285, 325, from.toLocaleString())}deg`,
        boxShadow: `#00FF00 0px 0px 40px 6px`,
      }}
      className="bg-white w-1 h-60 fixed"
    ></div>
  );
}

export const Invasion: SelfDestructComposition<{ blast: VoidFunction }> = ({
  onFinished,
  blast,
}) => {
  void useCompositionFinished(onFinished);
  const currentFrame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const alienBlasts = useMemo(
    () =>
      Array.from({ length: 3 }).map(
        (_, i) =>
          durationInFrames / 2 +
          randomIntFromInterval(
            10,
            100,
            randomIntFromInterval(0, 1000, null).toString(),
          ),
      ),
    [durationInFrames],
  );

  useEffect(() => {
    alienBlasts.forEach((frame) => {
      if (frame === currentFrame) {
        blast();
      }
    });
  }, [alienBlasts, blast, currentFrame]);

  return (
    <div className="bg-[#0b5222A5] w-full h-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <Alien
          key={`alien-${i}`}
          seed={`${i % 2 === 0 ? "al13n-" : "esrever-n31la-"}${i * random(Date.now().toFixed(5)) * 10}`}
        />
      ))}
      {alienBlasts.map((from, i) => (
        <React.Fragment key={`blast-${i}`}>
          {currentFrame > from && <AlienBlast from={from} />}
          <Sequence from={from}>
            <Audio src={staticFile("/alienblast.wav")} volume={0.8} />
          </Sequence>
        </React.Fragment>
      ))}
      <Audio src={staticFile("/invasao.wav")} loop volume={0.8} />
    </div>
  );
};

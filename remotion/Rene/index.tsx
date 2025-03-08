import {
  Img,
  interpolate,
  InterpolateOptions,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Jersey_10 } from "next/font/google";
import { useEffect, useRef, useState } from "react";

const pixelFont = Jersey_10({ weight: "400", subsets: ["latin"] });

const offsetInterpolate = (
  startsAt: number,
  input: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  options?: InterpolateOptions,
) =>
  interpolate(
    input,
    inputRange.map((frame) => frame + startsAt),
    outputRange,
    options,
  );

export function Rene({
  hp = 100,
  takeDamage = false,
}: {
  hp: number;
  takeDamage: boolean;
}) {
  const currentFrame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const currentHP = interpolate(hp, [0, 50], [0, 100]);
  const [reneDirection, setReneDirection] = useState<"left" | "right">("left");
  const [damageFrame, setDamageFrame] = useState(0);

  const currentFrameRef = useRef(0);

  const damageRotation =
    damageFrame === 0
      ? 12
      : offsetInterpolate(damageFrame, currentFrame, [0, 3], [12, 35], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const damageOpacity =
    damageFrame === 0
      ? 1
      : offsetInterpolate(damageFrame, currentFrame, [0, 5], [0.6, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const x = offsetInterpolate(
    0,
    currentFrame,
    [0, 60, 61, 120],
    [-100, 100, 100, -100],
    { extrapolateLeft: "clamp" },
  );

  useEffect(() => {
    if (x === -100 || x === 100) {
      setReneDirection((current) => (current === "left" ? "right" : "left"));
    }
  }, [x]);

  useEffect(() => {
    if (takeDamage) {
      setDamageFrame(currentFrameRef.current);
    }
  }, [takeDamage]);

  useEffect(() => {
    //if (currentFrame + 5 < durationInFrames) {
    //  //TODO não ta rolando
    //  currentFrameRef.current = Number(currentFrame.toString());
    //}
    //if (currentFrame === currentFrameRef.current + 5) {
    //  currentFrameRef.current = 0;
    //}
  }, [currentFrame, durationInFrames]);

  return (
    <div className="fixed right-64 bottom-10 flex flex-col items-center gap-6">
      <svg className="overflow-visible" xmlns="http://www.w3.org/2000/svg">
        <text
          style={{ ...pixelFont.style, transform: `translateX(${x}px)` }}
          className="fill-white stroke-black stroke-[3px] text-8xl"
          x="48"
          y="148"
        >
          Rene
        </text>
      </svg>
      <div
        style={{ transform: `translateX(${x}px)` }}
        className="relative ring-4 ring-black h-2 w-56 rounded-md mr-10 mb-3 bg-white"
      >
        <div
          style={{ width: `${currentHP}%` }}
          className="bg-red-500 h-full"
        ></div>
      </div>
      <Img
        className={"w-[525px] object-contain"}
        style={{
          opacity: damageOpacity,
          transform: `translateX(${x}px) scaleX(${reneDirection === "left" ? "-1" : "1"}) rotate(${damageRotation}deg)`,
        }}
        src={staticFile("/rene.png")}
      ></Img>
    </div>
  );
}

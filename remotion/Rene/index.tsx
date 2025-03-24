import {
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Jersey_10 } from "next/font/google";
import { RefObject, useEffect, useRef, useState } from "react";
import { useRegisterAnimationEffect } from "../../app/hooks/animationEffect";
import { defined, offsetInterpolate } from "../../app/utils/remotion";

const pixelFont = Jersey_10({ weight: "400", subsets: ["latin"] });

export type ReneCompositionRefType = {
  takeDamage: VoidFunction;
  die: VoidFunction;
};

export function Rene({
  hp = 100,
  ref,
  destroyComponent,
}: {
  hp: number;
  ref: RefObject<ReneCompositionRefType | null>;
  destroyComponent: VoidFunction;
}) {
  const { durationInFrames } = useVideoConfig();
  const initialHP = useRef(hp);
  const currentFrame = useCurrentFrame();
  const currentHP = interpolate(hp, [0, initialHP.current], [0, 100]);
  const [reneDirection, setReneDirection] = useState<"left" | "right">("left");
  const deathFrame = useRef(-1);

  const { damageRotation, damageScale, damageOpacity } =
    useRegisterAnimationEffect(
      ref,
      "takeDamage",
      ({ startingFrame, currentFrame, passedFrames, depsChanged }) => {
        if (!depsChanged || passedFrames > 5) {
          return {};
        }

        const damageRotation = offsetInterpolate(
          startingFrame,
          currentFrame,
          [0, 3],
          [12, 35],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );

        const damageScale = offsetInterpolate(
          startingFrame,
          currentFrame,
          [0, 5],
          [1, 1.1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          },
        );

        const damageOpacity = offsetInterpolate(
          startingFrame,
          currentFrame,
          [0, 1, 5],
          [1, 0.6, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );

        return { damageRotation, damageScale, damageOpacity };
      },
    );

  const { deathOpacity, deathRotation, deathScale } =
    useRegisterAnimationEffect(
      ref,
      "die",
      ({ startingFrame, currentFrame, passedFrames, depsChanged }) => {
        if (passedFrames === 30) {
          deathFrame.current = currentFrame;
        }
        if (!depsChanged || passedFrames > 30) return {};
        const deathRotation = offsetInterpolate(
          startingFrame,
          currentFrame,
          [0, 30],
          [-360, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.in(Easing.circle),
          },
        );

        const deathScale = offsetInterpolate(
          startingFrame,
          currentFrame,
          [0, 30],
          [1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.in(Easing.circle),
          },
        );

        const deathOpacity = offsetInterpolate(
          startingFrame,
          currentFrame,
          [0, 30],
          [1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.in(Easing.circle),
          },
        );

        return { deathRotation, deathScale, deathOpacity };
      },
    );

  const x =
    hp === 0
      ? 0
      : offsetInterpolate(
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
    if (deathFrame.current !== -1) {
      if ((deathFrame.current + 1) % durationInFrames === currentFrame) {
        destroyComponent();
      }
    }
  }, [currentFrame, destroyComponent, durationInFrames]);

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
          opacity: defined(damageOpacity, deathOpacity, 1),
          transform: `translateX(${x}px) scaleX(${reneDirection === "left" ? "-1" : "1"}) scale(${defined(damageScale, deathScale, 1)}) rotate3d(1, 1, 1, ${defined(deathRotation, 0)}deg) rotate(${defined(damageRotation, deathRotation, 0)}deg)`,
        }}
        src={staticFile("/rene.png")}
      ></Img>
    </div>
  );
}

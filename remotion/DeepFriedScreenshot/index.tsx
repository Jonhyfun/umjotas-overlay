import type { SelfDestructComposition } from "../types";
import {
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useCompositionFinished } from "../../app/hooks/compositionFinished";
import { Anton } from "next/font/google";
import { useEffect, useMemo } from "react";

const antonFont = Anton({ weight: "400", subsets: ["latin"] });

export const DeepFriedScreenshot: SelfDestructComposition<{
  text: string;
  freeImage: VoidFunction;
}> = ({ onFinished, freeImage, text }) => {
  void useCompositionFinished(onFinished);
  const { durationInFrames } = useVideoConfig();

  const startedAt = useMemo(() => Date.now(), []);

  const currentFrame = useCurrentFrame();

  const glitchedWidth = interpolate(currentFrame, [0, 60], [350, 475], {
    extrapolateRight: "clamp",
  });

  const friedness = interpolate(currentFrame, [0, 60], [5, 12], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(currentFrame, [60, 90], [1, 1.15], {
    extrapolateLeft: "clamp",
  });

  const opacity = interpolate(currentFrame, [60, 90], [1, 0], {
    extrapolateLeft: "clamp",
  });

  useEffect(() => {
    if (currentFrame - 1 === durationInFrames) {
      freeImage();
    }
  }, [currentFrame, durationInFrames, freeImage]);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <div
        className="relative"
        style={{
          width: 860,
          height: 640,
          // This is not to be rendered, but to be used as a browser source overlay so its okay
          // eslint-disable-next-line @remotion/no-background-image
          backgroundImage: `url("http://localhost:8000/currentscreenshot.png?fetchedAt=${startedAt}")`,
          backgroundPosition: `50%, 50%`,
          backgroundSize: `${glitchedWidth}% 100%`,
          backgroundRepeat: `no-repeat`,
          boxShadow: `black 8px 8px 20px 2px`,
          filter: `saturate(${friedness})`,
          scale,
          opacity,
        }}
      >
        <span
          style={{ ...antonFont.style, WebkitTextStroke: `6px black` }}
          className="bottom-0 leading-[1] w-full text-center absolute text-9xl text-white"
        >
          {text}
        </span>
      </div>
      <Audio src={staticFile("/deepfried.wav")} />
    </div>
  );
};

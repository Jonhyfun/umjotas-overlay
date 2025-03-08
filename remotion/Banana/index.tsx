import type { SelfDestructComposition } from "../types";
import {
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useCompositionFinished } from "../../app/hooks/compositionFinished";
import { Dispatch, SetStateAction, useEffect } from "react";

export const Banana: SelfDestructComposition<{
  setReneHP: Dispatch<SetStateAction<number>>;
}> = ({ onFinished, setReneHP }) => {
  void useCompositionFinished(onFinished);
  const { durationInFrames } = useVideoConfig();
  const currentFrame = useCurrentFrame();

  const x = interpolate(currentFrame, [0, durationInFrames - 10], [0, 1200], {
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.circle),
  });

  const y = interpolate(currentFrame, [0, durationInFrames - 10], [0, 550], {
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.circle),
  });

  const scale = interpolate(
    currentFrame,
    [durationInFrames - 10, durationInFrames - 5],
    [1, 2.5],
    {
      extrapolateLeft: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const opacity = interpolate(
    currentFrame,
    [durationInFrames - 10, durationInFrames - 5],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  useEffect(() => {
    if (currentFrame == durationInFrames - 10) {
      setReneHP((current) => (current - 1 > 0 ? current - 1 : 0));
    }
  }, [currentFrame, durationInFrames, setReneHP]);

  return (
    <div className="w-full h-full relative">
      {currentFrame < durationInFrames - 2 && (
        <Img
          src={staticFile("/banana.png")}
          className="absolute top-32 left-44"
          style={{
            transform: `translateX(${x}px) translateY(${y}px) scale(${scale})`,
            opacity,
          }}
        />
      )}
      <Sequence from={durationInFrames - 10}>
        <Audio src={staticFile("/smw_kick.wav")} volume={0.6} />
      </Sequence>
    </div>
  );
};

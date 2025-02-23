import {
  Audio,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { SelfDestructComposition } from "../types";
import { useCompositionFinished } from "../../app/hooks/compositionFinished";

export const Tchans: SelfDestructComposition = ({ onFinished }) => {
  void useCompositionFinished(onFinished);

  const currentFrame = useCurrentFrame();
  const spread = interpolate(currentFrame, [0, 30, 60], [0, 100, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });
  const blur = interpolate(currentFrame, [0, 1, 30, 60], [0, 50, 200, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });

  return (
    <>
      <div
        style={{ boxShadow: `inset 0 0 ${blur}px ${spread}px black` }}
        className="w-full h-full fixed"
      ></div>
      <Audio src={staticFile("/leaguematchspook.wav")} volume={0.8} />
    </>
  );
};

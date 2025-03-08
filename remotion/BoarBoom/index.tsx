import type { SelfDestructComposition } from "../types";
import {
  Audio,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useCompositionFinished } from "../../app/hooks/compositionFinished";

export const BoarBoom: SelfDestructComposition = ({ onFinished }) => {
  void useCompositionFinished(onFinished);
  const { durationInFrames } = useVideoConfig();
  const currentFrame = useCurrentFrame();

  const scale = interpolate(currentFrame, [0, durationInFrames - 30], [0, 2], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(
    currentFrame,
    [durationInFrames - 20, durationInFrames - 5],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );

  return (
    <div className="w-full h-full flex -scale-x-100 items-center justify-center relative">
      <Img src={staticFile("/boarboom.png")} style={{ scale, opacity }} />
      <Audio src={staticFile("/explosion.mp3")} />
    </div>
  );
};

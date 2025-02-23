import { ComponentProps, useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SelfDestructComposition } from "../../remotion/types";

export function useCompositionFinished(
  onFinished: ComponentProps<SelfDestructComposition>["onFinished"],
) {
  const finished = useRef(false);

  const currentFrame = useCurrentFrame();
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
}

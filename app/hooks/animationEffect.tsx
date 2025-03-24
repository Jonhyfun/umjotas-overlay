import {
  type ForwardedRef,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

type AnimationEffectHookProps = {
  startingFrame: number;
  currentFrame: number;
  passedFrames: number;
};

type RegisterAnimationEffectHookProps = {
  startingFrame: number;
  currentFrame: number;
  passedFrames: number;
  depsChanged: boolean;
};

function useBaseAnimationEffect<
  T extends Record<string, any>,
  J extends AnimationEffectHookProps | RegisterAnimationEffectHookProps,
>(
  callback: (props: J) => T,
  deps: unknown[],
  loop = false,
  registerEffect?: boolean,
) {
  const { durationInFrames } = useVideoConfig();
  const currentFrame = useCurrentFrame();
  const currentFrameRef = useRef(0);
  const startingFrame = useRef(0);
  const passedFrames = useRef(-1);
  const INTERNAL_MOUNTED = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    currentFrameRef.current = currentFrame;
    if (passedFrames.current !== -1) {
      passedFrames.current = loop
        ? (passedFrames.current + 1) % durationInFrames
        : passedFrames.current + 1;
    }
  }, [currentFrame, durationInFrames]);

  useEffect(() => {
    if (INTERNAL_MOUNTED.current || !registerEffect) {
      mounted.current = true;
      startingFrame.current = currentFrameRef.current;
      passedFrames.current = 0;
    }
  }, deps);

  useEffect(() => {
    INTERNAL_MOUNTED.current = true;

    return () => {
      INTERNAL_MOUNTED.current = false;
    };
  }, []);

  return callback({
    startingFrame: startingFrame.current,
    currentFrame: currentFrameRef.current,
    passedFrames: passedFrames.current,
    depsChanged: (registerEffect ? mounted.current : undefined) as any,
  } as J);
}

export function useRegisterAnimationEffect<
  T extends Record<string, any>,
  J extends Record<string, VoidFunction>,
>(
  ref: RefObject<J> | ForwardedRef<J>,
  EffectRefFunctionName: keyof J,
  callback: (props: RegisterAnimationEffectHookProps) => T,
  loop?: boolean,
) {
  const [imperativeEffect, setImperativeEffect] = useState(false);

  useImperativeHandle(
    ref,
    () =>
      ({
        ...((ref as any)?.current ?? {}),
        [EffectRefFunctionName]: () => {
          setImperativeEffect((current) => !current);
        },
      }) as J,
    [ref, EffectRefFunctionName],
  );

  return useBaseAnimationEffect(callback, [imperativeEffect], loop, true);
}

export function useAnimationEffect<T extends Record<string, any>>(
  callback: (props: AnimationEffectHookProps) => T,
  deps: unknown[],
  loop?: boolean,
) {
  return useBaseAnimationEffect(callback, deps, loop, false);
}

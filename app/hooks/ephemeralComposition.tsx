import { JSX, useCallback, useMemo, useState } from "react";
import { SelfDestructComposition } from "../../remotion/types";
import { Player } from "@remotion/player";
import { useStateUpdateBatcher } from "./stateUpdateBatcher";
import { VIDEO_FPS } from "../../types/constants";

export function useEphemeralComposition<T>(
  Composition: SelfDestructComposition<T>,
  key: string,
): [
  JSX.Element,
  (
    props: Omit<T, "onFinished"> & {
      durationInFrames: number;
    },
  ) => void,
] {
  type CompositionInstanceProps = Omit<T, "onFinished"> & {
    durationInFrames: number;
  };

  const [compositionInstances, setCompositionInstances] = useState<
    CompositionInstanceProps[]
  >([] as any);

  const { batchAction } = useStateUpdateBatcher(compositionInstances);

  const addComposition = useCallback(
    (props: CompositionInstanceProps) => {
      batchAction(() => {
        setCompositionInstances((current) => {
          const newCurrent = [...current];
          newCurrent.push(props);
          return newCurrent;
        });
      });
    },
    [batchAction],
  );

  const Compositions = useMemo(
    () => (
      <>
        {compositionInstances.map((props, i) => (
          <Player
            key={`${key}-composition-${i}`}
            className="absolute"
            style={{
              width: "100vw",
              height: "100vh",
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
            compositionHeight={1080}
            compositionWidth={1920}
            inputProps={
              {
                ...props,
                onFinished: () => {
                  batchAction(() =>
                    setCompositionInstances((current) => {
                      const newCurrent = [...current];
                      newCurrent.shift();
                      return newCurrent as CompositionInstanceProps[];
                    }),
                  );
                },
              } as any //TODO pq?
            }
            component={Composition}
            durationInFrames={props.durationInFrames}
            fps={VIDEO_FPS}
            moveToBeginningWhenEnded={false}
            autoPlay
          />
        ))}
      </>
    ),
    [Composition, batchAction, compositionInstances, key],
  );

  return [Compositions, addComposition];
}

import { JSX, useCallback, useMemo, useState } from "react";
import { SelfDestructComposition } from "../../remotion/types";
import { Player } from "@remotion/player";
import { useStateUpdateBatcher } from "./stateUpdateBatcher";
import { VIDEO_FPS } from "../../types/constants";

function makeid(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function useCompositionSpawner<T>(
  Composition: SelfDestructComposition<T>,
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

  const [compositionInstances, setCompositionInstances] = useState<{
    [key in string]: CompositionInstanceProps;
  }>({});

  const { batchAction } = useStateUpdateBatcher(compositionInstances); //TODO allow distinct batchers to run in the same queue

  const addComposition = useCallback(
    (props: CompositionInstanceProps) => {
      batchAction(() => {
        setCompositionInstances((current) => {
          const newCurrent = { ...current };
          console.log({ props });
          newCurrent[makeid(5)] = props;
          return newCurrent;
        });
      });
    },
    [batchAction],
  );

  const Compositions = useMemo(
    () => (
      <>
        {Object.entries(compositionInstances).map(([key, compProps]) => (
          <Player
            key={key}
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
                ...compProps,
                onFinished: () => {
                  batchAction(() =>
                    setCompositionInstances((current) => {
                      const newCurrent = { ...current };
                      delete newCurrent[key];
                      return newCurrent;
                    }),
                  );
                },
              } as any //TODO pq?
            }
            component={Composition}
            durationInFrames={compProps.durationInFrames}
            fps={VIDEO_FPS}
            moveToBeginningWhenEnded={false}
            autoPlay
          />
        ))}
      </>
    ),
    [Composition, batchAction, compositionInstances],
  );

  return [Compositions, addComposition];
}

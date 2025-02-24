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

export function useEphemeralComposition<T>(
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

  const currentComposition = useMemo(
    () => Object.entries(compositionInstances)[0],
    [compositionInstances],
  );

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
        {currentComposition && (
          <Player
            key={currentComposition[0]}
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
                ...currentComposition[1],
                onFinished: () => {
                  batchAction(() =>
                    setCompositionInstances((current) => {
                      const newCurrent = { ...current };
                      delete newCurrent[currentComposition[0]];
                      return newCurrent;
                    }),
                  );
                },
              } as any //TODO pq?
            }
            component={Composition}
            durationInFrames={currentComposition[1].durationInFrames}
            fps={VIDEO_FPS}
            moveToBeginningWhenEnded={false}
            autoPlay
          />
        )}
      </>
    ),
    [Composition, batchAction, currentComposition],
  );

  return [Compositions, addComposition];
}

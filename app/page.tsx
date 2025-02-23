"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Door, DoorProps } from "../remotion/Door";
import { DURATION_IN_FRAMES, VIDEO_FPS } from "../types/constants";
import { z } from "zod";
import { useStateUpdateBatcher } from "./hooks/stateUpdateBatcher";
import { randomFromInterval } from "./utils/math";
import useWebSocket from "react-use-websocket";
import { Timer, TimerProps } from "../remotion/Timer";
import { useSearchParams } from "next/navigation";
import { Invasion } from "../remotion/Invasion";
import { AnimeBurst } from "../remotion/AnimeBurst";
import { Tchans } from "../remotion/Tchans";

type DoorAlerts = {
  [key in string]: {
    profile_pic: string;
    position: [number, number];
  };
};

const topBounds = [200, 660];
const leftBounds = [-794, 774];

const topOptions = Array.from({ length: topBounds[1] - topBounds[0] })
  .map((_, i) => i + topBounds[0])
  .filter(function (_, i) {
    return i % 70 === 0;
  });
const leftOptions = Array.from({ length: leftBounds[1] - leftBounds[0] })
  .map((_, i) => i + leftBounds[0])
  .filter(function (_, i) {
    return i % 150 === 0;
  });

type IncomingSocketEvent = {
  username: string;
  profile_pic: string;
  event_name: string;
};

const Home: NextPage = () => {
  const searchParams = useSearchParams();
  const wings = searchParams.get("wings");
  const isAspectVideo = searchParams.get("video");

  const [invasion, setInvasion] = useState(true); //TODO hook pra cada evento aqui, um hook pra spawnar e destruir o alien, um hook pra spawnar as portas etc...
  const [burst, setBurst] = useState(true); //TODO self-destruct-remotion-component?

  const [doorAlerts, setDoorAlerts] = useState<DoorAlerts>({});
  const [timers, setTimers] = useState<
    (z.infer<typeof TimerProps> & { label: string })[]
  >([]);
  const { batchAction } = useStateUpdateBatcher(doorAlerts); //TODO existir apenas dentro do hook q eu mencionei acima hehe
  const { batchAction: batchTimerAction } = useStateUpdateBatcher(timers);
  const { batchAction: batchAlienAction } = useStateUpdateBatcher(invasion);
  const { batchAction: batchBurstAction } = useStateUpdateBatcher(invasion);

  const { lastMessage } = useWebSocket<IncomingSocketEvent>(
    "ws://localhost:5000/channel/umjotas/overlay",
    { reconnectAttempts: 10 },
  );

  const inputProps: z.infer<typeof DoorProps> = useMemo(() => {
    return {
      faceSrc:
        "https://static-cdn.jtvnw.net/jtv_user_pictures/21ca5256-499a-4d39-8b66-b60fbff91e7f-profile_image-70x70.png",
      username: "JUQUINHA GAMEPLAYS!!!!!!!",
    };
  }, []);

  const getRandomPosition: () => [number, number] = useCallback(() => {
    return [
      topOptions
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)[randomFromInterval(0, topOptions.length)],
      leftOptions
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)[randomFromInterval(0, leftOptions.length)],
    ];
  }, []);

  const addAlert = useCallback(
    (username: string, profile_pic: DoorAlerts[string]["profile_pic"]) => {
      batchAction(() => {
        setDoorAlerts((current) => {
          const newAlerts = { ...current };
          newAlerts[username] = {
            profile_pic: profile_pic,
            position: getRandomPosition(),
          };
          return newAlerts;
        });
      });
    },
    [batchAction, getRandomPosition],
  );

  const addTimer = useCallback(
    (label: string, seconds: number) => {
      batchTimerAction(() => {
        setTimers((current) => [...current, { seconds, label }]);
      });
    },
    [batchTimerAction],
  );

  useEffect(() => {
    console.log({ lastMessage });
    if (!lastMessage) return;
    (lastMessage.data as Blob).text().then((jsonString) => {
      console.log({ jsonString });
      const jsonEvent = JSON.parse(
        jsonString,
      ) as unknown as IncomingSocketEvent;
      console.log({ jsonEvent });
      if (jsonEvent.event_name === "porta") {
        addAlert(jsonEvent.username, jsonEvent.profile_pic);
      }
      if (jsonEvent.event_name === "jumpTimer") {
        addTimer((jsonEvent as any).label, (jsonEvent as any).seconds);
      }
    });
  }, [addAlert, addTimer, lastMessage]);

  return (
    <div className="overflow-hidden shadow-[0_0_200px_rgba(0,0,0,0.15)] flex h-[1080px] w-[1920px] border-solid border-2 border-black relative">
      <div
        className={`absolute ${isAspectVideo ? "aspect-[16/9.1] left-1/2 -translate-x-1/2" : "aspect-[24.7/19] mr-2/3 ml-20 "} h-5/6 top-1/2 -translate-y-1/2 border-solid border-4 rounded-md border-black shadow-[0_0_60px_12px_#0AEBBFE0]`}
      >
        <div className="relative w-full h-full">
          <div className="w-full h-full p-[3px] border-primary border-[6px]">
            <div className="shadow-[0_0_0px_4px_black,_inset_0_0_0px_4px_black] w-full h-full border-primary-dark border-[5px]"></div>
          </div>
          {timers.length > 0 && (
            <div className="absolute top-6 right-6 flex flex-col items-center gap-3">
              <span className="text-3xl w-full text-center leading-10 font-bold text-white px-4 py-2 bg-[#000000D0] rounded-md">
                {timers[0].label}
              </span>
              <Player
                className="w-40 h-40"
                fps={30}
                compositionHeight={160}
                compositionWidth={160}
                component={Timer}
                inputProps={{
                  seconds: timers[0].seconds,
                  onFinished: () =>
                    batchTimerAction(() =>
                      setTimers((current) => {
                        const newCurrent = [...current];

                        return newCurrent.slice(1);
                      }),
                    ),
                }}
                durationInFrames={timers[0].seconds * 30}
                moveToBeginningWhenEnded={false}
                autoPlay
              />
            </div>
          )}
          {wings && (
            <>
              <div
                style={{
                  backgroundSize: "contain",
                  imageRendering: "pixelated",
                }}
                className="absolute animate-wing-image w-40 h-24 top-2 left-0 -translate-y-full ml-6"
              ></div>
              <div
                style={{
                  backgroundSize: "contain",
                  imageRendering: "pixelated",
                }}
                className="absolute animate-wing-image w-40 h-24 top-2 right-0 -translate-y-full mr-6"
              ></div>
            </>
          )}
        </div>
      </div>
      <div
        className={`absolute aspect-[14/9] ${isAspectVideo ? "top-[118px] right-[196px] -z-10 h-1/4" : "top-5 right-8 h-2/6"} border-solid border-4 rounded-md border-black shadow-[0_0_60px_12px_#BF0AEBE0]`}
      >
        <div className="relative w-full h-full">
          {wings && !isAspectVideo && (
            <>
              <div
                style={{
                  backgroundSize: "contain",
                  imageRendering: "pixelated",
                }}
                className="absolute animate-wing-image w-16 h-12 top-1 mt-0.5 right-6 -translate-y-full mr-2"
              ></div>
              <div
                style={{
                  backgroundSize: "contain",
                  imageRendering: "pixelated",
                }}
                className="absolute animate-wing-image w-16 h-12 top-1 mt-0.5 left-6 -translate-y-full"
              ></div>
            </>
          )}
          <div className="w-full h-full p-[3px] border-secondary border-[6px]">
            <div className="shadow-[0_0_0px_4px_black,_inset_0_0_0px_4px_black] w-full h-full border-secondary-dark border-[5px]"></div>
          </div>
        </div>
      </div>
      {Object.entries(doorAlerts).map(
        ([username, { position, profile_pic }]) => (
          <Player
            className="absolute"
            key={username}
            component={Door}
            inputProps={{
              ...inputProps,
              username,
              faceSrc: profile_pic,
              onFinished: () => {
                batchAction(() => {
                  setDoorAlerts((current) => {
                    const newCurrent = { ...current };
                    delete newCurrent[username];
                    return newCurrent;
                  });
                });
              },
            }}
            durationInFrames={DURATION_IN_FRAMES}
            fps={VIDEO_FPS}
            compositionHeight={1080}
            compositionWidth={1920}
            style={{
              // Can't use tailwind class for width since player's default styles take presedence over tailwind's,
              // but not over inline styles
              width: "100%",
              height: "420px",
              position: "absolute",
              top: position[0],
              left: position[1],
            }}
            moveToBeginningWhenEnded={false}
            autoPlay
          />
        ),
      )}
      {invasion && (
        <Player
          className="absolute"
          style={{
            // Can't use tailwind class for width since player's default styles take presedence over tailwind's,
            // but not over inline styles
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
          inputProps={{
            onFinished: () => {
              batchAlienAction(() => setInvasion(false));
            },
          }}
          component={Invasion}
          durationInFrames={30 * 10 + 14}
          fps={VIDEO_FPS}
          autoPlay
        />
      )}
      {burst &&
        Array.from({ length: 360 })
          .map((_, i) => i)
          .filter((i) => i % 14 === 0)
          .map((i) => (
            <Player
              key={i}
              className="absolute"
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
              }}
              inputProps={{
                degrees: i + 1,
                seed: i.toLocaleString(),
                onFinished: () => batchBurstAction(() => setBurst(false)),
              }}
              compositionHeight={1080}
              compositionWidth={1920}
              component={AnimeBurst}
              durationInFrames={30 * 10 + 14}
              fps={VIDEO_FPS}
              autoPlay
              loop
            />
          ))}
      <Player
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
        component={Tchans}
        durationInFrames={60}
        fps={VIDEO_FPS}
        autoPlay
      />
    </div>
  );
};

const WrappedPage: NextPage = (props) => (
  <Suspense>
    <Home {...props} />
  </Suspense>
);

export default WrappedPage;

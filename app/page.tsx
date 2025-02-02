"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Main } from "../remotion/Door";
import {
  CompositionProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
} from "../types/constants";
import { string, z } from "zod";
import { useStateUpdateBatcher } from "./hooks/stateUpdateBatcher";
import { randomFromInterval } from "./utils/math";
import useWebSocket from "react-use-websocket";

type DoorAlerts = {
  [key in string]: {
    profile_pic: string,
    position: [number, number]
  }
}

const topBounds = [200, 660]
const leftBounds = [-794, 774]

const topOptions = Array.from({length: topBounds[1] - topBounds[0]}).map((_,i) => i+topBounds[0]).filter(function(_, i) {
    return i % 70 === 0;
})
const leftOptions = Array.from({length: leftBounds[1] - leftBounds[0]}).map((_,i) =>i+leftBounds[0]).filter(function(_, i) {
    return i % 150 === 0;
})

type IncomingSocketEvent = {username: string, profile_pic: string, event_name: string}

const Home: NextPage = () => {
  const [doorAlerts, setDoorAlerts] = useState<DoorAlerts>({})
  const { batchAction } = useStateUpdateBatcher(doorAlerts)
  const { sendMessage, lastMessage, readyState } = useWebSocket<IncomingSocketEvent>("ws://localhost:5000", {reconnectAttempts: 10});

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      faceSrc: 'https://static-cdn.jtvnw.net/jtv_user_pictures/21ca5256-499a-4d39-8b66-b60fbff91e7f-profile_image-70x70.png',
      username: 'JUQUINHA GAMEPLAYS!!!!!!!'
    };
  }, []);

  const getRandomPosition : () => [number,number] = useCallback(() => {
    return [
      topOptions.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)[randomFromInterval(0, topOptions.length)],
      leftOptions.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)[randomFromInterval(0, leftOptions.length)]
    ]
  },[])

  const addAlert = useCallback((username: string, profile_pic: DoorAlerts[string]['profile_pic']) => {
    batchAction(() => {
      setDoorAlerts((current) => {
        const newAlerts = {...current}
        newAlerts[username] = {profile_pic: profile_pic, position: getRandomPosition()}
        return newAlerts
      })
    })
  },[batchAction, getRandomPosition])

  useEffect(() => {
    console.log({lastMessage})
    if(!lastMessage) return;
    (lastMessage.data as Blob).text().then((jsonString) => {
      console.log({jsonString})
      const jsonEvent = JSON.parse(jsonString) as unknown as IncomingSocketEvent
      console.log({jsonEvent})
      if(jsonEvent.event_name === 'porta') {
        addAlert(jsonEvent.username, jsonEvent.profile_pic)
      }
    })
  },[addAlert, lastMessage])

  return (
    <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)] flex h-screen w-screen">
      {Object.entries(doorAlerts).map(([username, {position, profile_pic}]) => (
        <Player
        key={username}
        component={Main}
        inputProps={{
          ...inputProps,
          username,
          faceSrc: profile_pic,
          onFinished: () => {
            batchAction(() => {
              setDoorAlerts((current) => {
                const newCurrent = {...current}
                delete newCurrent[username]
                return newCurrent
              })
            })
          }
        }}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        compositionHeight={1080}
        compositionWidth={1920}
        style={{
          // Can't use tailwind class for width since player's default styles take presedence over tailwind's,
          // but not over inline styles
          width: "100%",
          height: '420px',
          position: 'absolute',
          top: position[0],
          left: position[1]
        }}
        autoPlay         
        />
      ))}
    </div>
  );
};

export default Home;

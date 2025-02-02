import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CompositionProps } from "../../types/constants";
import { loadFont } from "@remotion/google-fonts/Inter";

import React, { useEffect, useRef } from "react";
import { Steve } from "../Assets/Steve";
loadFont();

export const Main = ({ faceSrc, username, onFinished }: z.infer<typeof CompositionProps> & {onFinished?: VoidFunction}) => {
  const finished = useRef(false)
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const rgb = interpolate(frame, [58, 500], [0, 80], {extrapolateRight: 'clamp'})
  const fontScale = interpolate(frame, [58, 90], [0, 128], {extrapolateRight: 'clamp', easing: Easing.out(Easing.exp)})
  const steveScale = interpolate(frame, [0, 50], [0,1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.exp)})
  const steveScaleDoorOpen = interpolate(frame, [58, 100], [1,1.75], {extrapolateRight: 'clamp', easing: Easing.out(Easing.exp)})
  const [closedDoor, openDoor] = [staticFile('/porta.png'), staticFile('/porta_aberta.png')]

  useEffect(() => {
    if(!finished.current) {
      if(frame === durationInFrames-1) {
        if(onFinished) {
          finished.current = true
          onFinished()
        }
      }
    }
  },[durationInFrames, frame, onFinished])

  return (
    <AbsoluteFill className="bg-transparent relative">
      <Sequence className="relative w-full h-full">
        <div style={{zIndex: frame > 60 ? 2 : 1}} className="absolute w-fit h-fit top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
          <Steve scale={frame > 58 ? steveScaleDoorOpen : steveScale} faceSrc={faceSrc}/>
        </div>
        {frame > 58 && (
          <div style={{
            zIndex: frame > 60 ? 2 : 1,
            color: `yellow`,
            fontSize:fontScale,
            textShadow: '3px 3px 0px black',
            transform: `translateY(-20%) translateX(-50%)`
          }} className="flex flex-col gap-1 p-2 text-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#00000080]">
          <span className="line-clamp-1">
            {username.length >= 10 ? `${username.slice(0,11)}...` : username}
          </span>
          <span className="whitespace-nowrap">acabou de entrar!</span>
          </div>
        )}
        <div style={{zIndex: 1}} className="absolute w-[calc(100%+30px)] h-full top-1/2 left-1/2 translate-x-[calc(-50%-5px)] -translate-y-1/2">
          <Img src={frame > (durationInFrames/2 + 6) ? openDoor : closedDoor} className="w-full h-full object-contain"/>
        </div>
      </Sequence>
      <Sequence from={17}>
        <Audio src={staticFile('/knock.mp3')}/>
      </Sequence>
      <Sequence from={durationInFrames/2 - 4}>
        <Audio src={staticFile('/door_open.mp3')}/>
      </Sequence>
    </AbsoluteFill>
  );
};

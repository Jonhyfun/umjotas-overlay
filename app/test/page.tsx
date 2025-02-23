"use client";

import { Player } from "@remotion/player";
import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const BouncingCircle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const speed = 5; // Adjust speed

  const [position, setPosition] = useState({
    x: 50,
    y: 50,
    dx: speed,
    dy: speed,
  });

  useEffect(() => {
    setPosition((prev) => {
      let newX = prev.x + prev.dx;
      let newY = prev.y + prev.dy;
      let newDx = prev.dx;
      let newDy = prev.dy;

      if (newX <= 25 || newX >= width - 25) newDx *= -1; // Bounce off vertical walls
      if (newY <= 25 || newY >= height - 25) newDy *= -1; // Bounce off horizontal walls

      console.log({ x: newX, y: newY, dx: newDx, dy: newDy });
      return { x: newX, y: newY, dx: newDx, dy: newDy };
    });
  }, [frame]);

  return (
    <AbsoluteFill className="bg-black">
      <div
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: 50,
          height: 50,
          borderRadius: "50%",
          backgroundColor: "red",
        }}
      />
    </AbsoluteFill>
  );
};

export default function Teste() {
  return (
    <Player
      component={BouncingCircle}
      durationInFrames={300} // 10 sec at 30fps
      fps={30}
      compositionWidth={800}
      compositionHeight={600}
      autoPlay
    />
  );
}

import { Composition } from "remotion";
import { defaultDoorProps, Door, DoorProps } from "./Door";
import {
  COMP_NAME,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../types/constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        schema={DoorProps}
        id={COMP_NAME}
        component={Door}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultDoorProps}
      />
    </>
  );
};

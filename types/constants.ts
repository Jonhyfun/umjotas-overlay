import { z } from "zod";
export const COMP_NAME = "MyComp";

export const CompositionProps = z.object({
  username: z.string(),
  faceSrc: z.string(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  username: "alguem",
  faceSrc: "https://static-cdn.jtvnw.net/jtv_user_pictures/f10831ff-a866-4ca0-982f-1b66d2f09175-profile_banner-480.png"
};

export const DURATION_IN_FRAMES = 100;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const VIDEO_FPS = 30;

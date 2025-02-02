import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export function Steve({ faceSrc, scale = 0 }: {faceSrc: string, scale: number}) {
  const {height} = useVideoConfig()
  const frame = useCurrentFrame()
  const roundedScale = Math.round(scale * 10)
  const [idle, knock] = [staticFile('/steve/chroma_idle.png'), staticFile('/steve/knock.png')]
  const [step1, step2] = [staticFile('/steve/step_1.png'), staticFile('/steve/step_2.png')]

  const mainTimeline = frame > 53 ? idle : frame > 47 ? knock : roundedScale % 2 === 1 ? step1 : step2

  return (
    <div className="w-full h-full relative">
      <Img width={207*scale*(height/720)} height={409*scale*(height/720)} src={frame > 20 && frame < 24 || frame > 26 && frame < 29 || frame > 33 && frame < 39 ? knock : mainTimeline}/>
      <Img src={faceSrc} width={118*scale*(height/720)} style={{transform: `translateX(calc(50% - ${11*scale*(height/720)}px))`}} className="absolute top-0 left-0 object-fill"></Img>
    </div>
  )
}
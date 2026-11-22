import React from "react";
import {Composition} from "remotion";
import {LyricVideo} from "./compositions/LyricVideo";
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from "./config";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LyricVideo"
      component={LyricVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};

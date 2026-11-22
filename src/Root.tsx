import React from "react";
import {Composition} from "remotion";
import {LyricVideo} from "./LyricVideo";
import {DURATION_SECONDS, FPS, HEIGHT, WIDTH} from "./config";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LyricVideo"
      component={LyricVideo}
      durationInFrames={DURATION_SECONDS * FPS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};

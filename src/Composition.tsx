import React from "react";
import { AbsoluteFill, Img, Video, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const MyComp: React.FC<{
  videoUrls?: string[];
}> = ({
  videoUrls = [
    "https://www.alvarezbarrios.com.ar/backend/videos_propiedades/ID1905/prop_1678_video1.mp4",
    "https://www.alvarezbarrios.com.ar/backend/videos_propiedades/ID1905/prop_1678_video2.mp4",
    "https://www.alvarezbarrios.com.ar/backend/videos_propiedades/ID1905/prop_1678_video3.mp4",
    "https://www.alvarezbarrios.com.ar/backend/videos_propiedades/ID1905/prop_1678_video4.mp4",
  ],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({ frame, fps, from: 0, to: 1, config: { damping: 200 } });
  const translateY = spring({ frame, fps, from: 300, to: 0, config: { damping: 200 } });

  const durations = [120, 60, 60, 120]; // duraciones en frames
  const fadeFrames = 7; // mitad antes y mitad después
  let startFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>

      {videoUrls.map((url, index) => {
        const duration = durations[index];

        // Video principal
        const videoSequence = (
          <Sequence key={`video-${index}`} from={startFrame} durationInFrames={duration}>
            <Video
              src={url}
              style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }}
              playbackRate={index === 0 ? 2 : 1} // primer video x2
            />
          </Sequence>
        );

        // Fundido a blanco entre clips
        let whiteFade = null;
        if (index < videoUrls.length - 1) {
          const fadeStartFrame = startFrame + duration - fadeFrames; // 7 frames antes de terminar el clip
          whiteFade = (
            <Sequence from={fadeStartFrame} durationInFrames={fadeFrames * 2}> {/* total 14 frames */}
              <AbsoluteFill style={{
                backgroundColor: "white",
                opacity: interpolate(
                  frame - fadeStartFrame,
                  [0, fadeFrames, fadeFrames * 2],
                  [0, 1, 0] // 0→1→0
                ),
              }} />
            </Sequence>
          );
        }

        startFrame += duration;
        return (
          <React.Fragment key={`frag-${index}`}>
            {videoSequence}
            {whiteFade}
          </React.Fragment>
        );
      })}

      {/* Logo fijo encima de todos los clips */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", display: "flex" }}>
        <Img
          src="https://www.alvarezbarrios.com.ar/img/oab_logo_2020.png"
          style={{
            width: 750,
            marginTop: 80,
            opacity,
            transform: `translateY(${translateY}px)`,
          }}
        />
      </AbsoluteFill>

    </AbsoluteFill>
  );
};

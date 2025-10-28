import React, { useState, useEffect } from "react";
import {
  AbsoluteFill,    // Ocupa todo el frame
  Img,              // Para mostrar imágenes (el logo)
  Video,            // Para mostrar videos
  Sequence,         // Para organizar clips en secuencia
  useCurrentFrame,  // Frame actual del video
  useVideoConfig,   // Información del video (fps, resolución)
  spring,           // Animaciones tipo resorte
  interpolate,      // Mapear valores para opacidad, etc.
  continueRender,   // Controlar el renderizado
  delayRender,      // Controlar el renderizado
} from "remotion";

import { getVideoMetadata } from "@remotion/media-utils";

// 🟩 Importamos los videos locales desde src/assets
import video1 from "./assets/prop_1678_video1.mp4";
import video2 from "./assets/prop_1678_video2.mp4";
import video3 from "./assets/prop_1678_video3.mp4";
import video4 from "./assets/prop_1678_video4.mp4";
import logo from "./assets/oab_logo_blanco.png";

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();  // Frame actual de la composición
  const { fps } = useVideoConfig(); // FPS del video

  // 🧩 Animaciones del logo
  const opacity = spring({          // Fade-in del logo
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 200 },      // Suavidad del resorte
  });
  const translateY = spring({       // Desplazamiento vertical del logo
    frame,
    fps,
    from: 300,                      // Empieza abajo fuera de pantalla
    to: 0,                          // Termina en posición normal
    config: { damping: 200 },
  });

  // 🎬 Configuración de clips
  const videoUrls = [video1, video2, video3, video4]; // Array de videos

  // Estado para almacenar duración real (en frames) de cada video
  const [videoDurations, setVideoDurations] = useState<number[]>([]);

  // Valores de trim fijo (más adelante vendrán del formulario PHP)
  const trimIn = 40;  // recorte inicial en frames
  const trimOut = 0;  // recorte final en frames (por ahora 0)

const [handle] = useState(() => delayRender()); // Retrasar render hasta tener metadata

useEffect(() => {
  const loadMetadata = async () => {
    try {
      const durationsPromises = videoUrls.map(async (url) => {
        const meta = await getVideoMetadata(url); // devuelve { durationInSeconds }
        return Math.floor(meta.durationInSeconds * fps); // convierte a frames
      });
      const durations = await Promise.all(durationsPromises);
      setVideoDurations(durations);
    } catch (err) {
      console.error("Error cargando metadata:", err);
    } finally {
      // ✅ Continuar el render una vez terminada la carga
      continueRender(handle);
    }
  };

  loadMetadata();
}, [fps, handle]);


  const fadeFrames = 7;       // Mitad del fade (7+7=14)
  let startFrame = 0;        // Frame de inicio de cada secuencia



  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
     {/* 🎞️ Recorremos cada video y generamos su secuencia */}
    {videoDurations.length > 0 &&
        videoUrls.map((url, index) => {
          const fullDuration = videoDurations[index]; // duración total en frames
          const rate = index === 0 ? 2 : 1;           // velocidad de reproducción

            // Duración corregida teniendo en cuenta el playbackRate
    const effectiveDuration = Math.max(
      1,
      Math.floor((fullDuration - trimIn - trimOut) / rate)
    );

          // 🟦 Secuencia principal del video
          const videoSequence = (
            <Sequence
              key={`video-${index}`}
              from={startFrame}             // En qué frame comienza este clip
              durationInFrames={effectiveDuration}   // Duración ajustada con trims
            >
              <Video
                src={url}
                startFrom={trimIn}          // recorte inicial
                endAt={fullDuration - trimOut} // recorte final (por ahora igual al total)
                playbackRate={index === 0 ? 2 : 1} // primer video a velocidad x2
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",       // rellena el frame sin deformar
                }}
              />
            </Sequence>
          );

        // -----------------------------
        // Fundido a blanco sobre los 2 videos que están en transición
        // -----------------------------
        let whiteFade = null;
        if (index < videoUrls.length - 1) { // No aplicar en el último clip
          const fadeStartFrame = startFrame + effectiveDuration - fadeFrames; // 7 frames antes de terminar el clip actual

          // El fade dura 14 frames: 7 sobre este video + 7 sobre el siguiente
          whiteFade = (
            <Sequence
              key={`fade-${index}`}
              from={fadeStartFrame}
              durationInFrames={fadeFrames * 2}
            >
              <AbsoluteFill
                style={{
                  backgroundColor: "white",
                  opacity: interpolate(
                    frame - fadeStartFrame,      // Calcular opacidad según frame
                    [0, fadeFrames, fadeFrames*2],
                    [0, 1, 0]                    // 0 → 1 → 0
                  ),
                  zIndex: 100,                  // Asegura que quede encima de ambos videos
                }}
              />
            </Sequence>
          );
        }

        startFrame += effectiveDuration; // Actualizar frame de inicio para el siguiente clip

        return (
          <React.Fragment key={`frag-${index}`}>
            {videoSequence} // Video del clip
            {whiteFade}     // Fade a blanco entre clips
          </React.Fragment>
        );
      })}

      {/* 🏷️ Logo fijo encima de todo */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-start", // Logo arriba
          alignItems: "center",
          display: "flex",
          zIndex: 200,                  // Siempre por encima
        }}
      >
        <Img
          src={logo}                     // Logo desde /assets
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

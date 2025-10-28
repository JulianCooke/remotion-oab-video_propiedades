import React from "react";
import {
  AbsoluteFill,   // Componente que ocupa todo el frame
  Img,            // Para mostrar imágenes (el logo)
  Video,          // Para mostrar videos
  Sequence,       // Para organizar clips en secuencia
  useCurrentFrame,// Hook que devuelve el frame actual
  useVideoConfig, // Hook para obtener fps, width, height
  spring,         // Función para animaciones tipo “resorte”
  interpolate,    // Función para mapear valores (ej: opacidad)
} from "remotion";

// 🟩 Importamos los videos locales desde src/assets
import video1 from "./assets/prop_1678_video1.mp4";
import video2 from "./assets/prop_1678_video2.mp4";
import video3 from "./assets/prop_1678_video3.mp4";
import video4 from "./assets/prop_1678_video4.mp4";
import logo from "./assets/logo.png";

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
  const durations = [120, 60, 60, 120];              // Duración en frames
  const fadeFrames = 7;                              // Mitad del fade (7+7=14)
  let startFrame = 0;                                // Frame de inicio de cada secuencia

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* 🎞️ Secuencias de video */}
      {videoUrls.map((url, index) => { // inicia el cilo que recorre todos los videos 
        const duration = durations[index]; // Duración de este clip

        // -----------------------------
        // Video principal
        // -----------------------------
        const videoSequence = (
          <Sequence
            key={`video-${index}`}
            from={startFrame}           // Desde este frame
            durationInFrames={duration} // Cuántos frames dura
          >
            <Video
              src={url}
                startFrom={40}          // Inicia desde el segundo 1 (30 frames a 30fps)
              playbackRate={index === 0 ? 2 : 1} // Primer video x2 velocidad
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",    // Cubrir todo sin deformar
              }}
            />
          </Sequence>
        );

        // -----------------------------
        // Fundido a blanco sobre los 2 videos que están en transición
        // -----------------------------
        let whiteFade = null;
        if (index < videoUrls.length - 1) { // No aplicar en el último clip
          const fadeStartFrame = startFrame + duration - fadeFrames; // 7 frames antes de terminar el clip actual

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

        startFrame += duration; // Actualizar frame de inicio para el siguiente clip

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

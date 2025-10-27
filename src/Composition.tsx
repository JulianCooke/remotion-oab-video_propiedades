import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

export const MyComposition = () => {
  const frame = useCurrentFrame();

  // Animaciones
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.ease, // transición suave tipo ease-in
  });

  const translateY = interpolate(frame, [0, 30], [80, 0], {
    extrapolateRight: "clamp",
    easing: Easing.ease, // se desliza hacia arriba
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "white",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <img
        src="/logo.png"
        alt="Logo Olga Alvarez Barrios"
        style={{
          width: 200,
          marginTop: 40,
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Img } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { loadFont } from "@remotion/google-fonts/Inter";
import React from "react";

// Load Google Font (Remotion best practice)
const { fontFamily } = loadFont();

// Define schema for props (Remotion best practice for parameterization)
export const AdVideoSchema = z.object({
  titleText: z.string(),
  subText: z.string(),
  imageUrl: z.string().nullable().optional(),
  bgColors: z.array(zColor()).length(2),
});

export type AdVideoProps = z.infer<typeof AdVideoSchema>;

export const AdVideo: React.FC<AdVideoProps> = ({
  titleText = "NEW ARRIVAL",
  subText = "Experience the Future",
  imageUrl,
  bgColors = ["#4f46e5", "#7e22ce"],
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Entrance animations using spring (Remotion physics-based animation)
  const slideIn = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  // Zoom effect for background and foreground
  const zoomInOut = interpolate(frame, [0, fps * 4], [1, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Global opacity fade-in
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Logic to determine layout based on aspect ratio (Responsive composition)
  const isHorizontal = width > height;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${bgColors[0]} 0%, ${bgColors[1]} 100%)`,
        overflow: "hidden",
        backgroundColor: "#000", // Fallback
      }}
    >
      {/* Background Image with Blur Effect */}
      {imageUrl && (
        <AbsoluteFill style={{ opacity: 0.3, transform: `scale(${zoomInOut})` }}>
          <Img
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(20px) brightness(0.5)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* Content Layout Layer */}
      <AbsoluteFill
        style={{
          padding: isHorizontal ? "80px" : "120px 40px",
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          alignItems: "center",
          justifyContent: "space-around",
          gap: "40px",
        }}
      >
        {/* Typography Section */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            opacity,
            transform: `translateY(${interpolate(slideIn, [0, 1], [60, 0])}px)`,
            zIndex: 10,
          }}
        >
          <h1
            style={{
              fontFamily,
              fontWeight: 900,
              fontSize: isHorizontal ? "100px" : "80px",
              lineHeight: 1.1,
              color: "white",
              textShadow: "0px 20px 50px rgba(0,0,0,0.5)",
              wordBreak: "keep-all",
              margin: 0,
            }}
          >
            {titleText}
          </h1>
          
          <p
            style={{
              fontFamily,
              fontWeight: 500,
              fontSize: isHorizontal ? "36px" : "30px",
              color: "rgba(255,255,255,0.85)",
              marginTop: "32px",
              letterSpacing: "0.02em",
              margin: "32px 0 0 0",
            }}
          >
            {subText}
          </p>
        </div>

        {/* Visual Asset Section (Foreground Image) */}
        {imageUrl && (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              transform: `scale(${interpolate(slideIn, [0, 1], [0.85, 1])})`,
              opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            <div
              style={{
                width: isHorizontal ? "90%" : "100%",
                aspectRatio: isHorizontal ? "auto" : "4/5",
                height: isHorizontal ? "85%" : "auto",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Img
                src={imageUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${interpolate(frame, [0, fps * 10], [1.15, 1.0])})`,
                }}
              />
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};


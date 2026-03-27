import {
  AbsoluteFill,
  Img,
  Sequence,
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import React from "react";
import { z } from "zod";
import { videoConceptSchema, type VideoConcept, type VideoScene } from "@/types/video";

const { fontFamily } = loadFont(undefined, {
  weights: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

export const AdVideoSchema = videoConceptSchema.extend({
  imageUrl: z.string().nullable().optional(),
  imageUrls: z.array(z.string()).optional(),
});

export type AdVideoProps = VideoConcept & {
  imageUrl?: string | null;
  imageUrls?: string[];
};

const purposeLabels: Record<VideoScene["purpose"], string> = {
  hook: "HOOK",
  problem: "PROBLEM",
  benefit: "BENEFIT",
  proof: "PROOF",
  offer: "OFFER",
  cta: "CTA",
};

const pickSceneImage = (imageUrls: string[] | undefined, fallback: string | null | undefined, index: number) =>
  imageUrls?.[index] || fallback || null;

const getMotionConfig = (motionPreset: VideoScene["motionPreset"]) => {
  switch (motionPreset) {
    case "snappy-product":
      return { damping: 34, stiffness: 180, imageFloat: 8, imageScale: [0.9, 1.02] as const };
    case "calm-editorial":
      return { damping: 200, stiffness: 90, imageFloat: 4, imageScale: [0.97, 1] as const };
    case "bold-promo":
      return { damping: 28, stiffness: 160, imageFloat: 12, imageScale: [0.88, 1.04] as const };
    case "cinematic-soft":
    default:
      return { damping: 120, stiffness: 110, imageFloat: 6, imageScale: [0.94, 1.01] as const };
  }
};

const SceneBackground: React.FC<{
  colors: string[];
  imageUrl?: string | null;
  sceneIndex: number;
  motionPreset: VideoScene["motionPreset"];
}> = ({ colors, imageUrl, sceneIndex, motionPreset }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 90], [1.02, 1.12], {
    extrapolateRight: "clamp",
  });
  const drift = Math.sin((frame + sceneIndex * 18) / 32) * 24;

  return (
    <AbsoluteFill style={{ backgroundColor: colors[0] }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(145deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 15% 10%, rgba(255,255,255,0.18), transparent 30%), radial-gradient(circle at 85% 5%, rgba(255,255,255,0.1), transparent 28%)",
        }}
      />
      {imageUrl ? (
        <AbsoluteFill
          style={{
            opacity: 0.24,
            transform: `scale(${zoom}) translate3d(${drift}px, 0, 0)`,
            filter: motionPreset === "bold-promo" ? "saturate(1.2)" : "none",
          }}
        >
          <Img
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(26px) contrast(1.08)",
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const PurposePill: React.FC<{ purpose: VideoScene["purpose"]; badgeText?: string; align: "left" | "center" }> = ({
  purpose,
  badgeText,
  align,
}) => (
  <div
    style={{
      display: "flex",
      gap: 16,
      alignItems: "center",
      justifyContent: align === "center" ? "center" : "flex-start",
      flexWrap: "wrap",
    }}
  >
    <div
      style={{
        padding: "10px 18px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.28)",
        background: "rgba(255,255,255,0.12)",
        color: "white",
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: "0.16em",
      }}
    >
      {purposeLabels[purpose]}
    </div>
    {badgeText ? (
      <div
        style={{
          padding: "12px 24px",
          borderRadius: 999,
          background: "linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)",
          color: "white",
          fontWeight: 900,
          fontSize: 22,
          letterSpacing: "0.08em",
          boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
        }}
      >
        {badgeText}
      </div>
    ) : null}
  </div>
);

const TextColumn: React.FC<{
  scene: VideoScene;
  isVertical: boolean;
}> = ({ scene, isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const align = scene.textAlign === "center" ? "center" : "left";
  const intro = spring({
    fps,
    frame,
    config: getMotionConfig(scene.motionPreset),
  });
  const copyOpacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: scene.layout === "editorial-center" ? undefined : 1.05,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        maxWidth: scene.layout === "editorial-center" ? 900 : undefined,
        width: scene.layout === "editorial-center" ? "100%" : undefined,
      }}
    >
      <Sequence from={0} premountFor={Math.round(fps * 0.4)}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            alignItems: align === "center" ? "center" : "flex-start",
            transform: `translateY(${interpolate(intro, [0, 1], [42, 0])}px)`,
            opacity: intro,
          }}
        >
          <PurposePill purpose={scene.purpose} badgeText={scene.badgeText} align={align} />
          <h1
            style={{
              margin: 0,
              color: "white",
              fontSize: scene.layout === "stacked-card" ? (isVertical ? 82 : 86) : isVertical ? 88 : 96,
              lineHeight: 0.94,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              textShadow: "0 16px 48px rgba(0,0,0,0.28)",
              whiteSpace: "pre-wrap",
              maxWidth: align === "center" ? 820 : 760,
            }}
          >
            {scene.headline}
          </h1>
          {scene.subcopy ? (
            <p
              style={{
              margin: 0,
              maxWidth: align === "center" ? 720 : isVertical ? "100%" : 760,
              color: "rgba(255,255,255,0.86)",
              fontSize: isVertical ? 30 : 32,
              lineHeight: 1.35,
              fontWeight: 500,
              opacity: copyOpacity,
              transform:
                align === "center"
                  ? `translateY(${interpolate(copyOpacity, [0, 1], [20, 0])}px)`
                  : `translateX(${interpolate(copyOpacity, [0, 1], [26, 0])}px)`,
              }}
            >
              {scene.subcopy}
            </p>
          ) : null}
        </div>
      </Sequence>

      <Sequence from={Math.round(fps * 0.45)} premountFor={Math.round(fps * 0.3)}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: align === "center" ? "center" : "flex-start",
            opacity: interpolate(frame, [0, 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {scene.visualDirection ? (
            <div
              style={{
                color: "rgba(255,255,255,0.68)",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              {scene.visualDirection}
            </div>
          ) : null}
          {scene.ctaText ? (
            <div
              style={{
                width: "fit-content",
                padding: "18px 36px",
                borderRadius: 999,
                background: "white",
                color: "#111827",
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: "0.12em",
                boxShadow: "0 22px 48px rgba(0,0,0,0.28)",
              }}
            >
              {scene.ctaText}
            </div>
          ) : null}
        </div>
      </Sequence>
    </div>
  );
};

const ImagePanel: React.FC<{
  scene: VideoScene;
  imageUrl: string;
  index: number;
  isVertical: boolean;
}> = ({ scene, imageUrl, index, isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = spring({
    fps,
    frame,
    config: getMotionConfig(scene.motionPreset),
  });
  const motion = getMotionConfig(scene.motionPreset);
  const cardAspect =
    scene.layout === "split-hero" ? "4 / 5" : scene.layout === "floating-product" ? "1 / 1" : "16 / 10";

  return (
    <Sequence from={Math.round(fps * 0.2)} premountFor={Math.round(fps * 0.4)}>
      <div
        style={{
          flex:
            scene.layout === "editorial-center" ? undefined : scene.layout === "floating-product" ? 0.82 : 0.95,
          width: scene.layout === "editorial-center" ? "100%" : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${Math.cos((frame + index * 9) / 22) * motion.imageFloat}px) scale(${interpolate(
            intro,
            [0, 1],
            motion.imageScale
          )})`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: scene.layout === "editorial-center" ? "72%" : "100%",
            maxWidth: scene.layout === "editorial-center" ? 980 : undefined,
            aspectRatio: cardAspect,
            borderRadius: scene.layout === "stacked-card" ? 28 : 40,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.34)",
          }}
        >
          <Img
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: scene.layout === "floating-product" ? "contain" : "cover",
              background: scene.layout === "floating-product" ? "rgba(255,255,255,0.06)" : undefined,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.0) 28%, rgba(255,255,255,0.26) 50%, rgba(255,255,255,0.0) 72%)",
              transform: `translateX(${interpolate(frame % 80, [0, 80], [-360, 360])}px)`,
            }}
          />
          {scene.layout === "stacked-card" ? (
            <AbsoluteFill
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                transform: `translate(${isVertical ? 14 : 20}px, ${isVertical ? 14 : 20}px)`,
                borderRadius: 28,
                zIndex: -1,
                background: "rgba(255,255,255,0.08)",
              }}
            />
          ) : null}
        </div>
      </div>
    </Sequence>
  );
};

const SceneCard: React.FC<{
  scene: VideoScene;
  imageUrl?: string | null;
  index: number;
  isVertical: boolean;
}> = ({ scene, imageUrl, index, isVertical }) => {
  const align = scene.textAlign === "center" ? "center" : "left";

  const layoutDirection =
    scene.layout === "editorial-center" || (scene.layout === "stacked-card" && isVertical)
      ? "column"
      : scene.layout === "floating-product"
        ? isVertical
          ? "column-reverse"
          : "row"
        : isVertical
          ? "column"
          : "row";

  return (
    <AbsoluteFill>
      <SceneBackground
        colors={scene.bgColors}
        imageUrl={imageUrl}
        sceneIndex={index}
        motionPreset={scene.motionPreset}
      />

      <AbsoluteFill
        style={{
          padding: isVertical ? "140px 56px 96px" : "92px 88px 80px",
          display: "flex",
          flexDirection: layoutDirection,
          justifyContent: scene.layout === "editorial-center" ? "center" : "space-between",
          alignItems: align === "center" ? "center" : "stretch",
          gap: scene.layout === "editorial-center" ? 28 : isVertical ? 32 : 48,
        }}
      >
        {scene.layout === "floating-product" && imageUrl ? (
          <>
            <ImagePanel scene={scene} imageUrl={imageUrl} index={index} isVertical={isVertical} />
            <TextColumn scene={scene} isVertical={isVertical} />
          </>
        ) : scene.layout === "editorial-center" ? (
          <>
            <TextColumn scene={scene} isVertical={isVertical} />
            {imageUrl ? <ImagePanel scene={scene} imageUrl={imageUrl} index={index} isVertical={isVertical} /> : null}
          </>
        ) : (
          <>
            <TextColumn scene={scene} isVertical={isVertical} />
            {imageUrl ? <ImagePanel scene={scene} imageUrl={imageUrl} index={index} isVertical={isVertical} /> : null}
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const AdVideo: React.FC<AdVideoProps> = ({
  scenes,
  imageUrl,
  imageUrls,
}) => {
  const { width, height, fps } = useVideoConfig();
  const isVertical = height >= width;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050816",
        fontFamily,
        overflow: "hidden",
      }}
    >
      <Series>
        {scenes.map((scene, index) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={Math.max(1, Math.round(scene.durationSeconds * fps))}
            premountFor={Math.round(fps * 0.4)}
          >
            <SceneCard
              scene={scene}
              imageUrl={pickSceneImage(imageUrls, imageUrl, index)}
              index={index}
              isVertical={isVertical}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

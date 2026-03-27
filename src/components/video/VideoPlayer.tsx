"use client";

import { Player } from "@remotion/player";
import { AdVideo } from "@/remotion/AdVideo";
import React from "react";
import type { VideoConcept } from "@/types/video";

interface VideoPlayerProps {
  concept: VideoConcept;
  imageUrl?: string;
  imageUrls?: string[];
  width: number;
  height: number;
  fps: number;
}

export default function VideoPlayer({
  concept,
  imageUrl,
  imageUrls,
  width,
  height,
  fps,
}: VideoPlayerProps) {
  return (
    <Player
      component={AdVideo}
      inputProps={{
        ...concept,
        imageUrl,
        imageUrls,
      }}
      durationInFrames={concept.scenes.reduce(
        (sum, scene) => sum + Math.round(scene.durationSeconds * fps),
        0
      )}
      fps={fps}
      compositionWidth={width}
      compositionHeight={height}
      style={{
        width: "100%",
        height: "100%",
      }}
      acknowledgeRemotionLicense
      controls
      loop
      autoPlay
    />
  );
}

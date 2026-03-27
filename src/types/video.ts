import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const videoScenePurposeSchema = z.enum([
  "hook",
  "problem",
  "benefit",
  "proof",
  "offer",
  "cta",
]);

export const videoSceneLayoutSchema = z.enum([
  "split-hero",
  "editorial-center",
  "stacked-card",
  "floating-product",
]);

export const videoTextAlignSchema = z.enum(["left", "center"]);

export const videoMotionPresetSchema = z.enum([
  "cinematic-soft",
  "snappy-product",
  "calm-editorial",
  "bold-promo",
]);

export const videoSceneSchema = z.object({
  id: z.string().min(1),
  purpose: videoScenePurposeSchema,
  headline: z.string().min(1).max(80),
  subcopy: z.string().max(160).default(""),
  badgeText: z.string().max(40).optional(),
  ctaText: z.string().max(40).optional(),
  durationSeconds: z.number().min(2).max(10),
  imagePrompt: z.string().max(500).default(""),
  visualDirection: z.string().max(240).default(""),
  bgColors: z.array(zColor()).length(2),
  layout: videoSceneLayoutSchema.default("split-hero"),
  textAlign: videoTextAlignSchema.default("left"),
  motionPreset: videoMotionPresetSchema.default("cinematic-soft"),
});

export const videoConceptSchema = z.object({
  title: z.string().min(1).max(120),
  objective: z.string().min(1),
  formatId: z.string().min(1),
  totalDuration: z.number().min(3).max(30),
  bgmMood: z.string().max(80).default("upbeat-modern"),
  globalCtaText: z.string().max(40).default("詳しくはこちら"),
  scenes: z.array(videoSceneSchema).min(2).max(6),
});

export type VideoScene = z.infer<typeof videoSceneSchema>;
export type VideoConcept = z.infer<typeof videoConceptSchema>;

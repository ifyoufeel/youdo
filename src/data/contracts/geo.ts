/* Metres east/north of Taipei Main Station on a flat grid — exactly what
   preview/data.taiwan.js already uses (its own header comment: "Positions
   are metres on a flat grid centred on Taipei Main Station"). A real
   lat/lng + PostGIS geography point is M7 work (ADR-004's "geo params in
   listQuests" is written generically enough to carry either); this repo's
   memory adapter has no reason to invent lat/lng before there's a real
   geocoder or map behind it. */
import { z } from "zod";

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type Point = z.infer<typeof PointSchema>;

export function distanceBetween(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

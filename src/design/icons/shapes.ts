/* Icon geometry — ported verbatim from preview/ds-bundle.js:17-65 (a
   hand-picked Lucide (ISC/MIT) subset, redrawn on Lucide's 24x24
   round-cap grid; no icon assets shipped with the original brief).
   Extracted programmatically from the source, not hand-transcribed,
   so this is byte-for-byte the same geometry the web version renders.

   Shape tuple = ["path","d"] | ["circle","cx","cy","r"] | ["rect","x","y","width","height","rx"],
   rendered 1:1 by Icon.tsx via react-native-svg. */
import type { IconName } from "./names";

export type IconShape =
  | ["path", string]
  | ["circle", number, number, number]
  | ["rect", number, number, number, number, number];

export const ICON_SHAPES: Record<IconName, IconShape[]> = {
  search: [["circle",11,11,8], ["path","m21 21-4.3-4.3"]],
  plus: [["path","M5 12h14"], ["path","M12 5v14"]],
  x: [["path","M18 6 6 18"], ["path","m6 6 12 12"]],
  check: [["path","M20 6 9 17l-5-5"]],
  "check-circle": [["circle",12,12,10], ["path","m8.5 12.5 2.5 2.5 4.5-5"]],
  "map-pin": [["path","M20 10c0 4.4-5.2 9.6-7.3 11.5a1 1 0 0 1-1.4 0C9.2 19.6 4 14.4 4 10a8 8 0 0 1 16 0z"], ["circle",12,10,3]],
  map: [["path","m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"], ["path","M9 3v15"], ["path","M15 6v15"]],
  clock: [["circle",12,12,10], ["path","M12 6.5V12l4 2"]],
  calendar: [["rect",3,4,18,18,2], ["path","M8 2v4"], ["path","M16 2v4"], ["path","M3 10h18"]],
  star: [["path","M11.5 3.1a.6.6 0 0 1 1 0l2.3 4.7 5.2.8a.6.6 0 0 1 .3 1l-3.7 3.6.9 5.2a.6.6 0 0 1-.9.6L12 16.6l-4.6 2.5a.6.6 0 0 1-.9-.7l.9-5.2-3.7-3.6a.6.6 0 0 1 .3-1l5.2-.8z"]],
  heart: [["path","M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"]],
  wallet: [["path","M3 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1"], ["path","M3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2"], ["path","M17 13h.01"]],
  coins: [["circle",8,8,6], ["path","M18.1 10.4a6 6 0 1 1-8.5 8.4"], ["path","M7 6h1v4"], ["path","M6.7 10h2.6"]],
  "credit-card": [["rect",2,5,20,14,2], ["path","M2 10h20"]],
  briefcase: [["rect",2,7,20,14,2], ["path","M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"]],
  package: [["path","M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"], ["path","m3.3 7 8.7 5 8.7-5"], ["path","M12 22V12"]],
  "chevron-right": [["path","m9 18 6-6-6-6"]],
  "chevron-left": [["path","m15 18-6-6 6-6"]],
  "chevron-down": [["path","m6 9 6 6 6-6"]],
  "chevron-up": [["path","m18 15-6-6-6 6"]],
  "arrow-right": [["path","M5 12h14"], ["path","m12 5 7 7-7 7"]],
  "arrow-left": [["path","M19 12H5"], ["path","m12 19-7-7 7-7"]],
  "message-circle": [["path","M7.9 20A9 9 0 1 0 4 16.1L2 22z"]],
  "message-square": [["path","M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"]],
  send: [["path","M22 2 11 13"], ["path","M22 2l-7 20-4-9-9-4z"]],
  bell: [["path","M10.3 21a1.9 1.9 0 0 0 3.4 0"], ["path","M4 17h16a2 2 0 0 1-2-2v-4a6 6 0 1 0-12 0v4a2 2 0 0 1-2 2z"]],
  user: [["path","M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"], ["circle",12,7,4]],
  users: [["path","M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"], ["circle",9,7,4], ["path","M22 21v-2a4 4 0 0 0-3-3.9"], ["path","M16 3.1a4 4 0 0 1 0 7.8"]],
  "sliders-horizontal": [["path","M21 4h-6"], ["path","M10 4H3"], ["path","M21 12h-8"], ["path","M8 12H3"], ["path","M21 20h-4"], ["path","M12 20H3"], ["circle",12.5,4,2], ["circle",10.5,12,2], ["circle",14.5,20,2]],
  filter: [["path","M3 4h18l-7 8v7l-4 2v-9z"]],
  home: [["path","m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"]],
  "list-checks": [["path","M11 6h10"], ["path","M11 12h10"], ["path","M11 18h10"], ["path","m3 6 1.5 1.5L7 4"], ["path","m3 16 1.5 1.5L7 14"]],
  "shield-check": [["path","M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"], ["path","m9 12 2 2 4-4"]],
  zap: [["path","M13 2 3 14h9l-1 8 10-12h-9z"]],
  sparkles: [["path","m12 3 1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"], ["path","M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"]],
  "thumbs-up": [["path","M7 10v11"], ["path","M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.1 6.9A2 2 0 0 1 18.7 21H7V10h1.8a2 2 0 0 0 1.8-1.1L13 4a2.4 2.4 0 0 1 2 1.9z"]],
  camera: [["path","M14.5 4h-5L8 6.5H4a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-4z"], ["circle",12,13,3.2]],
  image: [["rect",3,3,18,18,2], ["circle",8.5,8.5,1.5], ["path","m21 15-5-5L5 21"]],
  pencil: [["path","M12 20h9"], ["path","M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"]],
  trash: [["path","M3 6h18"], ["path","M8 6V4h8v2"], ["path","M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"]],
  eye: [["path","M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"], ["circle",12,12,3]],
  lock: [["rect",3,11,18,11,2], ["path","M7 11V7a5 5 0 0 1 10 0v4"]],
  info: [["circle",12,12,10], ["path","M12 16.5V11"], ["path","M12 8h.01"]],
  "alert-triangle": [["path","m10.3 3.6-8 14A2 2 0 0 0 4 20.5h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0z"], ["path","M12 9v4"], ["path","M12 17h.01"]],
  flag: [["path","M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z"], ["path","M4 22v-7"]],
  share: [["path","M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"], ["path","m16 6-4-4-4 4"], ["path","M12 2v13"]],
  "more-horizontal": [["circle",5,12,1], ["circle",12,12,1], ["circle",19,12,1]],
};

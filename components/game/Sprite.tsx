'use client';

import { useMemo } from 'react';
import type { Character, CharacterKind, Pose } from '@/lib/game/characters';

/**
 * Pixel-art characters, authored as pixel maps and rendered as SVG rects.
 *
 * Written as text grids rather than imported PNGs so each character can be
 * re-tinted to its branch colour at runtime, scales crisply to any size, and
 * animates without a sprite sheet.
 *
 * The grid is 12x16: big enough for a readable silhouette (head, shoulders,
 * arms, legs) at the size these are drawn on screen. An earlier 10x12 version
 * collapsed into an unreadable blob. Every character shares one body so the
 * cast reads as a single set; only the head changes.
 *
 * Legend: . transparent  O outline  S skin  E eye  A garment  B shade  M metal
 */

const GRID_W = 12;
const GRID_H = 16;
const HEAD_ROWS = 8;

/**
 * Chibi proportions -- a big head and short body. Children's games use this
 * because the face is what carries character, and at this size the face is
 * the first thing to disappear if the head is realistic.
 *
 * Facial features are DARK on light skin. White eyes were invisible here:
 * a one-pixel highlight on a pale face has almost no contrast, while a dark
 * dot reads instantly.
 */
const BODY = [
  '...OAAAAO...',
  '..OOAAAAOO..',
  '.OMOAAAAOSO.',
  '.OMOAAAAOSO.',
  '..OOAAAAOO..',
  '...OBBBBO...',
  '...OB..BO...',
  '...OO..OO...',
];

/** Ghosts drift, so they get a wavy hem instead of legs. */
const GHOST_BODY = [
  '..OAAAAAAO..',
  '.OAAAAAAAAO.',
  '.OAAAAAAAAO.',
  '.OAAAAAAAAO.',
  '.OAAAAAAAAO.',
  '.OAAAAAAAAO.',
  '.OA.AA.AA.O.',
  '..O.O..O.O..',
];

const HEADS: Record<CharacterKind, string[]> = {
  // Knight: helmet, visible face, determined mouth.
  hero: [
    '...OOOOOO...',
    '..OAAAAAAO..',
    '..OAAAAAAO..',
    '..OSSSSSSO..',
    '..OSESSESO..',
    '..OSSSSSSO..',
    '..OSSOOSSO..',
    '...OOOOOO...',
  ],
  // Wizard: tall pointed hat.
  mage: [
    '.....OO.....',
    '....OAAO....',
    '...OAAAAO...',
    '..OAAAAAAO..',
    '.OAAAAAAAAO.',
    '..OSESSESO..',
    '..OSSOOSSO..',
    '...OOOOOO...',
  ],
  // Archer: hood framing the face.
  archer: [
    '...OOOOOO...',
    '..OAAAAAAO..',
    '.OAAAAAAAAO.',
    '.OAASSSSAAO.',
    '.OASESSESAO.',
    '..OSSSSSSO..',
    '..OSSOOSSO..',
    '...OOOOOO...',
  ],
  // Scout: flat cap, cheerful.
  scout: [
    '..OOOOOOOO..',
    '..OAAAAAAO..',
    '....OSSO....',
    '..OSSSSSSO..',
    '..OSESSESO..',
    '..OSSSSSSO..',
    '..OSSOOSSO..',
    '...OOOOOO...',
  ],
  // Brawler: headband, bare head.
  brawler: [
    '...OOOOOO...',
    '..OSSSSSSO..',
    '..OAAAAAAO..',
    '..OSSSSSSO..',
    '..OSESSESO..',
    '..OSSSSSSO..',
    '..OSSOOSSO..',
    '...OOOOOO...',
  ],
  // Ghost: hollow eyes, no mouth.
  ghost: [
    '...OOOOOO...',
    '..OAAAAAAO..',
    '.OAAAAAAAAO.',
    '.OAAAAAAAAO.',
    '.OAOAAAAOAO.',
    '.OAAAAAAAAO.',
    '.OAAAAAAAAO.',
    '.OAAAAAAAAO.',
  ],
};

const PIXEL = 3;

/** Rendered footprint, so callers can place nameplates above the head. */
export const SPRITE_W = GRID_W * PIXEL;
export const SPRITE_H = GRID_H * PIXEL;

interface Run {
  x: number;
  y: number;
  w: number;
  fill: string;
}

/** Merge horizontal runs of one colour into single rects. */
function buildRuns(rows: string[], colors: Record<string, string>): Run[] {
  const runs: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.') {
        x++;
        continue;
      }
      let width = 1;
      while (x + width < row.length && row[x + width] === ch) width++;
      const fill = colors[ch];
      if (fill) runs.push({ x, y, w: width, fill });
      x += width;
    }
  });
  return runs;
}

const POSE_CLASS: Record<Pose, string> = {
  idle: 'gfk-sprite-idle',
  strike: 'gfk-sprite-strike',
  leap: 'gfk-sprite-leap',
  cast: 'gfk-sprite-cast',
  hurt: 'gfk-sprite-hurt',
  cheer: 'gfk-sprite-cheer',
};

export function Sprite({
  character,
  pose = 'idle',
  scale = 1,
}: {
  character: Character;
  pose?: Pose;
  scale?: number;
}) {
  const isGhost = character.kind === 'ghost';

  const runs = useMemo(() => {
    const head = HEADS[character.kind].slice(0, HEAD_ROWS);
    const rows = [...head, ...(isGhost ? GHOST_BODY : BODY)];
    return buildRuns(rows, {
      O: isGhost ? 'rgba(99,102,241,0.6)' : '#0b1120',
      S: '#f6d3ab',
      E: '#1b2440',
      A: character.color,
      B: character.shade,
      M: '#e2e8f0',
    });
  }, [character.kind, character.color, character.shade, isGhost]);

  // Two nested groups on purpose: a CSS `transform` overrides the SVG
  // transform ATTRIBUTE, so placement lives on the outer group and the pose
  // animation on the inner one. Collapsing them makes characters fly off
  // their platforms the moment an animation runs.
  return (
    <g
      // Anchor at the feet so a character always stands ON its platform,
      // whatever pose it is in.
      transform={`translate(${(-SPRITE_W * scale) / 2} ${-SPRITE_H * scale}) scale(${scale})`}
      opacity={isGhost ? 0.75 : 1}
    >
      <g className={`gfk-sprite ${POSE_CLASS[pose]}`}>
        {runs.map((run, i) => (
          <rect
            key={i}
            x={run.x * PIXEL}
            y={run.y * PIXEL}
            width={run.w * PIXEL}
            height={PIXEL}
            fill={run.fill}
            shapeRendering="crispEdges"
          />
        ))}
      </g>
    </g>
  );
}

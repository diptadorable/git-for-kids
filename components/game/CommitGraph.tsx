'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Tree } from '@/lib/git/types';
import { layoutTree, type GraphLayout } from '@/lib/game/layout';
import { characterFor, type Pose } from '@/lib/game/characters';
import { Sprite, SPRITE_H } from './Sprite';

/**
 * The commit graph rendered as the game world.
 *
 * Commits are rune platforms, branches are characters standing on them, and
 * HEAD is the spotlight on whoever the player is currently controlling. This
 * is a pure rendering layer -- it reads the same Tree the engine produces, so
 * none of the verified git behaviour depends on anything in this file.
 */

const LANE_COLORS = [
  '#60a5fa',
  '#f472b6',
  '#4ade80',
  '#fbbf24',
  '#a78bfa',
  '#22d3ee',
  '#fb923c',
];

const NODE_R = 22;
const SPRITE_SCALE = 1.5;
const DURATION = 480;

interface Point {
  x: number;
  y: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function useTweenedPositions(layout: GraphLayout, animate: boolean) {
  const target = useMemo(
    () => new Map(layout.commits.map((c) => [c.id, { x: c.x, y: c.y }])),
    [layout],
  );

  const [positions, setPositions] = useState<Map<string, Point>>(target);
  const displayed = useRef(target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      displayed.current = target;
      return;
    }

    const from = new Map(displayed.current);
    // A brand new platform rises out of the one it was forged from.
    for (const commit of layout.commits) {
      if (from.has(commit.id)) continue;
      const edge = layout.edges.find((e) => e.fromId === commit.id);
      from.set(commit.id, (edge && from.get(edge.toId)) ?? { x: commit.x, y: commit.y });
    }

    const started = performance.now();
    const tick = (now: number) => {
      const e = easeOutCubic(Math.min(1, (now - started) / DURATION));
      const next = new Map<string, Point>();
      for (const [id, end] of target) {
        const start = from.get(id) ?? end;
        next.set(id, {
          x: start.x + (end.x - start.x) * e,
          y: start.y + (end.y - start.y) * e,
        });
      }
      displayed.current = next;
      setPositions(next);
      if (now - started < DURATION) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [layout, target, animate]);

  return animate ? positions : target;
}

export function CommitGraph({
  tree,
  animate = true,
  className,
  pose = 'idle',
  /** Small mode drops the characters -- used for the goal preview and demos. */
  showCharacters = true,
}: {
  tree: Tree;
  animate?: boolean;
  className?: string;
  pose?: Pose;
  showCharacters?: boolean;
}) {
  // Without the cast there is nothing tall to make room for, so pack it in.
  const layout = useMemo(
    () => layoutTree(tree, { compact: !showCharacters }),
    [tree, showCharacters],
  );
  const positions = useTweenedPositions(layout, animate);
  const resting = useMemo(
    () => new Map(layout.commits.map((c) => [c.id, { x: c.x, y: c.y }])),
    [layout],
  );
  const at = (id: string) => positions.get(id) ?? resting.get(id) ?? { x: 0, y: 0 };

  // Characters: every branch, plus HEAD itself when it is detached -- the
  // player still has a body in the world when they step off a branch.
  const characterLabels = layout.labels.filter((l) => l.kind !== 'tag');
  const monumentLabels = layout.labels.filter((l) => l.kind === 'tag');

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={layout.width}
      height={layout.height}
      className={className}
      role="img"
      aria-label="Commit graph"
      // The stage renders at natural size and the container pans, like a game
      // camera. Fitting it to the panel instead shrank the whole world (and
      // the cast with it) the moment a level had more than a few commits.
      style={
        showCharacters
          ? { overflow: 'visible', flex: 'none' }
          : { maxWidth: '100%', height: 'auto', overflow: 'visible' }
      }
    >
      <defs>
        <radialGradient id="gfk-glow">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Rope bridges between platforms. */}
      <g>
        {layout.edges.map((edge) => {
          const a = at(edge.fromId);
          const b = at(edge.toId);
          const midY = (a.y + b.y) / 2;
          const d =
            Math.abs(a.x - b.x) < 1
              ? `M ${a.x} ${a.y} L ${b.x} ${b.y}`
              : `M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
          return (
            <g key={edge.id}>
              <path d={d} fill="none" stroke="rgba(15,23,42,0.85)" strokeWidth={7} strokeLinecap="round" />
              <path d={d} fill="none" stroke="rgba(148,163,184,0.6)" strokeWidth={3} strokeLinecap="round" />
            </g>
          );
        })}
      </g>

      {/* Platforms. */}
      <g>
        {layout.commits.map((commit) => {
          const p = at(commit.id);
          const color = LANE_COLORS[commit.lane % LANE_COLORS.length];
          return (
            <g key={commit.id}>
              {commit.isHead && (
                <circle cx={p.x} cy={p.y} r={NODE_R + 26} fill="url(#gfk-glow)" />
              )}
              <ellipse
                cx={p.x}
                cy={p.y + NODE_R * 0.55}
                rx={NODE_R * 0.95}
                ry={NODE_R * 0.3}
                fill="rgba(2,6,23,0.5)"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={NODE_R}
                fill={commit.isCopy ? '#0f172a' : color}
                stroke={commit.isCopy ? color : '#0b1120'}
                strokeWidth={3}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={NODE_R - 6}
                fill="none"
                stroke={commit.isCopy ? color : 'rgba(11,17,32,0.35)'}
                strokeWidth={1.5}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize={commit.id.length > 3 ? 10 : 12}
                fontWeight={800}
                fill={commit.isCopy ? color : '#0f172a'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {commit.id}
              </text>
            </g>
          );
        })}
      </g>

      {/* Tags: permanent monuments planted in the ground. */}
      <g>
        {monumentLabels.map((label) => {
          const anchor = at(label.commitId);
          const x = anchor.x + NODE_R + 14;
          const y = anchor.y + 2;
          const width = Math.max(26, label.text.length * 7.5 + 12);
          const isTag = true;
          return (
            <g key={label.id}>
              <rect x={x - 2} y={y - 16} width={3} height={22} fill="#a16207" />
              <rect
                x={x}
                y={y - 18}
                width={width}
                height={16}
                rx={3}
                fill={isTag ? '#422006' : '#7f1d1d'}
                stroke={isTag ? '#a16207' : '#dc2626'}
                strokeWidth={1.5}
              />
              <text
                x={x + width / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fill={isTag ? '#fde68a' : '#fecaca'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {label.text}
              </text>
            </g>
          );
        })}
      </g>

      {/* The cast. Each branch is a character standing on its platform. */}
      {showCharacters && (
        <g>
          {characterLabels.map((label) => {
            const anchor = at(label.commitId);
            // A detached HEAD is still the player, so it keeps the Hero body.
            const character = characterFor(label.kind === 'head' ? 'main' : label.text);
            // Several branches can share a platform, so fan them out.
            const offset = label.slot * 34;
            const x = anchor.x + offset;
            const feetY = anchor.y - NODE_R + 4;
            const nameWidth = Math.max(30, label.text.length * 7.5 + 14);
            // Derived from the real sprite height so the plate always clears
            // the head, whatever the character or scale.
            const plateY = feetY - SPRITE_H * SPRITE_SCALE - 12;
            // Only whoever HEAD is attached to performs the action.
            const activePose: Pose = label.isCheckedOut ? pose : 'idle';

            return (
              <g key={label.id}>
                <g transform={`translate(${x} ${feetY})`}>
                  <Sprite character={character} pose={activePose} scale={SPRITE_SCALE} />
                </g>
                <rect
                  x={x - nameWidth / 2}
                  y={plateY}
                  width={nameWidth}
                  height={18}
                  rx={4}
                  fill={label.isCheckedOut ? '#f9c74f' : 'rgba(15,23,42,0.9)'}
                  stroke={label.isCheckedOut ? '#fff7ed' : character.shade}
                  strokeWidth={label.isCheckedOut ? 2 : 1.5}
                />
                <text
                  x={x}
                  y={plateY + 13}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fill={label.isCheckedOut ? '#2a1a02' : '#e2e8f0'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {label.text}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}

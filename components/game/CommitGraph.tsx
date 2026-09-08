'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Tree } from '@/lib/git/types';
import { layoutTree, type GraphLayout } from '@/lib/game/layout';

const LANE_COLORS = [
  '#60a5fa', // blue
  '#f472b6', // pink
  '#4ade80', // green
  '#fbbf24', // amber
  '#a78bfa', // violet
  '#22d3ee', // cyan
  '#fb923c', // orange
];

const NODE_R = 21;
const DURATION = 480;

interface Point {
  x: number;
  y: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Tween commit positions between layouts so a rebase reads as the branch
 * physically moving. Nodes and edges are driven from the same interpolated
 * coordinates, so lines never lag behind the circles they connect.
 */
function useTweenedPositions(layout: GraphLayout, animate: boolean) {
  const target = useMemo(
    () => new Map(layout.commits.map((c) => [c.id, { x: c.x, y: c.y }])),
    [layout],
  );

  // Rendered positions live in state; `displayed` mirrors them for the
  // animation loop, which needs the latest value without re-subscribing.
  const [positions, setPositions] = useState<Map<string, Point>>(target);
  const displayed = useRef(target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      displayed.current = target;
      return;
    }

    const from = new Map(displayed.current);
    // A brand new commit grows out of its parent rather than popping in.
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

  // Static graphs (the goal preview) skip the tween entirely.
  return animate ? positions : target;
}

export function CommitGraph({
  tree,
  animate = true,
  className,
}: {
  tree: Tree;
  animate?: boolean;
  className?: string;
}) {
  const layout = useMemo(() => layoutTree(tree), [tree]);
  const positions = useTweenedPositions(layout, animate);
  // Fall back to the freshly computed layout so a commit created this frame
  // draws in the right place instead of at the origin.
  const resting = useMemo(
    () => new Map(layout.commits.map((c) => [c.id, { x: c.x, y: c.y }])),
    [layout],
  );
  const at = (id: string) => positions.get(id) ?? resting.get(id) ?? { x: 0, y: 0 };

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      // Explicit intrinsic size, otherwise the SVG defaults to 100% width and
      // a four-commit demo scales up to fill whatever container it lands in.
      width={layout.width}
      height={layout.height}
      className={className}
      role="img"
      aria-label="Commit graph"
      style={{ maxWidth: '100%', height: 'auto', overflow: 'visible' }}
    >
      {/* Edges first so nodes always sit on top of their connections. */}
      <g>
        {layout.edges.map((edge) => {
          const a = at(edge.fromId);
          const b = at(edge.toId);
          // Curve when a link changes column, so merges read as joins.
          const midY = (a.y + b.y) / 2;
          const d =
            Math.abs(a.x - b.x) < 1
              ? `M ${a.x} ${a.y} L ${b.x} ${b.y}`
              : `M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
          return (
            <path
              key={edge.id}
              d={d}
              fill="none"
              stroke="rgba(148,163,184,0.55)"
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      <g>
        {layout.commits.map((commit) => {
          const p = at(commit.id);
          const color = LANE_COLORS[commit.lane % LANE_COLORS.length];
          return (
            <g key={commit.id}>
              {commit.isHead && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={NODE_R + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  opacity={0.55}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={NODE_R}
                fill={commit.isCopy ? 'rgba(15,23,42,0.92)' : color}
                stroke={color}
                strokeWidth={3}
              />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fontSize={commit.id.length > 3 ? 12 : 14}
                fontWeight={700}
                fill={commit.isCopy ? color : '#0f172a'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {commit.id}
              </text>
            </g>
          );
        })}
      </g>

      <g>
        {layout.labels.map((label) => {
          // Labels ride on their commit so they travel with it.
          const anchor = at(label.commitId);
          const width = Math.max(30, label.text.length * 8.5 + 16);
          const y = anchor.y - NODE_R - 20 - label.slot * 26;
          const palette = {
            branch: { bg: '#1e293b', fg: '#e2e8f0', border: '#475569' },
            remote: { bg: '#1e1b4b', fg: '#c7d2fe', border: '#4f46e5' },
            tag: { bg: '#422006', fg: '#fde68a', border: '#a16207' },
            head: { bg: '#7f1d1d', fg: '#fecaca', border: '#dc2626' },
          }[label.kind];

          return (
            <g key={label.id}>
              <rect
                x={anchor.x - width / 2}
                y={y - 12}
                width={width}
                height={24}
                rx={6}
                fill={palette.bg}
                stroke={label.isCheckedOut ? '#f8fafc' : palette.border}
                strokeWidth={label.isCheckedOut ? 2.5 : 1.5}
              />
              <text
                x={anchor.x}
                y={y + 5}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill={palette.fg}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {label.text}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

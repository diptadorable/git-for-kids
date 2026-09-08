'use client';

import { useMemo, useState } from 'react';
import { Markdown } from '@/components/Markdown';
import { CommitGraph } from './CommitGraph';
import { GitRepo } from '@/lib/git/repo';
import { runCommands } from '@/lib/git/commands';
import type { Tree } from '@/lib/git/types';
import type { DialogView } from '@/lib/game/content';

/**
 * The lesson intro, shown as quest slides from an NPC guide.
 *
 * Upstream ships two slide types: plain prose (ModalAlert) and a worked
 * example (GitDemonstrationView) that runs a real command on a small repo.
 * The demo slides run through our own engine, so what the guide shows is
 * exactly what the player's own commands will do.
 */

function DemoSlide({ options }: { options: NonNullable<DialogView['options']> }) {
  const [ran, setRan] = useState(false);

  const { before, after } = useMemo(() => {
    const repo = GitRepo.fromDefault();
    try {
      if (options.beforeCommand) runCommands(repo, options.beforeCommand);
    } catch {
      /* a demo that cannot set up just shows the default repo */
    }
    const beforeTree = repo.toTree();
    try {
      if (options.command) runCommands(repo, options.command);
    } catch {
      /* leave the tree as-is if the demo command is unsupported */
    }
    return { before: beforeTree, after: repo.toTree() };
  }, [options.beforeCommand, options.command]);

  return (
    <div className="gfk-demo">
      {options.beforeMarkdowns && <Markdown source={options.beforeMarkdowns} />}
      <div className="gfk-demo-stage">
        <CommitGraph tree={(ran ? after : before) as Tree} className="gfk-demo-graph" />
      </div>
      <div className="gfk-demo-controls">
        <code className="gfk-code">{options.command}</code>
        <button type="button" className="gfk-btn gfk-btn-small" onClick={() => setRan((r) => !r)}>
          {ran ? '↺' : '▶'} {options.command}
        </button>
      </div>
      {ran && options.afterMarkdowns && <Markdown source={options.afterMarkdowns} />}
    </div>
  );
}

export function QuestDialog({
  views,
  title,
  onClose,
  labels,
}: {
  views: DialogView[];
  title: string;
  onClose: () => void;
  labels: { next: string; back: string; start: string };
}) {
  const [index, setIndex] = useState(0);
  const view = views[index];
  const isLast = index === views.length - 1;

  return (
    <div className="gfk-modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="gfk-modal">
        <div className="gfk-modal-head">
          <span className="gfk-guide" aria-hidden="true">
            🧙
          </span>
          <h2 className="gfk-pixel">{title}</h2>
        </div>

        <div className="gfk-modal-body">
          {view?.type === 'GitDemonstrationView' && view.options ? (
            <DemoSlide options={view.options} />
          ) : (
            <Markdown source={view?.options?.markdowns ?? []} />
          )}
        </div>

        <div className="gfk-modal-foot">
          <div className="gfk-dots" aria-hidden="true">
            {views.map((_, i) => (
              <span key={i} className={i === index ? 'gfk-dot gfk-dot-on' : 'gfk-dot'} />
            ))}
          </div>
          <div className="gfk-modal-actions">
            {index > 0 && (
              <button
                type="button"
                className="gfk-btn gfk-btn-ghost"
                onClick={() => setIndex((i) => i - 1)}
              >
                {labels.back}
              </button>
            )}
            <button
              type="button"
              className="gfk-btn"
              onClick={() => (isLast ? onClose() : setIndex((i) => i + 1))}
            >
              {isLast ? labels.start : labels.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

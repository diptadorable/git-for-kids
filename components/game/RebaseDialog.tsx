'use client';

import { useState } from 'react';

/**
 * Stands in for `git rebase -i`'s editor.
 *
 * Reordering uses buttons rather than drag-and-drop: it has to work with a
 * thumb on a phone and a trackpad on a school laptop, and a nine-year-old
 * should not lose a commit to a mis-drag.
 */
export function RebaseDialog({
  commits,
  title,
  help,
  labels,
  onConfirm,
  onCancel,
}: {
  commits: string[];
  title: string;
  help: string;
  labels: { confirm: string; cancel: string; dropped: string };
  onConfirm: (chosen: string[]) => void;
  onCancel: () => void;
}) {
  const [order, setOrder] = useState(commits);
  const [dropped, setDropped] = useState<Set<string>>(new Set());

  const move = (index: number, delta: number) => {
    const next = [...order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  };

  const toggleDrop = (id: string) => {
    setDropped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="gfk-modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="gfk-modal gfk-modal-narrow">
        <div className="gfk-modal-head">
          <span className="gfk-guide" aria-hidden="true">
            🪄
          </span>
          <h2 className="gfk-pixel">{title}</h2>
        </div>

        <div className="gfk-modal-body">
          <p className="gfk-p">{help}</p>
          <ul className="gfk-rebase-list">
            {order.map((id, index) => {
              const isDropped = dropped.has(id);
              return (
                <li key={id} className={isDropped ? 'gfk-rebase-item gfk-dropped' : 'gfk-rebase-item'}>
                  <span className="gfk-rebase-order">{index + 1}</span>
                  <span className="gfk-rebase-id">{id}</span>
                  {isDropped && <span className="gfk-rebase-tag">{labels.dropped}</span>}
                  <span className="gfk-rebase-buttons">
                    <button
                      type="button"
                      className="gfk-btn gfk-btn-tiny"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${id} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="gfk-btn gfk-btn-tiny"
                      onClick={() => move(index, 1)}
                      disabled={index === order.length - 1}
                      aria-label={`Move ${id} down`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="gfk-btn gfk-btn-tiny"
                      onClick={() => toggleDrop(id)}
                      aria-label={`Toggle ${id}`}
                      aria-pressed={isDropped}
                    >
                      {isDropped ? '+' : '×'}
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="gfk-modal-foot">
          <div />
          <div className="gfk-modal-actions">
            <button type="button" className="gfk-btn gfk-btn-ghost" onClick={onCancel}>
              {labels.cancel}
            </button>
            <button
              type="button"
              className="gfk-btn"
              onClick={() => onConfirm(order.filter((id) => !dropped.has(id)))}
            >
              {labels.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

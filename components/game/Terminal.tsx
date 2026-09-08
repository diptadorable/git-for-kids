'use client';

import { useEffect, useRef, useState } from 'react';
import type { LogEntry } from '@/lib/game/session';

const KIND_CLASS: Record<LogEntry['kind'], string> = {
  command: 'gfk-log-command',
  output: 'gfk-log-output',
  error: 'gfk-log-error',
  win: 'gfk-log-win',
};

export function Terminal({
  log,
  onSubmit,
  placeholder,
  disabled = false,
}: {
  log: LogEntry[];
  onSubmit: (line: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const submit = () => {
    const line = value.trim();
    if (!line || disabled) return;
    setHistory((h) => [...h, line]);
    setHistoryIndex(null);
    setValue('');
    onSubmit(line);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit on Enter explicitly rather than relying on the browser's implicit
    // form submission, which it skips for key events that carry no physical
    // key code (on-screen keyboards, IMEs, assistive tech). preventDefault
    // stops a second submit where the implicit behaviour does fire.
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
      return;
    }
    // Up/Down walk previous commands, like a real shell.
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (history.length === 0) return;
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next]);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setValue('');
      } else {
        setHistoryIndex(next);
        setValue(history[next]);
      }
    }
  };

  return (
    <div className="gfk-terminal">
      <div className="gfk-terminal-log" ref={scrollRef}>
        {log.map((line) => (
          <div key={line.id} className={KIND_CLASS[line.kind]}>
            {line.kind === 'command' ? `$ ${line.text}` : line.text}
          </div>
        ))}
      </div>
      <form
        className="gfk-terminal-input"
        onClick={() => inputRef.current?.focus()}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <span className="gfk-prompt">$</span>
        <input
          ref={inputRef}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={placeholder}
          enterKeyHint="go"
        />
        <button type="submit" className="gfk-terminal-go" aria-label="Run command">
          ⏎
        </button>
      </form>
    </div>
  );
}

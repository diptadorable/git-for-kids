import type { Lang } from '../i18n/strings';
import type { Level } from './session';
import overrides from '@/data/levels.id.json';

/**
 * Localized lesson content.
 *
 * Upstream ships 17 languages but no Indonesian, so `data/levels.id.json` is
 * ours. Anything not yet translated falls back to the English original rather
 * than showing a blank -- a partly translated level is still playable.
 */

/** One lesson slide: either prose, or a worked example that runs a command. */
export interface DialogView {
  type?: string;
  options?: {
    markdowns?: string[];
    beforeMarkdowns?: string[];
    afterMarkdowns?: string[];
    command?: string;
    beforeCommand?: string;
  };
}

export interface LocalizedLevel {
  name: string;
  hint?: string;
  dialogViews: DialogView[];
}

interface Override {
  name?: string;
  hint?: string;
  startDialog?: { childViews?: DialogView[] };
}

const idOverrides = overrides as unknown as Record<string, Override>;

export function localizedLevel(level: Level, lang: Lang): LocalizedLevel {
  const override = lang === 'id' ? idOverrides[level.id] : undefined;
  return {
    name: override?.name ?? level.name,
    hint: override?.hint ?? level.hint,
    dialogViews: (override?.startDialog?.childViews ??
      level.startDialog?.childViews ??
      []) as DialogView[],
  };
}

/** Which levels still need Indonesian lesson text. */
export function untranslatedLevelIds(levels: Level[]): string[] {
  return levels
    .filter((level) => !idOverrides[level.id]?.startDialog?.childViews?.length)
    .map((level) => level.id);
}

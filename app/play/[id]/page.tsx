import { notFound } from 'next/navigation';
import { LevelPlayer } from '@/components/game/LevelPlayer';
import { getLevel, nextLevelId, LEVELS } from '@/lib/game/levels';

/** Pre-render every level route; the set is fixed at 36. */
export function generateStaticParams() {
  return LEVELS.map((level) => ({ id: level.id }));
}

export default async function PlayPage({ params }: PageProps<'/play/[id]'>) {
  // Next 16: params is a Promise and must be awaited.
  const { id } = await params;
  const level = getLevel(id);
  if (!level) notFound();

  // key={id} remounts on navigation so every level starts from clean state.
  return <LevelPlayer key={id} level={level} nextLevelId={nextLevelId(id)} />;
}

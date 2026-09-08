import { auth } from '@/lib/auth';
import { signOutAction } from '@/app/actions/auth';
import { WorldMap } from '@/components/game/WorldMap';

export default async function MapPage() {
  const session = await auth();

  return (
    <WorldMap
      signedIn={Boolean(session?.user)}
      playerName={session?.user?.name}
      onSignOut={signOutAction}
    />
  );
}

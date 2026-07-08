import { ping } from '@/services/api/leaderboardApi'
import { useSessionStore } from '@/stores/useSessionStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSceneStore } from '@/stores/useSceneStore'

export async function bootstrap(): Promise<void> {
  const session = useSessionStore()
  const player = usePlayerStore()
  const scene = useSceneStore()

  session.setOnline(await ping())

  if (player.player) {
    await player.resumeFromServer()
    scene.goto('world')
  } else {
    scene.goto('login')
  }
}

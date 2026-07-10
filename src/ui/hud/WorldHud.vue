<script setup lang="ts">
import { computed, type Component } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useSceneStore, type OverlayId } from '@/stores/useSceneStore'
import { usePresenceStore } from '@/stores/usePresenceStore'
import { useKingStore } from '@/stores/useKingStore'
import CurrencyAmount from '@/ui/components/CurrencyAmount.vue'
import DivisionIcon from '@/ui/components/DivisionIcon.vue'
import IconBull from '~icons/game-icons/bull'
import IconSwapBag from '~icons/game-icons/swap-bag'
import IconLockedChest from '~icons/game-icons/locked-chest'
import IconTrophyCup from '~icons/game-icons/trophy-cup'
import IconScrollUnfurled from '~icons/game-icons/scroll-unfurled'
import IconLaurelCrown from '~icons/game-icons/laurel-crown'
import IconUser from '~icons/tabler/user'
import IconBook from '~icons/tabler/book-2'
import IconUsers from '~icons/tabler/users'
import IconTrendingUp from '~icons/tabler/trending-up'

const player = usePlayerStore()
const scene = useSceneStore()
const presence = usePresenceStore()
const king = useKingStore()

const username = computed(() => player.player?.account.username ?? '')
const gold = computed(() => player.player?.currency.gold ?? 0)
const chargeToken = computed(() => player.player?.currency.chargeToken ?? 0)
const rating = computed(() => player.player?.record.rating ?? 0)

const docks: { id: OverlayId; label: string; icon: Component }[] = [
  { id: 'stable', label: 'Stable', icon: IconBull },
  { id: 'shop', label: 'Shop', icon: IconSwapBag },
  { id: 'vault', label: 'Vault', icon: IconLockedChest },
  { id: 'leaderboard', label: 'Ranks', icon: IconTrophyCup },
  { id: 'quests', label: 'Quests', icon: IconScrollUnfurled },
  { id: 'profile', label: 'Profile', icon: IconUser },
  { id: 'guide', label: 'Guide', icon: IconBook },
]
</script>

<template>
  <template v-if="player.player">
    <header class="hud">
      <span class="hud__brand">CHARGE ARENA</span>
      <div class="hud__stats">
        <span class="badge">{{ username }}</span>
        <span class="badge"><IconUsers class="badge__icon" /> {{ presence.onlineCount }}</span>
        <span class="badge"><CurrencyAmount kind="gold" :amount="gold" /></span>
        <span class="badge"><CurrencyAmount kind="token" :amount="chargeToken" /></span>
        <span class="badge"><IconTrendingUp class="badge__icon" /> {{ rating }}</span>
        <span class="badge" :style="{ color: player.division.color }">
          <DivisionIcon :icon-key="player.division.iconKey" /> {{ player.division.name }}
        </span>
        <span v-if="king.state" class="badge badge--king">
          <IconLaurelCrown class="badge__icon" /> {{ king.state.username }}
        </span>
      </div>
    </header>

    <nav class="dock">
      <button
        v-for="dock in docks"
        :key="dock.id"
        type="button"
        class="dock__btn"
        @click="scene.openOverlay(dock.id)"
      >
        <component :is="dock.icon" class="dock__icon" />
        <small>{{ dock.label }}</small>
      </button>
    </nav>
  </template>
</template>

<style scoped>
.hud {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: calc(0.6rem + env(safe-area-inset-top)) calc(1rem + env(safe-area-inset-right)) 0.6rem
    calc(1rem + env(safe-area-inset-left));
  pointer-events: none;
  background: linear-gradient(180deg, rgba(15, 18, 22, 0.92), rgba(15, 18, 22, 0));
}

.hud__brand {
  pointer-events: auto;
  font-family: var(--font-display);
  font-weight: 900;
  letter-spacing: 0.14em;
  color: var(--color-gold-soft);
}

.hud__stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: rgba(10, 13, 17, 0.7);
  font-size: 0.8rem;
  font-weight: 600;
  pointer-events: auto;
}

.badge__icon {
  width: 1em;
  height: 1em;
  flex: none;
}

.badge--king {
  color: var(--color-gold);
}

.dock {
  position: fixed;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  max-width: calc(100vw - 0.5rem);
  padding: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: rgba(15, 18, 22, 0.85);
  pointer-events: auto;
}

.dock::-webkit-scrollbar {
  display: none;
}

.dock__btn {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  width: 62px;
  padding: 0.45rem 0.25rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

@media (hover: hover) {
  .dock__btn:hover {
    background: rgba(229, 72, 77, 0.12);
    color: var(--color-text);
  }
}

.dock__btn:active {
  background: rgba(229, 72, 77, 0.2);
  color: var(--color-text);
}

.dock__icon {
  width: 1.25rem;
  height: 1.25rem;
}

.dock__btn small {
  font-size: 0.66rem;
  letter-spacing: 0.02em;
}

@media (max-width: 480px) {
  .hud {
    gap: 0.5rem;
  }

  .hud__brand {
    font-size: 0.78rem;
  }

  .badge {
    padding: 0.25rem 0.45rem;
    font-size: 0.7rem;
  }

  .dock {
    width: calc(100vw - 0.5rem);
    gap: 0.25rem;
  }

  .dock__btn {
    flex: 1 1 0;
    width: auto;
    min-width: 0;
    padding: 0.4rem 0.1rem;
  }

  .dock__icon {
    width: 1.1rem;
    height: 1.1rem;
  }

  .dock__btn small {
    font-size: 0.56rem;
  }
}
</style>

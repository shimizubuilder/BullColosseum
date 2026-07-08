<script setup lang="ts">
import { ref } from 'vue'
import OverlayShell from '@/ui/components/OverlayShell.vue'

interface GuideSection {
  id: string
  title: string
  heading: string
  intro?: string
  bullets: string[]
}

const SECTIONS: GuideSection[] = [
  {
    id: 'start',
    title: '🐂 Getting Started',
    heading: 'Welcome, Handler',
    intro: 'You play as Ansem — The Charger, raising a Bull from the Black Bull bloodline.',
    bullets: [
      'Walk the isometric world and enter the Colosseum to duel.',
      'Win to earn XP, Gold, and Rating.',
      'Grow your Bull: Calf, Young Bull, Bull, Alpha, The Black Bull.',
      'Everything auto-saves. Offline still works fully on local data.',
    ],
  },
  {
    id: 'controls',
    title: '🕹️ Controls',
    heading: 'Moving around',
    bullets: [
      'Use WASD, arrow keys, or click a spot to walk there.',
      'Click-to-move auto-routes around buildings with pathfinding.',
      'Walk up to a building or portal and press E to enter.',
      'The world is isometric with a live day and night cycle.',
      'Use the mini-map to navigate; it also shows the time of day.',
    ],
  },
  {
    id: 'arena',
    title: '⚔ Colosseum',
    heading: 'Charge Clash duel',
    intro: 'Duels are real-time, around 15 seconds, with one action: tap.',
    bullets: [
      'Lock Horns: tap in the golden zone for an early edge.',
      'Push: tap fast to shove the meter to your side.',
      'Final Charge: a timed tap that throws your rival out for a KO.',
      'Higher tier widens your timing window, but skill still wins.',
    ],
  },
  {
    id: 'stable',
    title: '🐂 Stable & Training',
    heading: 'Raise your Bull',
    bullets: [
      'Track stats: Power, Defense, Speed, Stamina.',
      'Training spends gold for instant XP.',
      'Levelling raises stats and eventually your tier.',
    ],
  },
  {
    id: 'ranked',
    title: '🏅 Rankings & Divisions',
    heading: 'Climb the ladder',
    intro: 'Rating places you in a division from Bronze up to Emperor.',
    bullets: [
      'Win ranked duels to gain rating.',
      'The season Rankings board shows the global top players.',
    ],
  },
  {
    id: 'quests',
    title: '📋 Daily Quests',
    heading: 'Quest Board',
    intro: 'Open the Quest Board for three daily quests that reset every day.',
    bullets: [
      'Win duels, breed a Bull, collect pen earnings, place bets, watch live matches.',
      'Progress tracks automatically — hit Claim for gold and sometimes tokens.',
    ],
  },
  {
    id: 'king',
    title: '👑 King of the Arena',
    heading: 'Rule the lobby',
    bullets: [
      'Only one King exists at a time.',
      'Beat the King in the Colosseum to take the throne.',
      'The longer you hold, the bigger the bounty paid out when dethroned.',
    ],
  },
  {
    id: 'tournament',
    title: '🏆 Tournaments',
    heading: 'Single-elim brackets',
    bullets: [
      'Eight fighters: Quarterfinal, Semifinal, Final.',
      'Modes: Practice, Daily, and Weekly with reset countdowns.',
      'Join with an entry fee — win it all to take the prize pool.',
      'While watching live matches, bet gold for a 1.9x payout.',
    ],
  },
  {
    id: 'farm',
    title: '🏝️ Farm Island & Breeding',
    heading: 'Own a Pen, breed Bulls',
    intro: 'Take the portal to Farm Island.',
    bullets: [
      'Buy a plot to open your Pen, holding two Bulls.',
      'A Bull must be withdrawn from the pen to fight.',
      'Breed two Bulls into a calf that can inherit or mutate traits.',
      'Bulls resting in your pen earn passive gold over time — hit Collect.',
    ],
  },
  {
    id: 'wallet',
    title: '🔐 Profile & Wallet',
    heading: 'Solana wallet',
    bullets: [
      'Connect Phantom or paste an address; it is recorded as unverified.',
      'Verify Ownership signs a challenge in Phantom, verified with Ed25519, to become linked.',
      'Your username can be changed only once.',
    ],
  },
  {
    id: 'economy',
    title: '💰 Shop & Vault',
    heading: 'Economy',
    bullets: [
      'Gear Shop: cosmetic gear with small stats; legendary items are token-gated.',
      'Gold Vault: convert Gold into $CHARGE at 100 gold to 1 token, with 5% burned.',
    ],
  },
]

const selected = ref<GuideSection>(SECTIONS[0])

function select(section: GuideSection): void {
  selected.value = section
}
</script>

<template>
  <OverlayShell title="Guide" :subtitle="selected.title">
    <div class="guide">
      <nav class="guide__nav">
        <button
          v-for="section in SECTIONS"
          :key="section.id"
          type="button"
          class="guide__tab"
          :class="{ 'is-active': section.id === selected.id }"
          @click="select(section)"
        >
          {{ section.title }}
        </button>
      </nav>
      <article class="guide__body">
        <h3>{{ selected.heading }}</h3>
        <p v-if="selected.intro">{{ selected.intro }}</p>
        <ul>
          <li v-for="(line, index) in selected.bullets" :key="index">{{ line }}</li>
        </ul>
      </article>
    </div>
  </OverlayShell>
</template>

<style scoped>
.guide {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 1rem;
}

.guide__nav {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 340px;
  overflow-y: auto;
}

.guide__tab {
  text-align: left;
  padding: 0.45rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.74rem;
  cursor: pointer;
}

.guide__tab:hover {
  color: var(--color-text);
}

.guide__tab.is-active {
  border-color: var(--color-accent);
  background: rgba(229, 72, 77, 0.12);
  color: var(--color-text);
}

.guide__body h3 {
  margin: 0 0 0.6rem;
  font-size: 1rem;
}

.guide__body p {
  margin: 0 0 0.7rem;
  font-size: 0.84rem;
  color: var(--color-text-muted);
}

.guide__body ul {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.guide__body li {
  font-size: 0.82rem;
  line-height: 1.4;
}
</style>

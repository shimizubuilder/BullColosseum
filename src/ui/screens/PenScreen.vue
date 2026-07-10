<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useFarmStore } from '@/stores/useFarmStore'
import { useQuestStore } from '@/stores/useQuestStore'
import { calfCost, farmRatePerHour, plotPrice } from '@/domain/economy'
import { ELEMENTS } from '@/domain/config/elements'
import OverlayShell from '@/ui/components/OverlayShell.vue'
import CurrencyAmount from '@/ui/components/CurrencyAmount.vue'

const player = usePlayerStore()
const farm = useFarmStore()
const quest = useQuestStore()

const plotIndex = computed(() => farm.selectedPlot)
const info = computed(() => (plotIndex.value != null ? farm.farmsByPlot[plotIndex.value] : undefined))
const ownPlot = computed(() => player.player?.farm.plotIndex ?? null)
const isMine = computed(() => info.value?.mine ?? false)
const isEmpty = computed(() => !info.value)

const gold = computed(() => player.player?.currency.gold ?? 0)
const capacity = computed(() => player.player?.farm.capacity ?? 2)
const storedBulls = computed(() => player.player?.storedBulls ?? [])
const roster = computed(() => (player.player ? [player.player.activeBull, ...player.player.storedBulls] : []))
const ratePerHour = computed(() => farmRatePerHour(storedBulls.value))
const penFull = computed(() => storedBulls.value.length >= capacity.value)

const firstParent = ref(0)
const secondParent = ref(1)
const message = ref('')

const calfPrice = calfCost()
const penPrice = plotPrice()

function elementName(element: string): string {
  return ELEMENTS[element as keyof typeof ELEMENTS]?.name ?? element
}

async function refresh(): Promise<void> {
  await farm.load()
}

async function buy(): Promise<void> {
  if (plotIndex.value == null) {
    return
  }
  if (player.buyPlot(plotIndex.value)) {
    message.value = 'Pen purchased! Bulls resting here earn passive gold.'
    await refresh()
  } else {
    message.value = 'Cannot buy this pen.'
  }
}

async function collect(): Promise<void> {
  const earned = player.collectFarm()
  if (earned > 0) {
    quest.progress('collect', 1)
  }
  message.value = earned > 0 ? `Collected ${earned} gold.` : 'Nothing to collect yet.'
  await refresh()
}

async function buyCalf(): Promise<void> {
  message.value = player.buyCalf() ? 'A calf joined your pen.' : 'Cannot buy a calf (pen full or low gold).'
  await refresh()
}

async function breed(): Promise<void> {
  const calf = player.breed(firstParent.value, secondParent.value)
  if (calf) {
    quest.progress('breed', 1)
  }
  message.value = calf ? `Bred a ${calf.mythic ? 'MYTHIC ' : ''}calf with ${calf.traits.length} trait(s).` : 'Cannot breed (pick two bulls, need room and gold).'
  await refresh()
}
</script>

<template>
  <OverlayShell title="Bull Pen" :subtitle="plotIndex != null ? `Plot #${plotIndex + 1}` : ''">
    <div class="pen">
      <div v-if="isEmpty && ownPlot === null" class="pen__buy">
        <p>An empty pen. Buy it to rest and breed bulls that earn passive gold.</p>
        <button class="btn btn--primary" type="button" :disabled="gold < penPrice" @click="buy">
          Buy pen · <CurrencyAmount kind="gold" :amount="penPrice" />
        </button>
      </div>

      <p v-else-if="isEmpty" class="pen__note">You already own pen #{{ (ownPlot ?? 0) + 1 }}. One pen per handler.</p>

      <p v-else-if="!isMine" class="pen__note">Owned by <b>{{ info?.username }}</b> · {{ info?.bulls }} bull(s).</p>

      <template v-else>
        <div class="pen__stat">
          <span>Capacity {{ storedBulls.length }}/{{ capacity }}</span>
          <span class="pen__rate">Earning <CurrencyAmount kind="gold" :amount="ratePerHour" />/h · up to 8h</span>
        </div>

        <ul class="roster">
          <li v-for="(bull, index) in roster" :key="index" class="roster__row">
            <span class="roster__dot" :style="{ background: ELEMENTS[bull.element].primaryColor }" />
            <b>{{ bull.name }}</b>
            <small>{{ elementName(bull.element) }} · Lv {{ bull.level }}{{ index === 0 ? ' · active' : '' }}</small>
          </li>
        </ul>

        <button class="btn btn--ok" type="button" @click="collect">Collect earnings</button>
        <button class="btn" type="button" :disabled="penFull || gold < calfPrice" @click="buyCalf">
          Buy calf · <CurrencyAmount kind="gold" :amount="calfPrice" />
        </button>

        <div class="breed">
          <div class="breed__row">
            <select v-model.number="firstParent" class="breed__select">
              <option v-for="(bull, index) in roster" :key="index" :value="index">{{ bull.name }}</option>
            </select>
            <span>×</span>
            <select v-model.number="secondParent" class="breed__select">
              <option v-for="(bull, index) in roster" :key="index" :value="index">{{ bull.name }}</option>
            </select>
          </div>
          <button
            class="btn btn--primary"
            type="button"
            :disabled="penFull || gold < calfPrice || firstParent === secondParent || roster.length < 2"
            @click="breed"
          >
            Breed · <CurrencyAmount kind="gold" :amount="calfPrice" />
          </button>
        </div>
      </template>

      <p v-if="message" class="pen__message">{{ message }}</p>
    </div>
  </OverlayShell>
</template>

<style scoped>
.pen {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.pen__note,
.pen__buy p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.pen__stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.pen__rate {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.roster {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.roster__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: rgba(10, 13, 17, 0.5);
  font-size: 0.82rem;
}

.roster__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.roster__row small {
  margin-left: auto;
  color: var(--color-text-muted);
  font-size: 0.72rem;
}

.breed {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.breed__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breed__select {
  flex: 1;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: rgba(10, 13, 17, 0.6);
  color: var(--color-text);
  padding: 0 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  height: 42px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: rgba(10, 13, 17, 0.6);
  color: var(--color-text);
  font-weight: 700;
  cursor: pointer;
}

@media (hover: hover) {
  .btn:hover:not(:disabled) {
    border-color: var(--color-accent);
  }
}

.btn:active:not(:disabled) {
  border-color: var(--color-accent);
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn--primary {
  border: none;
  background: linear-gradient(180deg, var(--color-accent-strong), var(--color-accent));
  color: #fff;
}

.btn--primary:active:not(:disabled) {
  filter: brightness(0.94);
}

.btn--ok {
  border-color: rgba(64, 200, 128, 0.5);
  color: var(--color-success);
}

.pen__message {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-accent);
}
</style>

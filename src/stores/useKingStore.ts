import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ELEMENT_IDS, type ElementId } from '@/domain/config/elements'
import type { TraitId } from '@/domain/config/traits'
import { KING } from '@/domain/config/balance'
import { kingBounty, kingHoldSeconds, type KingBull, type KingState } from '@/domain/combat/king'
import { pickFrom } from '@/domain/rng'
import * as kingApi from '@/services/api/kingApi'
import type { KingBullDto, KingDto } from '@/services/dto/king.dto'
import { useSessionStore } from './useSessionStore'

const BOT_KING_NAMES = ['Charger_Prime', 'SolBull', 'BlackHoofKing']

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

function bullFromDto(dto: KingBullDto | undefined): KingBull {
  const element = (dto?.elem ?? 'shadow') as ElementId
  return {
    element: ELEMENT_IDS.includes(element) ? element : 'shadow',
    level: Number(dto?.lv ?? 0),
    traits: (dto?.traits ?? []) as TraitId[],
    mythic: Boolean(dto?.mythic),
  }
}

function bullToDto(bull: KingBull): KingBullDto {
  return { elem: bull.element, lv: bull.level, traits: bull.traits, mythic: bull.mythic ? 1 : 0 }
}

export interface BecomeKingInput {
  useServer: boolean
  token: string
  tier: number
  bull: KingBull
  username: string
  avatar: string
}

export const useKingStore = defineStore('king', () => {
  const session = useSessionStore()
  const state = ref<KingState | null>(null)
  const now = ref(nowSeconds())
  const loading = ref(false)

  const isMine = computed(() => state.value?.mine ?? false)
  const bounty = computed(() => (state.value ? kingBounty(state.value.since, now.value) : 0))
  const holdSeconds = computed(() => (state.value ? kingHoldSeconds(state.value.since, now.value) : 0))

  function applyServerKing(dto: KingDto | null, serverNow: number, selfName: string): void {
    now.value = serverNow
    state.value = dto
      ? {
          username: dto.username,
          avatar: dto.avatar,
          tier: dto.tier,
          since: dto.since,
          bull: bullFromDto(dto.bull),
          mine: dto.username === selfName,
        }
      : null
  }

  function seedBotKing(): void {
    if (state.value) {
      return
    }
    now.value = nowSeconds()
    state.value = {
      username: pickFrom(Math.random, BOT_KING_NAMES),
      avatar: 'shadow',
      tier: KING.botTier,
      since: now.value - KING.botHoldSeconds,
      bull: { element: 'shadow', level: KING.botLevel, traits: ['alpha'], mythic: false },
      mine: false,
    }
  }

  function crownLocal(username: string, avatar: string, tier: number, bull: KingBull): void {
    now.value = nowSeconds()
    state.value = { username, avatar, tier, since: now.value, bull, mine: true }
  }

  async function refresh(selfName: string): Promise<void> {
    loading.value = true
    if (session.online) {
      const result = await kingApi.fetchKing()
      if (result.status === 'ok' && result.data.ok) {
        applyServerKing(result.data.king, result.data.now, selfName)
        loading.value = false
        return
      }
    }
    seedBotKing()
    loading.value = false
  }

  async function becomeKing(input: BecomeKingInput): Promise<void> {
    if (input.useServer) {
      const result = await kingApi.challengeKing({
        action: 'challenge',
        token: input.token,
        won: 1,
        tier: input.tier,
        bull: bullToDto(input.bull),
      })
      if (result.status === 'ok' && result.data.ok && result.data.king) {
        applyServerKing(result.data.king, result.data.now, input.username)
        return
      }
    }
    crownLocal(input.username, input.avatar, input.tier, input.bull)
  }

  return {
    state,
    now,
    loading,
    isMine,
    bounty,
    holdSeconds,
    refresh,
    becomeKing,
    applyServerKing,
    seedBotKing,
    crownLocal,
  }
})

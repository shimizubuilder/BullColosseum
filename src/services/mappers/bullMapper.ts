import type { Bull } from '@/domain/models/bull'
import type { ElementId } from '@/domain/config/elements'
import type { GearId } from '@/domain/config/gear'
import type { TraitId } from '@/domain/config/traits'
import { ELEMENT_IDS } from '@/domain/config/elements'
import { tierOf } from '@/domain/progression'
import type { BullDto, StoredBullDto } from '@/services/dto/player.dto'

const DEFAULT_ELEMENT: ElementId = 'fire'

function toElement(value: unknown): ElementId {
  return (ELEMENT_IDS as string[]).includes(value as string) ? (value as ElementId) : DEFAULT_ELEMENT
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function toLevel(value: unknown): number {
  return Math.max(1, Math.trunc(Number(value) || 1))
}

function toCount(value: unknown): number {
  return Math.max(0, Math.trunc(Number(value) || 0))
}

export function bullFromDto(dto: BullDto): Bull {
  return {
    name: dto.name,
    element: toElement(dto.element),
    level: toLevel(dto.level),
    xp: toCount(dto.xp),
    gear: toStringArray(dto.gear) as GearId[],
    traits: toStringArray(dto.traits) as TraitId[],
    mythic: Boolean(dto.mythic),
  }
}

export function bullFromStoredDto(dto: StoredBullDto): Bull {
  return {
    name: dto.name ?? 'Calf',
    element: toElement(dto.element ?? dto.elem),
    level: toLevel(dto.level ?? dto.lv),
    xp: toCount(dto.xp),
    gear: toStringArray(dto.gear) as GearId[],
    traits: toStringArray(dto.traits) as TraitId[],
    mythic: Boolean(dto.mythic),
  }
}

export function bullToPayload(bull: Bull): BullDto {
  return {
    name: bull.name,
    element: bull.element,
    level: bull.level,
    xp: bull.xp,
    tier: tierOf(bull.level),
    gear: bull.gear,
    traits: bull.traits,
    mythic: bull.mythic ? 1 : 0,
  }
}

export function bullToStoredPayload(bull: Bull): StoredBullDto {
  return {
    name: bull.name,
    element: bull.element,
    level: bull.level,
    xp: bull.xp,
    gear: bull.gear,
    traits: bull.traits,
    mythic: bull.mythic ? 1 : 0,
  }
}

import type { ElementId } from '@/domain/config/elements'
import type { GearId } from '@/domain/config/gear'
import type { TraitId } from '@/domain/config/traits'

export interface Bull {
  name: string
  element: ElementId
  level: number
  xp: number
  gear: GearId[]
  traits: TraitId[]
  mythic: boolean
}

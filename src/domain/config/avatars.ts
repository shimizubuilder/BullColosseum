export type AvatarId = 'ansem' | 'red' | 'gold' | 'bolt' | 'shadow'

export interface AvatarDefinition {
  id: AvatarId
  name: string
  outfit: string
  cap: string
  skin: string
}

export const AVATARS: Record<AvatarId, AvatarDefinition> = {
  ansem: { id: 'ansem', name: 'Ansem', outfit: '#7b3fe4', cap: '#141018', skin: '#e8b98c' },
  red: { id: 'red', name: 'Crimson', outfit: '#e23b47', cap: '#3a0d13', skin: '#e8b98c' },
  gold: { id: 'gold', name: 'Golden', outfit: '#e0a92a', cap: '#5a3d0d', skin: '#e8b98c' },
  bolt: { id: 'bolt', name: 'Volt', outfit: '#2aa8e0', cap: '#0d2a3a', skin: '#e8b98c' },
  shadow: { id: 'shadow', name: 'Umbra', outfit: '#6a3fb0', cap: '#1a0d2a', skin: '#d8c0a0' },
}

export const AVATAR_IDS: AvatarId[] = ['ansem', 'red', 'gold', 'bolt', 'shadow']

import * as farmApi from '@/services/api/farmApi'

export interface FarmInfo {
  username: string
  avatar: string
  capacity: number
  bulls: number
  mine: boolean
}

export interface OwnFarm {
  plotIndex: number | null
  username: string
  avatar: string
  capacity: number
  bullsInPen: number
}

export async function fetchFarms(own: OwnFarm, online: boolean): Promise<Record<number, FarmInfo>> {
  const farms: Record<number, FarmInfo> = {}
  if (own.plotIndex != null) {
    farms[own.plotIndex] = {
      username: own.username,
      avatar: own.avatar,
      capacity: own.capacity,
      bulls: own.bullsInPen,
      mine: true,
    }
  }
  if (online) {
    const result = await farmApi.listFarms()
    if (result.status === 'ok' && result.data.ok && result.data.farms) {
      for (const farm of result.data.farms) {
        if (farm.plot === own.plotIndex) {
          continue
        }
        farms[farm.plot] = {
          username: farm.username,
          avatar: farm.avatar,
          capacity: farm.capacity,
          bulls: farm.bulls,
          mine: false,
        }
      }
    }
  }
  return farms
}

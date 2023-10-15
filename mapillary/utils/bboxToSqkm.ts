import * as turf from '@turf/turf'

export const bboxToSqkm = (polygon: ReturnType<typeof turf.polygon>) => {
  const sqm = turf.area(polygon.geometry)
  const sqkm = turf.convertArea(sqm, 'meters', 'kilometers')
  return Number(sqkm.toFixed(3))
}

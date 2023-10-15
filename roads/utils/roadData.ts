import * as turf from '@turf/turf'
import { bufferByRoadClass } from './buffer.const'
import { reducePolygonPrecision } from './reducePolygonPrecision'
import { z } from 'zod'
import { overpassGeoJson } from '../roads'

const lineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(z.tuple([z.number(), z.number()])),
})

export function roadData(road: (typeof overpassGeoJson)['features'][number]) {
  const radiusByRoadClass = bufferByRoadClass.get(road.properties!.highway) || 14
  const buffer = turf.buffer(road, radiusByRoadClass, { units: 'meters' })

  // In Order to make TS happy we guard that all input is a lineString
  const lineString = lineStringSchema.parse(road.geometry)

  return turf.lineString(lineString.coordinates, {
    id: String(road.id),
    highway: String(road.properties!.highway),
    length: Number(turf.length(road, { units: 'meters' }).toFixed(2)),
    bufferGeometry: reducePolygonPrecision(buffer.geometry),
  })
}

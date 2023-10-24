import * as turf from '@turf/turf'
import osmtogeojson from 'osmtogeojson'
import { overpassQuery } from './utils/overpassQuery.const'
import { bufferedRoads, overpassRoads, roadsFile } from './utils/files'
import { roadData } from './utils/roadData'

const apiUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`

console.log('START', 'Starting', import.meta.file)
console.log('NEXT', 'Download', decodeURIComponent(apiUrl))

const response = await fetch(apiUrl)
if (!response.ok) {
  throw new Error(
    `Failed to fetch data from Overpass API: ${response.status} ${response.statusText}`,
  )
}

const rawOverpassData = await response.json()
export const overpassGeoJson = osmtogeojson(rawOverpassData)

const preparedRoads = []
for (const road of overpassGeoJson.features) {
  preparedRoads.push(roadData(road))
}

console.log('INFO', 'Write', roadsFile, 'with', preparedRoads.length, 'items')
Bun.write(roadsFile, JSON.stringify(turf.featureCollection(preparedRoads), undefined, 2))

console.log('INFO', 'Write', overpassRoads)
Bun.write(overpassRoads, JSON.stringify(overpassGeoJson, undefined, 2))

console.log('INFO', 'Write', bufferedRoads)
// Hacky: We just overwrite the existing object to store it for debugging…
for (const road of preparedRoads as any) {
  road.geometry = road.properties.bufferGeometry
  delete road.properties.bufferGeometry
}
Bun.write(bufferedRoads, JSON.stringify(turf.featureCollection(preparedRoads), undefined, 2))

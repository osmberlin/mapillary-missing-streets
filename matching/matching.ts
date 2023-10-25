import * as turf from '@turf/turf'
import { picturesFile } from '../mapillary/utils/files'
import { pictureFeature } from '../mapillary/utils/pictureFeatures'
import { roadsFile } from '../roads/utils/files'
import { roadData } from '../roads/utils/roadData'
import { matchedRoadsFile, matchingDebuggingRoadsFile } from './utils/files'

console.log('START', 'Starting', import.meta.file)

const roadsBunFile = Bun.file(roadsFile)
const roadsFeatures: ReturnType<typeof roadData>[] = (await roadsBunFile.json()).features

const imagesBunFile = Bun.file(picturesFile)
const imageFileLines = await imagesBunFile.text()
// points are stored as .geojsonl. We have to split by lines, then parse each line / feature.
const imagesFeatures = imageFileLines
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l) as ReturnType<typeof pictureFeature>)

// Prepare the calcuation to deside if a road has enough images to be fully caputres
const speedKmh = 18 // Average speed when capturing images
const speedMeterPerHour = speedKmh * 1_000
const secodsPerHour = 1 * 60 * 60
const speedMeterPerSecond = speedMeterPerHour / secodsPerHour
const secondsPerImage = 2 // Minimum frequency for GoPro Max
const distanceBetweenImages = speedMeterPerSecond * secondsPerImage
console.log('INFO', { speedKmh, distanceBetweenImages })

const matchedRoads = []
const matchedRoadsForDebugging = []

console.log('INFO', 'Iterate over each road segement and find matching images')
for (const road of roadsFeatures) {
  const pointsWithinRoad = []
  for (const point of imagesFeatures) {
    if (turf.booleanPointInPolygon(point.geometry.coordinates, road.properties.bufferGeometry)) {
      pointsWithinRoad.push(point)
    }
  }

  const allPics = pointsWithinRoad.length
  const panoPics = pointsWithinRoad.filter((p) => p.properties.pano).length
  const freshPics = pointsWithinRoad.filter((p) => p.properties.fresh).length
  const freshPanoPics = pointsWithinRoad.filter(
    (p) => p.properties.fresh && p.properties.pano,
  ).length

  const requiredImagesToConsiderRoadComplete = road.properties.length / distanceBetweenImages

  const matchedRoadForDebugging = turf.lineString(road.geometry.coordinates, {
    id: road.properties.id,
    debugUrl: `https://osm.org/${road.properties.id}`,
    allPics,
    panoPics,
    freshPics,
    freshPanoPics,
    requiredImagesToConsiderRoadComplete,
    length: road.properties.length,
    complete: allPics >= requiredImagesToConsiderRoadComplete,
    completePano: panoPics >= requiredImagesToConsiderRoadComplete,
    completeFresh: freshPics >= requiredImagesToConsiderRoadComplete,
    completeFreshPano: freshPanoPics >= requiredImagesToConsiderRoadComplete,
  })
  matchedRoadsForDebugging.push(matchedRoadForDebugging)

  const matchedRoad = turf.lineString(road.geometry.coordinates, {
    id: road.properties.id,
    complete: allPics >= requiredImagesToConsiderRoadComplete,
    completePano: panoPics >= requiredImagesToConsiderRoadComplete,
    completeFresh: freshPics >= requiredImagesToConsiderRoadComplete,
    completeFreshPano: freshPanoPics >= requiredImagesToConsiderRoadComplete,
  })
  matchedRoads.push(matchedRoad)
}

console.log('INFO', 'Write', matchedRoadsFile, 'with', matchedRoads.length, 'items')
Bun.write(matchedRoadsFile, JSON.stringify(turf.featureCollection(matchedRoads), undefined, 2))

console.log('INFO', 'Write', matchingDebuggingRoadsFile)
Bun.write(
  matchingDebuggingRoadsFile,
  JSON.stringify(turf.featureCollection(matchedRoadsForDebugging), undefined, 2),
)

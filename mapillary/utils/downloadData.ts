import * as turf from '@turf/turf'
import { formatISO } from 'date-fns'
import { Feature, GeoJsonProperties, Polygon } from 'geojson'
import { MAPILARY_API_LIMIT } from './apiUrl'
import { bboxToSqkm } from './bboxToSqkm'
import { createGrid } from './createGrid'
import { downloadAndValidate } from './downloadAndValidate'
import {
  debugPicturesWriter,
  debugSquaresWriter,
  picturesWriter,
  resumeApiErrorsWriter,
} from './files'
import { lineFromObject } from './lineFromObject'
import { debuggingPictureFeature, pictureFeature } from './pictureFeatures'

export type Square = Feature<Polygon, GeoJsonProperties & { cellSplit: number }>
export async function downloadData(square: Square, fromDate: string) {
  const validatedData = await downloadAndValidate(square, fromDate)
  resumeApiErrorsWriter.flush()
  if (!validatedData) return

  // Debugging: Store the used grid square
  debugSquaresWriter.write(
    lineFromObject(
      turf.polygon(square.geometry.coordinates, {
        pictureCount: validatedData.length,
        cellSplit: square.properties.cellSplit,
        cellSqkm: bboxToSqkm(square),
        fromDate,
        toDate: formatISO(new Date()),
      }),
    ),
  )
  debugSquaresWriter.flush()

  // Check if the total number of "data" array entries is below 2,000
  if (validatedData.length < MAPILARY_API_LIMIT) {
    console.log('NEXT', 'Handle data')

    for (const apiPicture of validatedData) {
      // Debugging: Store the raw api data as GeoJson Point
      debugPicturesWriter.write(lineFromObject(debuggingPictureFeature(apiPicture)))

      // :tada: The real data that we are looking for, processed just as we need it
      picturesWriter.write(lineFromObject(pictureFeature(apiPicture)))
    }

    // Writer: Store all the changes we cached using .write to disc
    debugPicturesWriter.flush()
    picturesWriter.flush()
    return
  }
  console.log(
    'NEXT',
    'Result incomplete, splitting in Subgrid',
    `(>=${MAPILARY_API_LIMIT} items which is the api limit)`,
  )

  // Split the bbox into 4 sub-squares
  const cellSplit = square.properties.cellSplit / 2
  const bbox = turf.bbox(square)
  const subSquares = createGrid(bbox, cellSplit)

  // Process the data for each sub-square
  for (const subSquare of subSquares) {
    await downloadData(subSquare, fromDate)
  }
}

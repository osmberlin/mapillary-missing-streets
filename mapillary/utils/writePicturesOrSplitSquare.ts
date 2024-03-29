import * as turf from '@turf/turf'
import { formatISO } from 'date-fns'
import { Feature, GeoJsonProperties, Polygon } from 'geojson'
import { MAPILARY_API_LIMIT } from './apiUrl'
import { bboxToSqkm } from './bboxToSqkm'
import { consoleLogProgress } from './consoleLogProgress'
import { createGrid } from './createGrid'
import { downloadValidateOrLogError } from './downloadValidateOrLogError'
import {
  debugPicturesWriter,
  debugSquaresWriter,
  picturesWriter,
  retryApiErrorsWriter,
} from './files'
import { lineFromObject } from './lineFromObject'
import { debuggingPictureFeature, pictureFeature } from './pictureFeatures'

export type Square = Feature<Polygon, GeoJsonProperties & { cellSplit: number }>
export async function writePicturesOrSplitSquare(
  validatedData: Awaited<ReturnType<typeof downloadValidateOrLogError>>,
  square: Square,
  fromDate: string,
) {
  retryApiErrorsWriter.flush()
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
  const subGrid = createGrid(bbox, cellSplit)

  // Process the data for each sub-square
  for (const [index, subSquare] of subGrid.entries()) {
    consoleLogProgress(index, subGrid.length)
    const validatedData = await downloadValidateOrLogError(square, fromDate)
    await writePicturesOrSplitSquare(validatedData, subSquare, fromDate)
  }
}

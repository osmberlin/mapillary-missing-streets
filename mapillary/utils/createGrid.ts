import * as turf from '@turf/turf'
import { Bbox } from './types'

export const createGrid = (bbox: Bbox, cellSplit?: number) => {
  // For mapillary.ts and update.ts we take the same default.
  // Only when we hit the api limit in `downloadData` do we provide a custom, smaller split
  cellSplit = cellSplit || 0.5

  return turf.squareGrid(bbox, cellSplit, {
    units: 'kilometers',
    properties: { cellSplit },
  }).features
}

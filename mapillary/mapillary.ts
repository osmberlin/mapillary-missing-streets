import * as turf from '@turf/turf'
import { inputBbox } from '../config.const'
import { downloadData } from './utils/downloadData'

console.log('START', 'Starting', import.meta.dir)

// Create the outer grid of squares
const initialCellSplit = 0.5
const grid = turf.squareGrid(inputBbox, initialCellSplit, {
  units: 'kilometers',
  properties: { cellSplit: initialCellSplit },
}).features

// Download the data for each square in the grid
// `downloadData` will split the grid smaller until the API
// returns all results of a grid square
for (const square of grid) {
  await downloadData(square)
}

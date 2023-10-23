import { inputBbox, picturesNewerThanDate } from '../config.const'
import { consoleLogProgress } from './utils/consoleLogProgress'
import { createGrid } from './utils/createGrid'
import { downloadData } from './utils/downloadData'
import { logRuns } from './utils/logRuns'

console.log('START', 'Starting', import.meta.file)

await logRuns(picturesNewerThanDate)

// Create the outer grid of squares
const grid = createGrid(inputBbox)

// Download the data for each square in the grid
// `downloadData` will split the grid smaller until the API
// returns all results of a grid square
for (const [index, square] of grid.entries()) {
  consoleLogProgress(index, grid.length)
  await downloadData(square, picturesNewerThanDate)
}

import * as turf from '@turf/turf'
import { ResumeApiError } from './utils/downloadAndValidate'
import { debugSquaresBunFile, retryApiErrorsBunFile, retryApiErrorsWriter } from './utils/files'
import { lineFromObject } from './utils/lineFromObject'

// Helper file when the retry needs to run multiple times.
// Right now the retry log is not update after a line was written.
// Right now we cannot re run the retry multiple times.
// This helper removes all retry lines that already have squares.
// Afterwards its save to re-run the retry.

const rawFileContent = await retryApiErrorsBunFile.text()
const lines = rawFileContent
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    let data = undefined
    try {
      data = JSON.parse(line) as ResumeApiError
    } catch (error) {
      console.error(error, line)
    }
    return data
  })
  .filter(Boolean)

const rawSquareContent = await debugSquaresBunFile.text()
const squares = rawSquareContent
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line) as ReturnType<typeof turf.polygon<{ cellSplit: number }>>)

const filteredLines = lines.filter((line, index) => {
  // Remove all lines that already have a square
  const lineBbox = JSON.stringify(line.bbox)
  const hasMatchingSquare = squares.some((square) => JSON.stringify(turf.bbox(square)) === lineBbox)
  return !hasMatchingSquare
})

console.log(lines.length, 'vs', filteredLines.length)

for (const line of filteredLines) {
  retryApiErrorsWriter.write(lineFromObject(line))
}

retryApiErrorsWriter.end()

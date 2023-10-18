import { endOfDay, formatISO, parseISO, sub } from 'date-fns'
import { inputBbox } from '../config.const'
import { downloadData } from './utils/downloadData'
import {
  debugPicturesBunFile,
  debugPicturesWriter,
  debugSquaresWriter,
  picturesBunFile,
  picturesWriter,
  resumeApiErrorsWriter,
  runLogBunFile,
} from './utils/files'
import { LogRun, logRuns } from './utils/logRuns'
import { createGrid } from './utils/createGrid'
import { lineFromObject } from './utils/lineFromObject'

console.log('START', 'Starting', import.meta.file)

// Find log entries for our inputBbox
const rawLog = await runLogBunFile.text()
const log: LogRun[] = rawLog
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line))
const logForBbox = log
  // Reminder: Comparing arrays need a string-workaround…
  .filter((entry) => JSON.stringify(entry.inputBbox) === JSON.stringify(inputBbox))
  // Make sure the newest `toDate` is the first entry
  .sort((a, b) => new Date(b.toDate).getTime() - new Date(a.toDate).getTime())

if (!logForBbox.length) {
  console.error(
    'ERROR',
    'Could not find any previous runs.',
    'Please run `npm run mapillary` first.',
  )
} else {
  const lastRun = logForBbox[0]
  console.log('NEXT', 'Starting the update run')

  const updateFromDate = formatISO(endOfDay(sub(parseISO(lastRun.toDate), { weeks: 2 })))
  await logRuns(updateFromDate)

  // First, lets store what we have
  debugPicturesWriter.write(`${await debugPicturesBunFile.text()}\n\n\n`)
  picturesWriter.write(`${await picturesBunFile.text()}\n\n\n`)
  debugPicturesWriter.flush()
  picturesWriter.flush()

  console.log('NEXT', 'New from date', updateFromDate)

  const grid = createGrid(lastRun.inputBbox)
  for (const square of grid) {
    await downloadData(square, updateFromDate)
  }
}

console.log('INFO', 'Close all file writers')
debugSquaresWriter.end()
debugPicturesWriter.end()
picturesWriter.end()
resumeApiErrorsWriter.end()

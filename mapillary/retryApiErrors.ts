import { isSameDay, parseISO } from 'date-fns'
import { consoleLogProgress } from './utils/consoleLogProgress'
import { ResumeApiError, downloadValidateOrLogError } from './utils/downloadValidateOrLogError'
import {
  debugPicturesBunFile,
  debugPicturesWriter,
  debugSquaresBunFile,
  debugSquaresWriter,
  picturesBunFile,
  picturesWriter,
  retryApiErrorsBunFile,
  retryApiErrorsWriter,
} from './utils/files'
import { writePicturesOrSplitSquare } from './utils/writePicturesOrSplitSquare'

console.log('START', 'Starting', import.meta.file)

// The retry should append to the existing files
// Bun has no native append to files, so we first write the previous file…
debugSquaresWriter.write(`${await debugSquaresBunFile.text()}\n\n\n`)
debugPicturesWriter.write(`${await debugPicturesBunFile.text()}\n\n\n`)
picturesWriter.write(`${await picturesBunFile.text()}\n\n\n`)

// We work on the api errors one line at a time
const rawFileContent = await retryApiErrorsBunFile.text()

// Handle each error line separately
// If successfull, we remove it…
const lines = rawFileContent.split('\n').filter(Boolean)
for (const [index, line] of lines.entries()) {
  consoleLogProgress(index, lines.length)
  try {
    const json = JSON.parse(line) as ResumeApiError
    const validatedData = await downloadValidateOrLogError(json.square, json.fromDate)
    await writePicturesOrSplitSquare(validatedData, json.square, json.fromDate)

    // Some some helpful note when dates missmatch
    {
      const currentToDate = new Date()
      const loggedToDate = parseISO(json.fromDate)
      if (isSameDay(currentToDate, loggedToDate)) {
        console.log(
          'INFO',
          'Remember that we used the `fromDate` stored in the logs but fetch all the latest pictures. Those dates do not match, which means your data is out of sync. Run an update to smooth this over.',
          { currentToDate, loggedToDate },
        )
        // Also note: We do not call logRuns() in this file because those re-runs are considered part of the inital or update run. We do not want to reset the timer by calling logRuns().
      }
    }
  } catch (error) {
    console.error('ERROR', error, 'with line', line)
    console.error('WARN', 'This error will not be logged. It will only show up here.')
    continue
  }
}

console.log('INFO', 'Close all file writers')
debugSquaresWriter.end()
debugPicturesWriter.end()
picturesWriter.end()
retryApiErrorsWriter.end()

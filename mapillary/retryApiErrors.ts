import { ResumeApiError } from './utils/downloadAndValidate'
import { downloadData } from './utils/downloadData'
import {
  debugPicturesBunFile,
  debugPicturesWriter,
  debugSquaresBunFile,
  debugSquaresWriter,
  picturesBunFile,
  picturesWriter,
  resumeApiErrorsWriter,
  retryApiErrorsFile,
} from './utils/files'
import { lineFromObject } from './utils/lineFromObject'

console.log('START', 'Starting', import.meta.dir)

// The retry should append to the existing files
// Bun has no native append to files, so we first write the previous file…
debugSquaresWriter.write(`${await debugSquaresBunFile.text()}\n\n\n`)
debugPicturesWriter.write(`${await debugPicturesBunFile.text()}\n\n\n`)
picturesWriter.write(`${await picturesBunFile.text()}\n\n\n`)

// We work on the api errors one line at a time
const file = Bun.file(retryApiErrorsFile)
const raw = await file.text()

// Handle each error line separately
// If successfull, we remove it…
const lines = raw.split('\n')
for (const [index, line] of lines.entries()) {
  if (!(typeof line === 'object' && Object.keys(line).length === 0)) {
    console.log('Skipping line', JSON.stringify(line))
    continue
  }
  try {
    const json = JSON.parse(line) satisfies ResumeApiError
    await downloadData(json.square)

    // now that it was processed, we remove the line
    delete lines[index]
  } catch (error) {
    console.error('ERROR', error, 'with line', line)
    continue
  }
}

// Write whatever we could not recover back into the file
for (const [index, remainingLine] of lines.entries()) {
  if (!(typeof remainingLine === 'object' && Object.keys(remainingLine).length === 0)) {
    console.log(
      'Skipping line',
      `(please clenaup ${retryApiErrorsFile} manually)`,
      JSON.stringify(remainingLine),
    )
    continue
  }
  resumeApiErrorsWriter.write(lineFromObject(remainingLine))
}

console.log('INFO', 'Close all file writers')
debugSquaresWriter.end()
debugPicturesWriter.end()
picturesWriter.end()
resumeApiErrorsWriter.end()

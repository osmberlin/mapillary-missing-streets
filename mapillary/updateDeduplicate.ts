import {
  debugPicturesBunFile,
  picturesBunFile,
  debugPicturesWriter,
  picturesWriter,
} from './utils/files'
import { lineFromObject } from './utils/lineFromObject'
import { debuggingPictureFeature, pictureFeature } from './utils/pictureFeatures'

console.log('START', 'Starting', import.meta.file)

// PART 1
console.log('INFO', 'Handle debugPicture')
{
  const rawDebugPictures = await debugPicturesBunFile.text()
  const debugPictures: ReturnType<typeof debuggingPictureFeature>[] =
    parseGeosjonL(rawDebugPictures)
  const filteredDebugPictures = removeDuplicates(debugPictures)
  console.log('INFO', 'Handle debugPicture', {
    before: debugPictures.length,
    after: filteredDebugPictures.length,
  })

  debugPicturesWriter.write(filteredDebugPictures.map((line) => lineFromObject(line)).join())
  debugPicturesWriter.end()
}

// PART 2
console.log('INFO', 'Handle pictures')
{
  const rawPictures = await picturesBunFile.text()
  const pictures: ReturnType<typeof pictureFeature>[] = parseGeosjonL(rawPictures)
  const filteredPictures = removeDuplicates(pictures)
  console.log('INFO', 'Handle pictures', {
    before: pictures.length,
    after: filteredPictures.length,
  })

  picturesWriter.write(filteredPictures.map((line) => lineFromObject(line)).join())
  picturesWriter.end()
}

// HELPER
function parseGeosjonL(input: string) {
  return input
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch (error) {
        console.log('ERROR', error)
      }
    })
    .filter(Boolean)
}

function removeDuplicates(
  input: (ReturnType<typeof debuggingPictureFeature> | ReturnType<typeof pictureFeature>)[],
) {
  return input.filter(
    (picture, index, self) => index !== self.findIndex((p) => p.id === picture.id),
  )
}

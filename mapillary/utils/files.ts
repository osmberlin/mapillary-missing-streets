// File paths
export const debugSquaresFile = './mapillary/debugging/squares.geojsonl'
export const debugPicturesFile = './mapillary/debugging/pictures.geojsonl'
export const retryApiErrorsFile = './mapillary/retryApiErrors/apiErrorLog.jsonl'
export const picturesFile = './mapillary/data/pictures.geojsonl'

// BunFile handler
export const debugSquaresBunFile = Bun.file(debugSquaresFile)
export const debugPicturesBunFile = Bun.file(debugPicturesFile)
export const resumeApiErrorsBunFile = Bun.file(retryApiErrorsFile)
export const picturesBunFile = Bun.file(picturesFile)

// Bun writer to continously .write('text')
// (Remember to add new lines manually)
export const debugSquaresWriter = debugSquaresBunFile.writer()
export const debugPicturesWriter = debugPicturesBunFile.writer()
export const resumeApiErrorsWriter = resumeApiErrorsBunFile.writer()
export const picturesWriter = picturesBunFile.writer()

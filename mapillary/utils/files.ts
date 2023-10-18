// File paths
export const debugSquaresFile = './mapillary/debugging/squares.geojsonl'
export const debugPicturesFile = './mapillary/debugging/pictures.geojsonl'
export const retryApiErrorsFile = './mapillary/retryApiErrors/apiErrorLog.jsonl'
export const picturesFile = './mapillary/data/pictures.geojsonl'
export const runLogFile = './mapillary/data/runLog.jsonl'

// BunFile handler
export const debugSquaresBunFile = Bun.file(debugSquaresFile)
export const debugPicturesBunFile = Bun.file(debugPicturesFile)
export const resumeApiErrorsBunFile = Bun.file(retryApiErrorsFile)
export const picturesBunFile = Bun.file(picturesFile)
export const runLogBunFile = Bun.file(runLogFile)

// Bun writer to continously .write('text')
// (Remember to add new lines manually)
export const debugSquaresWriter = debugSquaresBunFile.writer()
export const debugPicturesWriter = debugPicturesBunFile.writer()
export const resumeApiErrorsWriter = resumeApiErrorsBunFile.writer()
export const picturesWriter = picturesBunFile.writer()
export const runLogWriter = runLogBunFile.writer()

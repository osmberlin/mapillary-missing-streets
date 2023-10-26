// File paths
export const debugSquaresFile = './data/current/squares.geojsonl'
export const debugPicturesFile = './data/current/picturesDebuggingApiData.geojsonl'
export const retryApiErrorsFile = './data/current/apiErrorLog.jsonl'
export const picturesFile = './data/current/pictures.geojsonl'
export const runLogFile = './data/current/runLog.jsonl'

// BunFile handler
export const debugSquaresBunFile = Bun.file(debugSquaresFile)
export const debugPicturesBunFile = Bun.file(debugPicturesFile)
export const retryApiErrorsBunFile = Bun.file(retryApiErrorsFile)
export const picturesBunFile = Bun.file(picturesFile)
export const runLogBunFile = Bun.file(runLogFile)

// Bun writer to continously .write('text')
// (Remember to add new lines manually)
export const debugSquaresWriter = debugSquaresBunFile.writer()
export const debugPicturesWriter = debugPicturesBunFile.writer()
export const retryApiErrorsWriter = retryApiErrorsBunFile.writer()
export const picturesWriter = picturesBunFile.writer()
export const runLogWriter = runLogBunFile.writer()

import { matchedRoadsFile, matchedRoadsPmTilesFile } from '../matching/utils/files'

console.log('START', import.meta.file)

console.log('INFO', 'Running tippecanoe for', matchedRoadsFile)

Bun.spawnSync(
  [
    'tippecanoe',
    `--output=${matchedRoadsPmTilesFile}`,
    '--force',
    '--layer=default',
    matchedRoadsFile,
  ],
  {
    onExit(_proc, exitCode, _signalCode, error) {
      exitCode && console.log('exitCode:', exitCode)
      error && console.log('error:', error)
    },
  },
)

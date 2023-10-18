import { formatISO } from 'date-fns'
import { inputBbox } from '../../config.const'
import { runLogBunFile, runLogWriter } from './files'
import { lineFromObject } from './lineFromObject'
import { Bbox } from './types'

export type LogRun = { fromDate: string; toDate: string; inputBbox: Bbox }

export const logRuns = async (fromDate: string) => {
  // First we store what we have
  runLogWriter.write(await runLogBunFile.text())

  const log: LogRun = {
    fromDate,
    toDate: formatISO(new Date()),
    inputBbox,
  }
  console.log('INFO', 'Logging run', log)
  runLogWriter.write(lineFromObject(log))

  runLogWriter.end()
}

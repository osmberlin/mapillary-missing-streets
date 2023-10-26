import * as turf from '@turf/turf'
import { apiResponseSchema } from './apiResponseSchema'
import { apiUrl } from './apiUrl'
import { retryApiErrorsWriter } from './files'
import { lineFromObject } from './lineFromObject'
import { Bbox } from './types'
import { Square } from './writePicturesOrSplitSquare'

export type ResumeApiError = {
  errorSource: string
  responseStatus: string
  responseError: string
  url: string
  cellSplit: number
  bbox: Bbox
  fromDate: string
  square: Square
}

export const downloadValidateOrLogError = async (square: Square, fromDate: string) => {
  const bbox = turf.bbox(square)
  const url = apiUrl(bbox, fromDate)
  const cellSplit = square.properties.cellSplit

  console.log('\n', 'NEXT', 'Downloading', url)
  const response = await fetch(url)

  // Guard API Error and store to be resumed
  if (!response.ok) {
    const error: ResumeApiError = {
      errorSource: 'FECHT from Mapillary API failed',
      responseStatus: String(response.status),
      responseError: response.statusText,
      url,
      cellSplit,
      fromDate,
      bbox,
      square,
    }
    console.error('ERROR', `${error.errorSource}: ${error.responseStatus} ${error.responseError}`)
    retryApiErrorsWriter.write(lineFromObject(error))
    return
  }

  const rawData = await response.json()
  const validatedData = apiResponseSchema.safeParse(rawData)

  // Guard API Response validation Error and store to be resumed
  if (!validatedData.success) {
    const error: ResumeApiError = {
      errorSource: 'VALIDATION of Mapillary API failed (Zod)',
      responseStatus: '-',
      responseError: JSON.stringify(validatedData.error),
      url,
      cellSplit,
      fromDate,
      bbox,
      square,
    }
    console.error('ERROR', `${error.errorSource}: ${error.responseError}`)
    retryApiErrorsWriter.write(lineFromObject(error))
    return
  }

  console.log('INFO', 'Result length', validatedData.data.data.length)

  // No idea why this is two level deep in `data`…
  return validatedData.data.data
}

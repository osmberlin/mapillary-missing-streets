import * as turf from '@turf/turf'
import { resumeApiErrorsWriter } from './files'
import { Square } from './downloadData'
import { apiResponseSchema } from './apiResponseSchema'
import { apiUrl } from './apiUrl'
import { lineFromObject } from './lineFromObject'

export type ResumeApiError = {
  errorSource: string
  responseStatus: string
  responseError: string
  url: string
  cellSplit: number
  bbox: ReturnType<typeof turf.bbox>
  square: Square
}

export const downloadAndValidate = async (square: Square) => {
  const bbox = turf.bbox(square)
  const url = apiUrl(bbox)
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
      bbox,
      square,
    }
    console.error('ERROR', `${error.errorSource}: ${error.responseStatus} ${error.responseError}`)
    resumeApiErrorsWriter.write(lineFromObject(error))
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
      bbox,
      square,
    }
    console.error('ERROR', `${error.errorSource}: ${error.responseError}`)
    resumeApiErrorsWriter.write(lineFromObject(error))
    return
  }

  console.log('INFO', 'Result length', validatedData.data.data.length)

  // No idea why this is two level deep in `data`…
  return validatedData.data.data
}

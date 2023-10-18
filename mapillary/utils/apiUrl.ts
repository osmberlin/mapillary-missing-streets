import { Bbox } from './types'

// The max retured itesm in 2023-10
// https://www.mapillary.com/developer/api-documentation
export const MAPILARY_API_LIMIT = 2_000

export const apiUrl = (bbox: Bbox, picturesNewerThanDate: string) => {
  if (!process.env.MAPILLARY_API_KEY) {
    throw new Error('You need to set `MAPILLARY_API_KEY` in your .env file')
  }
  if (!picturesNewerThanDate) {
    throw new Error('Invalid `picturesNewerThanDate`')
  }

  const url = new URL('https://graph.mapillary.com/images')
  url.searchParams.append('access_token', process.env.MAPILLARY_API_KEY)
  url.searchParams.append('fields', 'id,geometry,camera_type,captured_at,sequence')
  url.searchParams.append('bbox', bbox.join(','))
  url.searchParams.append('start_captured_at', picturesNewerThanDate)
  url.searchParams.append('limit', String(MAPILARY_API_LIMIT))
  return url.toString()
}

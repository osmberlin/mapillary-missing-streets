import * as turf from '@turf/turf'
import { formatISO, isAfter, subYears } from 'date-fns'
import { consideredFreshYears } from '../../config.const'
import { apiResponseSchema } from './apiResponseSchema'

// A gib of research on the `campera_type` to learn which values are panoramic images
// This API does not just return an `is_pano=true|false`, but three values:
// - `fisheye`
//   Eg. GoPro HERO 7 – https://www.mapillary.com/app/?pKey=850264838919582&focus=photo
// - `perspective`
//   Eg. Apple iPhone XR – https://www.mapillary.com/app/?pKey=839922736882459&focus=photo
//   Eg. GoPro HERO 5 – https://www.mapillary.com/app/?pKey=2886315628248824&focus=photo
// - `spherical`
//   Eg. 360° GoPro Max – https://www.mapillary.com/app/?pKey=573820750694387&focus=photo
//   => This is, what we will treat as panoramic picture.

type Item = Zod.infer<typeof apiResponseSchema>['data'][number]
export function pictureFeature(apiPicture: Item) {
  return turf.point(apiPicture.geometry.coordinates, {
    id: apiPicture.id,
    sequence: apiPicture.sequence,
    fresh: isAfter(new Date(apiPicture.captured_at), subYears(new Date(), consideredFreshYears)),
    pano: apiPicture.camera_type === 'spherical' ? true : false,
    capturedAtIso: formatISO(apiPicture.captured_at),
  })
}

export function debuggingPictureFeature(apiPicture: Item) {
  return turf.point(apiPicture.geometry.coordinates, {
    ...apiPicture,
    debugUrl: `https://www.mapillary.com/app/?focus=photo&pKey=${apiPicture.id}`,
    geometry: undefined,
  })
}

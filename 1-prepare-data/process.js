// Run:
//  node process.ts

// https://www.npmjs.com/package/dotenv
import dotenv from 'dotenv'
dotenv.config()
// https://www.npmjs.com/package/node-fetch
import fetch from 'node-fetch'
// https://date-fns.org/v2.29.3/docs/isAfter
import { format, sub, isAfter, formatISO, endOfDay } from 'date-fns'
import fs from 'fs'
import { FILE } from 'dns'

console.log('Starting…')

// https://www.mapillary.com/developer/api-documentation#image
const BBOX = [13.4413, 52.4713, 13.4583, 52.4741]
const API_KEY = process.env.MAPILLARY_API_KEY
if (!API_KEY) throw 'process.env.MAPILLARY_API_KEY required.'
const API_LIMIT = 2_000 // max
const API_FIELDS = ['id', 'geometry', 'captured_at', 'camera_type']

// Only pull data that is junger than our threshold in month
const AGE_MONTH = 18 // 1.5 Years
const start_captured_at = formatISO(
  endOfDay(sub(new Date(), { months: AGE_MONTH }))
)

const apiUrl = new URL('https://graph.mapillary.com/images')
apiUrl.searchParams.append('access_token', API_KEY)
apiUrl.searchParams.append('bbox', BBOX.join(','))
apiUrl.searchParams.append('fields', API_FIELDS.join(','))
apiUrl.searchParams.append('limt', API_LIMIT.toString())
apiUrl.searchParams.append('start_captured_at', start_captured_at)

console.log('Fetching data with for …', { apiUrl })
const response = await fetch(apiUrl.href)
const rawData = await response.json()

const features = rawData.data.map((item) => ({
  type: 'Feature',
  geometry: item.geometry,
  properties: {
    id: item.id,
    captured_at: item.captured_at,
    captured_at_iso: formatISO(item.captured_at),
    // One of fishese, perspective, spherical
    is_pan: item.camera_type === 'spherical' ? true : false,
    debugUrl: `https://www.mapillary.com/app/?focus=photo&pKey=${item.id}`,
  },
}))

const geoJson = {
  type: 'FeatureCollection',
  config: {
    bbox: BBOX,
    age: {
      check_month: AGE_MONTH,
      start_captured_at,
    },
    api_fields: FILE,
    process_date: format(new Date(2014, 1, 11), 'yyyy-MM-dd'),
  },
  features,
}

fs.writeFile(
  './output.geojson',
  JSON.stringify(geoJson, undefined, 2),
  (err) => {
    if (err) {
      console.error(err)
    }
    console.log(`output.geojson written with ${features.length} properties`)
  }
)

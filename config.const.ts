import * as turf from '@turf/turf'
import { endOfDay, formatISO, sub } from 'date-fns'

const rixdorf = [13.442082133594909, 52.46983812263238, 13.452600180270991, 52.47440204208928]
const neukoelln = [13.398995963556473, 52.44934150399865, 13.479223225323494, 52.489736608614635]
export const inputBbox = neukoelln as ReturnType<typeof turf.bbox>

export const consideredFreshYears = 2

// In order to reduce the API traffic, we only fetch Mapillary images that where created after `maxAgeMonth`
// https://www.mapillary.com/developer/api-documentation?locale=de_DE#image
// start_captured_at - string: filter images captured after. Specify in the  format. For example: "2022-08-16T16:42:46Z"
const maxAgeMonth = 4 * 12
export const maxAgeDateIso = formatISO(endOfDay(sub(new Date(), { months: maxAgeMonth })))

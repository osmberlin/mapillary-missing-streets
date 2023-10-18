# Mapillary Missing Streets

> 📸🗺️
> Learn which [OpenStreetMap](https://www.openstreetmap.org/) (OSM) street segments need fresh/current [Mapillary](https://www.mapillary.com/app/) images. And which of those don't have 360° images, yet. The resulting road data can be used to plan your next Mapillary image capturing trip.

## How to use

1. Update the `inputBbox` in `./config.const.ts`
2. **Fetch images:**

   - First run: Use `npm run mapillary` to fetch and store the raw mapillary API output as well as the processed pictures
   - Update run: Use `npm run mapillary:update` to update a previous first run with fresh images
   - API Errors: If needed, run `npm run mapillary:retry` to retry api requests that failed

3. **Fetch roads:**
   Run `npm run roads` to fetch and prepare the road network from OpenStreetMap (Overpass)
4. **Create target data:**
   Run `npm run matching` to create the final road network which holds information in the mapillary pictures that are part of the buffer of the given road segment
5. Use `./matching/data/matchedRoads.geojson` to plan your next trip

## Concept

- We fetch all mapillary image points. We ignore images that are older than `maxAgeMonth`.
- We consider all images that are older than `consideredFreshYears` as _not_ fresh anymore.
- We match the images to the OpenStreetMap Roads by a buffer (`bufferByRoadClass`).
- A road is considered fully captures when it has enough images for it's road length, give a certain capturing time and driving speed, see `distanceBetweenImages`.
- We do this calculation for all images (that are in our image pool) and for the subset of panoramic images.
  The resulting road network can be filtered by the properties:
  ```json
  "complete": true,          // considering all fetched images
  "completePano": false,     // considering all fetched panorama images
  "completeFresh": false,    // considering all fetched images that we consider fresh
  "completeFreshPano": false // considering all fetched panorama images that we consider fresh
  ```
- Unfortunatelly the API fetching part is a bit more complex. The [Mapillary API](https://www.mapillary.com/developer/api-documentation) returns max 2,000 images. To handle this, we first split our `inputBbox` in squares and then make those squares smaller until we get a result set below 2,000 images. Then we need to handle random API errors by retrying only the failed squares.

### Retry

When fetching Mapillary API data fails, we log those issues in `./mapillary/apiErrorLog.jsonl`. Use `npm run mapillary:update` to only retry the failed areas.

### Update

When we fetch data, we store the run in `./mapillary/data/runLog.jsonl` (`inputBbox` and dates). Use `npm run mapillary:update` to add the newest images to this list.

For a given `inputBbox`, we take the date of the latest pictures. We set the new `picturesNewerThanDate` date to 14 days prior to this date to be sure to get all new images (considering processing time). Afterwards we merge the api responses and dedupliate the result.

## Development

This project was created using [Bun](https://bun.sh).

- Install dependencies `bun install`
- Check out `npm run` for a list of scripts to use

## Roadmap / Whish list

### Map

We need a map to look at this data.

### Routing

Create routes based on this data; a good starting point for this is https://pretalx.com/fossgis2022/talk/EU8RPG/.

### Split roads

Right now, we take the OSM road segments as they are. However, long roads will have issues with this approach. Ideally we would split roads somehow – eg. on relevant intersections – to get more actionable results.

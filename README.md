# mapillary-missing-streets

We want to know which OpenStreetMap street segment needs fresh images.
We can use this data to plan our next Mapillary image capturing tour.

## How to use

1. Update the `inputBbox` in `./config.const.ts`
2. Run `npm run mapillary` to fetch and store the raw mapillary API output as well as the processed pictures
3. If needed, run `npm run mapillary:retry` to retry api requests that failed
4. Run `npm run roads` to fetch and prepare the road network from OpenStreetMap (Overpass)
5. Run `npm run matching` to create the final road network which holds information in the mapillary pictures that are part of the buffer of the given road segment
6. Use `./matching/data/matchedRoads.geojson` to plan your next trip

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

## Development

This project was created using [Bun](https://bun.sh).

- Install dependencies `bun install`
- Check out `npm run` for a list of scripts to use

## Roadmap / Whish list

### Map

We need a map to look at this data.

### Resumability

What if we want to update the data for a big region? We should add a `/mapillary/resume.ts` which polls the API for a given time frame like…

- start date: time of last run minus 14 days; we need a buffer to make sure images that where uploaded but not availabe, yet are presetnt
- end date: null / today

We then need to merge the datasets, remove duplicates and append our new data.

### Routing

Create routes based on this data; a good starting point for this is https://pretalx.com/fossgis2022/talk/EU8RPG/.

### Split roads

Right now, we take the OSM road segments as they are. However, long roads will have issues with this approach. Ideally we would split roads somehow – eg. on relevant intersections – to get more actionable results.

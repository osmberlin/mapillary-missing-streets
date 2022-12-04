# Prepare Data

## TODOs

Know TODOs…

The Mapillary API only returns 2_000 items max per bbox.
To work around this, we need to "paginate" our input grid in a sub-grid and warn whenever we reach the limit.

We can probably use http://turfjs.org/docs/#squareGrid for that.
It allows an input grid + config in kilometers.

Whenever we hit the limit of 2_000, the user needs to reduce the kilometers value.

In the end, wen can merge all those grid parts into one big file again.
We should proably store the grids as files as well for easier debugging.

## Output

`./output.geojson`

## Fields

### Top level

- `bbox`: (array) Area of interest
- `age.check_month`: (number) Number of month we use do determine if `age_check` is true/false
- `age.start_captured_at`: (string<'ISO601'>) Only images after this DateTime will be returned
- `api_fields`: (array) List of fields we pull form the mapillary API
- `process_date`: (string<'yyyy-MM-dd'>) day of processing

### Per Property

- `id`: (string) Mapillary image id
- `debugUrl`: (url) Mapillary image url `https://www.mapillary.com/app/?focus=photo&pKey=${item.id}`,
- `is_pan`: (boolean) true if `spherical`, see below
- `captured_at`: (number) Mapillary date as unix time
- `captured_at_iso`: (string<'ISO601'>) Mapillary date as ISO time string

#### `campera_type`

This API does not just return an `is_pano=true|false`, but three values:

- `fisheye`
  Eg. GoPro HERO 7 – https://www.mapillary.com/app/?pKey=850264838919582&focus=photo

- `perspective`
  Eg. Apple iPhone XR – https://www.mapillary.com/app/?pKey=839922736882459&focus=photo
  Eg. GoPro HERO 5 – https://www.mapillary.com/app/?pKey=2886315628248824&focus=photo

- `spherical`
  Eg. 360° GoPro Max – https://www.mapillary.com/app/?pKey=573820750694387&focus=photo
  _=> This is, what we will treat as panoramic picture._

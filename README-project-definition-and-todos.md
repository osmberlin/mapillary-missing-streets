# About

## Context

To keep a city up to date in OSM we need a constant flow of fresh street level imagery, ideally 360° images.

Right now, it is very hard to find out which roads segments require fresh, good images.

## Goal

Calculate which road segements require fresh and good images. Prepare this data in a way that makes routes planing easy.

## Desired outcome

1. All road segements that have no images at all
1. All road segmeents that have no fresh images (1.5 years / 18 month)
1. All road segements that have no 360° images at all
1. All road segements that have no fresh 360° images

The order of this list also show the importance (1-4) of adding fresh 360° images for that road segment.

# General processing steps

## (1) Pull Mapillary Data

Goal: One file of Mapillary point cloud data for a given bbox with attributes on capture date and camera type (panorama yes/no).

### Solution 1: JavaScript API

About: The Mapillary JavaScript API gives access to the needed data but limits point to 2k per requested area. When pulling the data we need to "paginate" the input area while also respecting possible rate limits.

### Solution 2: Vector Tiles Endpoint

About: The Mapillary Vector Tiles Endpoint gives access to the needed data at zoom level 14(?). The vector tiles are paginated by design.

- The script needs to translate a given bbox to this vector tiles format
- Then transform the vector tile files to something like geojson
- Then merge the files back into one

## (2) Prepare Mapillary Data

Goal: Prepare the raw input attributes for processing, adding processed boolean attributes to each mapillary image point:

- `fresh=true|false` based on the capture date; is the image older than a given treshold (default 18 month / 1.5 years)
- `panorama=true|false` based on the camera type; is the image taken with a panorama camera (like GoPro Max)
- `fresh_and_panorama=true|false` combination of both

### Solution 1: JavaScript

TODO

## (3) Pull and prepare Road network

Goal: A network of relevant road segments that we use to check for existing Mapillary imagery. Those road segments should be suited to plan picture capture sessions. As such, a segment size from junction to junction is expected to yield good results. Since those segments align well with how we collect picutres.

The basis for the road network should include all roads that we want to check for imagery. However, exclude non relevant and separately mapped road segments.

We likely want some cleanup done on the processed road segments, like removing all that are shorter than 10 meters.

### Road network

Option 1:

This might include too many roads.

- All highways
- … excluding `access=private`
- … excluding `service=\*` for all non generic `highway=service`
- … excluding `is_sidepath=yes`
- … excluding `footway=sidewalk`
- … excluding `crossing=*`
- … MAYBE excluding `highway=path|footway|cycleway` alltogether?

Option 2:

This might exclude too many roads.

- Include `highway=primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|unclassified|living_street|pedestrian|road` only

### Solution 1: PostGIS (Extract > osmosis > osm2pgsql)

TODO: We can use the same general process that is used in https://github.com/osmberlin/osm-parking-processing.

### Solution 2: QGIS (Overpass > QGIS)

TODO: Solution 1 is a take at using Overpass+QGIS which could be improved.

## (4) Process Mapillary Data + Road Network

Goal: Find out which road segments have no / which Mapillary data by snapping the Mapillary image points to the closest road segment.

Since snapping images is alwas unreliable and Mapillary imagarey has very mixed GPS quality, we need some solution to work with roads that received images by snapping, but in fact are not (well) represented in the image data.

Possible steps:

1. Snap Mapillary image points to the closest road segment
2. This will create false positive where images get snapped to the wrong road, eg at intersections. Let's filter those cases, with a factor of segment length to image count, eg. at lest 1 image every 2 meters. Those road segments are considered "no images at all"
3. We can now count the number of Mapillary images with a given filter (see _(2)_) per road segment.

## (5) List, visualize and route result

TODO

General goals:

- Have a list of roads that need data
- Have a web map that shows the roads that need data
- Use the data for route planning, maybe with what was described in https://pretalx.com/fossgis2022/talk/EU8RPG/.

import * as turf from '@turf/turf'

// TODO: We only simplify the regular case of 'Polygon' for now…
export const reducePolygonPrecision = (
  geometry:
    | ReturnType<typeof turf.polygon>['geometry']
    | ReturnType<typeof turf.multiPolygon>['geometry'],
) => {
  switch (geometry.type) {
    case 'Polygon':
      geometry.coordinates = geometry.coordinates.map((ring) =>
        ring.map((coord) => coord.map((num) => Number(num.toFixed(7)))),
      )
      return geometry

    case 'MultiPolygon':
      return geometry
  }
}

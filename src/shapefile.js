// const { parentPort, workerData, millesime } = require('worker_threads');
// const {sourceFile, filteringFeatures} = workerData
const gdal = require('gdal-next')
const { createHash } = require('crypto')
const { fromCode } = require('./pac.js')
const { geometry: area } = require('@mapbox/geojson-area')

const IN_HECTARES = 10000
const wgs84 = gdal.SpatialReference.fromProj4('+init=epsg:4326')

function createIdFromHash(object) {
  const buffer = Buffer.from(JSON.stringify(object))
  return createHash('sha256').update(buffer).digest('hex').slice(0, 32)
}

function extractFeatures({sourceFile, filteringFeatures, millesime: MILLESIME}) {
  const filteringFeaturesPolygon = new gdal.MultiPolygon()

  filteringFeatures.forEach(feature => {
    const geometry = gdal.Geometry.fromGeoJson(feature);

    // we loop over MULTIPOLYGON children (POLYGONs), or a POLYGON directly
    // eslint-disable-next-line no-unexpected-multiline
    (geometry.name === 'MULTIPOLYGON' ? geometry.children : [geometry]).forEach(g => {
      filteringFeaturesPolygon.children.add(g);
    })
  });

  const filterGeometry = filteringFeaturesPolygon.unionCascaded()

  const features = []

  // Downsize the source dataset to match the boundaries of the filteringFeatures
  const ds = gdal.open(sourceFile, 'r')
  const layer = ds.layers.get(0)
  layer.setSpatialFilter(filterGeometry)

  const getWGS84Geometry = (function getWGS84GeometryFactory(layer) {
    return layer.srs.isSame(wgs84)
      ? (feature) => feature.getGeometry().toObject()
      : (feature) => {
        const geometry = feature.getGeometry().clone()
        geometry.transformTo(wgs84)
        return geometry.toObject()
      }
  })(layer)

  let feature = null
  /* eslint-disable-next-line no-cond-assign */
  while (feature = layer.features.next()) {
    const fields = feature.fields.toObject()
    const {BIO, bio, CODE_CULTU, codecultu} = fields
    const {SURF_ADM, MARAICHAGE, AGROFOREST, PACAGE} = fields
    const {label: LBL_CULTU, groupLabel: GRP_CULTU} = fromCode(CODE_CULTU ?? codecultu)

    const geometry = getWGS84Geometry(feature)
    const SURFACE_HA = parseFloat(area(geometry) / IN_HECTARES).toFixed(2)

    const properties = {
      // Computed fields
      MILLESIME,
      //
      BIO: parseInt(BIO ?? bio, 10),
      // Type, and labels
      CODE_CULTU: CODE_CULTU ?? codecultu,
      LBL_CULTU,
      GRP_CULTU,
      SURFACE_HA,
      // PAC fields
      SURF_ADM,
      MARAICHAGE: MARAICHAGE === '1' ? '1' : '0',
      AGROFOREST: AGROFOREST ? '1' : '0',
    }

    const privateProperties = {
      PACAGE,
      NUM_ILOT: fields.numilot ?? fields.NUM_ILOT,
      NUM_PARCEL: fields.numparcel ?? fields.NUM_PARCEL
    }

    features.push({
      type: 'Feature',
      id: createIdFromHash({ ...privateProperties }),
      geometry,
      properties
    })
  }

  return features
}

module.exports = function ({sourceFile, filteringFeatures, millesime}, done) {
  try {
    done(null, extractFeatures({sourceFile, filteringFeatures, millesime}))
  }
  catch (error) {
    done(error)
  }
}


// parentPort.close()

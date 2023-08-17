const mongoose = require('mongoose');
// var GeoJSON = require('mongoose-geojson-schema');

const featureSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Feature'],
    required: true,
  },
  geometry: {
    type: {
      type: String,
      enum: ['Polygon'], 
      required: true,
    },
    coordinates: {
      type: [[[Number]] ], 
      required: true,
    },
  },
  properties: {
    name: String
  },
});

const featureCollectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['FeatureCollection'],
    required: true,
  },
  features: [featureSchema]
});

  const polygonData = mongoose.model('GeoJSON', featureCollectionSchema) 

  module.exports = polygonData
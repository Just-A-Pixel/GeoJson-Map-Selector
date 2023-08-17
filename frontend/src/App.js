import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polygon,
  GeoJSON,
  FeatureGroup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "./App.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import * as turf from "@turf/turf";
import axios from "axios";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const location = [12.9716, 77.5946];
const zoom = 8;

function App() {
  const [features, setFeatures] = useState([]);

  let AOIPolygons = [];

  const _onEditPath = async (e) => {
    let ids = new Set();
    let AOIPolygonsFiltered = [];

    e.layers.getLayers().map((editedLayer) => {
      let AOIPolygon = editedLayer.toGeoJSON();
      AOIPolygonsFiltered.push({
        AOIPolygon: AOIPolygon,
        leaflet_id: editedLayer._leaflet_id,
      });
      ids.add(editedLayer._leaflet_id);
    });

    AOIPolygons.filter((polygon) => {
      if (!ids.has(polygon["leaflet_id"]) && ids.add(polygon["leaflet_id"])) {
        AOIPolygonsFiltered.push(polygon);
      }
    });

    AOIPolygons = AOIPolygonsFiltered;
    updateMap();
  };

  const _onCreate = async (e) => {
    let layer = e.layer;
    const AOIPolygon = layer.toGeoJSON();

    AOIPolygons.push({
      AOIPolygon: AOIPolygon,
      leaflet_id: e.layer._leaflet_id,
    });
    updateMap();
  };

  const _onDelete = (e) => {
    let ids = new Set();
    let AOIPolygonsFiltered = [];

    e.layers.getLayers().map((deletedLayer) => {
      ids.add(deletedLayer._leaflet_id);
    });

    AOIPolygons.filter((polygon) => {
      if (!ids.has(polygon["leaflet_id"]) && ids.add(polygon["leaflet_id"])) {
        AOIPolygonsFiltered.push(polygon);
      }
    });

    AOIPolygons = AOIPolygonsFiltered;
    updateMap();
  };

  const makePolygon = (layer) => {
    let polygonLatLngs = layer
      .getLatLngs()[0]
      .map((latLng) => [latLng.lng, latLng.lat]);
    polygonLatLngs.push(polygonLatLngs[0]);
    const polygon = turf.polygon([polygonLatLngs]);
    return polygon;
  };

  const getIntersectedPolygons = async () => {
    const data = await axios.post(`http://localhost:8080`, {
      AOIPolygons: AOIPolygons,
    });
    return data;
  };

  const updateMap = async () => {
    const data = await getIntersectedPolygons(AOIPolygons);
    console.log(AOIPolygons);
    setFeatures(data.data.polygons);
  };

  return (
    <div className="App">
      <MapContainer center={location} zoom={zoom} scrollWheelZoom={false}>
        <FeatureGroup>
          <EditControl
            position="topleft"
            onCreated={_onCreate}
            onEdited={_onEditPath}
            onDeleted={_onDelete}
            draw={{
              polyline: false,
              polygon: {
                shapeOptions: {
                  color: "red",
                },
              },
              rectangle: {
                shapeOptions: {
                  color: "red",
                },
              },
              circle: false,
              circlemarker: false,
              marker: false,
            }}
          />
        </FeatureGroup>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {features.map((feature) => {
          return (
            <GeoJSON
              key={feature._id}
              data={{ type: "FeatureCollection", features: [feature] }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}

export default App;

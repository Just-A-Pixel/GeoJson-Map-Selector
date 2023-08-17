const express = require("express");
const cors = require("cors");
const turf = require("@turf/turf");
const karnataka = require("./karnataka.json");
const mongoose = require("mongoose");
const PolygonData = require("./models/polygonSchema");
const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

const mongoUri = "mongodb://mongo:27017/raj";
mongoose.connect(mongoUri, { useNewUrlParser: true });
const db = mongoose.connection;

db.on("error", (error) => {
  console.error(error);
});

db.once("open", () => {
  console.log("Connected to database");

  PolygonData.findOne({})
    .then((result) => {
      if (result === null) {
        console.log("The collection is empty. Seeding...");
        const newPolygonSchema = new PolygonData(karnataka);
        newPolygonSchema
          .save()
          .then((e) => {
            console.log("Seeded.");
          })
          .catch((err) => {
            console.log(err);
            console.log("Could not seed DB.");
          });
      } else {
        console.log("The collection is not empty.");
      }

      console.log("Server is ready!")
    })
    .catch((error) => {
      console.error("Error checking collection:", error);
    });
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/", async (req, res) => {
  const AOIPolygons = req.body.AOIPolygons;
  let temp = AOIPolygons.map((item) => {
    return item.AOIPolygon;
  });

  const karnatakaGeoJson = await PolygonData.find({});
  const polygons = findIntersectedPolygons(temp, karnatakaGeoJson[0]);
  console.log("Intersecting polygons found.");
  res.json({ polygons });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Find intersections for every AOI Polygon. All unique.
const findIntersectedPolygons = (AOIPolygons, geojson) => {
    let data = [];
    let ids = new Set();
  
    AOIPolygons.forEach((AOIPolygon) => {
      const newGeoJson = geojson.features.filter((polygon) => {
        let intersect = turf.intersect(polygon, AOIPolygon);
        if (intersect != null 
            && !ids.has(polygon["_id"]) && ids.add(polygon["_id"])
            ) {
          return polygon;
        }
      });
      data = [...data, newGeoJson];
    });
  
    return data.flat();
  };

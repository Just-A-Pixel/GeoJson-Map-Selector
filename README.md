# GeoJson-Map-Selector
Full-stack website with docker compose where user can draw their AOI to see tiles which are interacting with AOI. 
A docker compose configuration spins up a React Frontend, Node Backend and a Mongo Database. 
Upon selecting an AOI, Frontend it will pull the relative intersecting tiles from the database based on the intersection.

## Steps

1. Clone the repo
2. In the root folder, run ```bash start.sh```

The docker containers will spin up. After it is done, go to http://localhost:3000/

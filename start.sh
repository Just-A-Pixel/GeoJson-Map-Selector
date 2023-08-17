# docker rm -f mymongo || true
# docker run -d -p 27017:27017 -v ~/mongo-docker  --name mymongo mongo
docker build -t node-backend ./backend
docker build -t react-frontend ./frontend
docker-compose up
# docker exec -it mymongo bash
# mongosh
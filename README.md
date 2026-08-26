`docker compose down -v` - take down the application (WARNING, DELETES VOLUMES!!! SCARY!!!)

`docker compose up -d --build` - bring up the application (ignoring cache)


for testing database keeps after docker restart:
```bash
docker compose down
docker compose up -d
```
(deleting volumes deletes the database btw)



localhost:8000/docs is brilliant for testing the backend

http://localhost:8080
runs the frontend (starts at index.html)



.env variables:
```bash
DB_HOST=data_tier_container
DB_PORT=5432
DB_NAME=Jim
DB_USER=Jim_user
DB_PASSWORD=very_secure_password
SECRET_KEY=WHATDOESTHEFOXSAY?!!?!🗣️🗣️🔥🔥🔥
```
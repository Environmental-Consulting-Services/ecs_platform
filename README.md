# ecsd
ECSD Storm Water Management  Platform


Prereqs:
  
  For Dev:
    Nodejs >18.0  <20.0

  To deploy to prod:
    docker (if you want to build and de


Initial Setup:

npm install


Build ECSD:

docker build . -t ghcr.io/llamalogic/api -f ./api/Dockerfile
docker build . -t ghcr.io/llamalogic/console -f ./console/docker/Dockerfile
docker build . -t ghcr.io/llamalogic/nginx -f ./nginx/Dockerfile

Publish new ESCD:

docker push ghcr.io/llamalogic/api 
docker push ghcr.io/llamalogic/console 
docker push ghcr.io/llamalogic/nginx


Run ECSD:

docker run -d --name api --hostname api --network ecsd-app --env-file ./.env-api  -p 8080:8080 -t ghcr.io/llamalogic/api
docker run -d --name console --hostname console --network ecsd-app --env-file ./.env-app  -p 8081:80 -t ghcr.io/llamalogic/console:latest 
docker run -d -t -p 80:80 --name nginx --hostname nginx --network ecsd-app ghcr.io/llamalogic/nginx
  

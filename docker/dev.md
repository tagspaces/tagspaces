# Developer Documentation

## Building docker container

multiplatform

docker buildx build --platform linux/amd64,linux/arm64 -t tagspaces-lite-web:6.6.3 .

old: docker build . -t tagspaces-lite-web:6.3.0

## Pushing the image to Docker Hub

docker push tagspaces-lite-web:6.4.5

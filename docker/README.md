## Build images and up server
   `docker-compose build`  
   `docker-compose up -d`
   
## Run tagspaces web and recreate container
`docker-compose up --force-recreate`

#### Run only tagspaces-web image (without docker-compose)
`docker run -d -t -i tagspaces-web /bin/bash`

This will remove all dangling build cache
`docker builder prune`


  

#!/bin/bash

# Remove old Docker images for helen_underground
docker images -a | grep "helen_underground" | awk '{print $3}' | xargs docker rmi -f

# Build the new Docker image
docker-compose build

# Run the Docker container in detached mode
docker-compose up -d

#!/bin/bash

cd /home/admin/user/ || exit

git fetch origin
output=$(git pull origin main)

if [[ $output != "Already up to date." ]]; then
    echo "Files have changed. Rebuilding Docker image and restarting container..."

    if docker ps | grep -q "myservice-container"; then
        echo "Stopping running container..."
        docker stop myservice-container
        docker rm myservice-container
        echo "Old container stopped and removed."
    fi

    echo "Rebuilding Docker image with no cache..."
    docker build --no-cache -t myservice-image .

    echo "Starting new Docker container..."
    docker run -d --name myservice-container -p 8081:8081 myservice-image
    echo "New container started."

else
    echo "No changes detected. The Docker container will not be restarted."
fi

#!/bin/bash

# Navigate to your project directory
cd /home/admin/user/ || exit

# Fetch and pull the latest changes
git fetch origin
output=$(git pull origin main)

# Check if any files were updated by the pull command
if [[ $output != "Already up to date." ]]; then
    echo "Files have changed. Rebuilding Docker image and restarting container..."

    # Stop and remove the existing Docker container if it's running
    if docker ps | grep -q "myservice-container"; then
        echo "Stopping running container..."
        docker stop myservice-container
        docker rm myservice-container
        echo "Old container stopped and removed."
    fi

    # Rebuild the Docker image without cache
    echo "Rebuilding Docker image with no cache..."
    docker build --no-cache -t myservice-image .

    # Start a new Docker container from the rebuilt image
    echo "Starting new Docker container..."
    docker run -d --name myservice-container -p 3000:3000 myservice-image
    echo "New container started."

else
    echo "No changes detected. The Docker container will not be restarted."
fi

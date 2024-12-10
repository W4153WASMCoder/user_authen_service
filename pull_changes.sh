#!/bin/bash

cd /home/admin/user/ || exit

git fetch origin
output=$(git pull origin main)

if [[ $output != "Already up to date." ]]; then
    echo "Files have changed. Restarting container using a public Node.js image..."

    if docker ps | grep -q "myservice-container"; then
        echo "Stopping running container..."
        docker stop myservice-container
        docker rm myservice-container
        echo "Old container stopped and removed."
    fi

    echo "Starting new Docker container..."
    docker run -d --name myservice-container \
        -p 8081:8081 \
        -w /home/admin/user \
        -v /home/admin/user:/home/admin/user \
        node:18-alpine \
        sh -c "npm install && npm run build && npm start"

    echo "New container started."

else
    echo "No changes detected. The Docker container will not be restarted."
fi

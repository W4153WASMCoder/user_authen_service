#!/bin/bash

cd /home/admin/user/ || exit

git fetch origin
output=$(git pull origin main)

if [[ $output != "Already up to date." ]]; then
    echo "Files have changed."
    echo "Stopping old screen session (if any)..."

    if screen -list | grep -q "myservice"; then
        screen -S myservice -X quit
        echo "Old screen session stopped."
    fi

    echo "Starting new screen session for myservice..."
    screen -dmS myservice bash -c "cd /home/admin/user/webserver/ && npm run build && npm start"
    echo "New screen session started."

else
    echo "No changes detected. The application will not be restarted."
fi
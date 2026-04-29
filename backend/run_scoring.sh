#!/bin/bash
# Run the scoring engine every 30 minutes as a background task

cd "$(dirname "$0")"

# Run indefinitely
while true; do
    echo "[$(date)] Running lead scoring engine..."
    python manage.py shell < scoring_engine.py
    
    # Wait 30 minutes
    sleep 1800
done

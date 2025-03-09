#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo ".env file not found!"
  exit 1
fi

# Create a new .env.test file
cp .env .env.test

# Get the current POSTGRES_DB value
DB_VALUE=$(grep "^POSTGRES_DB=" .env | cut -d= -f2)

# Create the new value with -test appended
NEW_DB_VALUE="${DB_VALUE}-test"

# Replace the POSTGRES_DB value in .env.test
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/^POSTGRES_DB=${DB_VALUE}/POSTGRES_DB=${NEW_DB_VALUE}/" .env.test
else
  # Linux and others
  sed -i "s/^POSTGRES_DB=${DB_VALUE}/POSTGRES_DB=${NEW_DB_VALUE}/" .env.test
fi

echo ".env.test file created"

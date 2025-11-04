#!/bin/bash

# Prisma Studio wrapper script
# Ensures DATABASE_URL is loaded from .env.local

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
    set -a
    source .env.local
    set +a
fi

# Run Prisma Studio
exec npx prisma studio


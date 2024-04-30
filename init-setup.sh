#!/usr/bin/env bash
# Use this script to start a docker container for a local development database

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./init-setup.sh`

# On Linux and macOS you can run this script directly - `./init-setup.sh`

if ! [ -x "$(command -v docker)" ]; then
  echo "Docker is not installed. Please install docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

# Setup local db
docker-compose -p=cailloux up -d

# Copy .env example in apps/web
(cd apps/web; cp -n .env.example .env;)

# Copy .env.example in `packages/db` & run prisma commands
(cd packages/db; cp -n .env.example .env; npx prisma migrate deploy && bun run db:seed && bun run db:generate)

#!/bin/bash

# Deployment script for the chat application

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process...${NC}"

# Check if docker is installed
if ! command -v docker &> /dev/null
then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null
then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Building and starting services...${NC}"

# Build and start services
docker-compose -f docker-compose.production.yml up -d --build

echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 30

# Check if services are running
if docker-compose -f docker-compose.production.yml ps | grep -q "Up"
then
    echo -e "${GREEN}Services are running successfully!${NC}"
    
    # Run database migrations
    echo -e "${YELLOW}Running database migrations...${NC}"
    docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
    
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${GREEN}Your application should be accessible at http://your-server-ip:3000${NC}"
else
    echo -e "${RED}There was an issue starting the services. Check the logs with 'docker-compose logs'.${NC}"
    exit 1
fi
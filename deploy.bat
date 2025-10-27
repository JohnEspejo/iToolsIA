@echo off
REM Deployment script for the chat application on Windows

echo Starting deployment process...

REM Check if docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if docker-compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo Building and starting services...

REM Build and start services
docker-compose -f docker-compose.production.yml up -d --build

echo Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check if services are running
docker-compose -f docker-compose.production.yml ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo Services are running successfully!
    
    REM Run database migrations
    echo Running database migrations...
    docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
    
    echo Deployment completed successfully!
    echo Your application should be accessible at http://your-server-ip:3000
) else (
    echo There was an issue starting the services. Check the logs with 'docker-compose logs'.
    exit /b 1
)
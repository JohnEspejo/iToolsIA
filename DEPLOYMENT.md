# Deployment Guide

This guide explains how to deploy the application using Docker and Docker Compose.

## Prerequisites

1. Docker installed on your VPS
2. Docker Compose installed on your VPS
3. Git (optional, for cloning the repository)

## Deployment Steps

### 1. Copy Files to Your VPS

Copy all the files from your local machine to your VPS. You can use `scp`, `rsync`, or any other method you prefer.

```bash
# Example using scp
scp -r /path/to/local/project user@your-vps-ip:/path/to/remote/directory
```

### 2. Configure Environment Variables

Edit the [.env.production](file:///c%3A/Users/john/Documents/model2/iToolsIA/.env.production) file and replace the placeholder values with your actual values:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://yourdomain.com

# Google OAuth (Optional but recommended)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/chat_app

# Python RAG Service
PYTHON_RAG_BASE_URL=http://localhost:5001

# OpenAI API Key
OPEN_AI_API_KEY=your_openai_api_key_here
```

### 3. Deploy Using Docker Compose

Run the deployment script:

```bash
# On Linux/Mac
chmod +x deploy.sh
./deploy.sh

# On Windows
deploy.bat
```

Or deploy manually:

```bash
# Build and start services
docker-compose -f docker-compose.production.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
```

### 4. Access Your Application

Once deployed, your application will be accessible at:

- Frontend: http://your-vps-ip:3000
- Backend API: http://your-vps-ip:5001

## Using Nginx as Reverse Proxy (Recommended)

For production use, it's recommended to use Nginx as a reverse proxy to handle SSL certificates and route traffic to your services.

1. Install Nginx on your VPS
2. Copy the [nginx.conf](file:///c%3A/Users/john/Documents/model2/iToolsIA/nginx.conf) file to `/etc/nginx/sites-available/your-app`
3. Create a symlink: `sudo ln -s /etc/nginx/sites-available/your-app /etc/nginx/sites-enabled/`
4. Test the configuration: `sudo nginx -t`
5. Reload Nginx: `sudo systemctl reload nginx`

## Updating the Application

To update the application:

1. Pull the latest code to your VPS
2. Rebuild and restart services:
   ```bash
   docker-compose -f docker-compose.production.yml down
   docker-compose -f docker-compose.production.yml up -d --build
   ```

## Troubleshooting

### Check Service Status
```bash
docker-compose -f docker-compose.production.yml ps
```

### View Logs
```bash
# View all logs
docker-compose -f docker-compose.production.yml logs

# View specific service logs
docker-compose -f docker-compose.production.yml logs frontend
docker-compose -f docker-compose.production.yml logs backend
docker-compose -f docker-compose.production.yml logs database
```

### Run Database Migrations Manually
```bash
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
```
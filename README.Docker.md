# Docker Setup Guide

This guide explains how to run the NevrFall application using Docker Compose.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)
- External MongoDB connection string

## Quick Start

1. **Create a `.env` file** in the root directory with your environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and fill in your actual values, especially:
   - `MONGO_URI` - Your external MongoDB connection string
   - `JWT_SECRET` - A secure random string for JWT tokens
   - Other service credentials (AWS, Razorpay, etc.)

2. **Build and start the containers**:
   ```bash
   docker compose up -d --build
   ```

3. **Check the status**:
   ```bash
   docker compose ps
   ```

4. **View logs**:
   ```bash
   # All services
   docker compose logs -f
   
   # Specific service
   docker compose logs -f backend
   docker compose logs -f frontend
   ```

## Services

- **Backend**: Runs on port 8080 (configurable via `BACKEND_PORT`)
- **Frontend**: Runs on port 3000 (configurable via `FRONTEND_PORT`)

## Environment Variables

All environment variables are defined in `.env.template`. Copy it to `.env` and fill in your values:
```bash
cp .env.template .env
```

### Required Variables

- `MONGO_URI` - MongoDB connection string (external)
- `JWT_SECRET` - Secret key for JWT tokens
- `AWS_ACCESS_KEY_ID` - AWS S3 access key
- `AWS_SECRET_ACCESS_KEY` - AWS S3 secret key
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET` - S3 bucket name

### Optional Variables

- `REDIS_HOST` - Redis host (if using Redis)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password
- `BACKEND_PORT` - Backend port (default: 8080)
- `FRONTEND_PORT` - Frontend port (default: 3000)
- `CLIENT_URL` - Frontend URL
- `ADMIN_URL` - Admin panel URL
- `NEXT_PUBLIC_API_URL` - Backend API URL for frontend

## Useful Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Rebuild and restart
docker compose up -d --build

# View logs
docker compose logs -f

# Stop and remove containers, networks
docker compose down -v

# Execute command in container
docker compose exec backend sh
docker compose exec frontend sh

# Restart a specific service
docker compose restart backend
docker compose restart frontend
```

## Health Checks

Both services include health checks:
- Backend: `http://localhost:8080/health`
- Frontend: `http://localhost:3000`

## Troubleshooting

1. **Port already in use**: Change the ports in `.env` file
2. **MongoDB connection issues**: Verify your `MONGO_URI` is correct and accessible
3. **Build failures**: Check logs with `docker compose logs`
4. **Permission issues**: Ensure Docker has proper permissions

## Production Deployment

For production:
1. Set `PRODUCTION=true` in `.env`
2. Use proper domain names in `CLIENT_URL` and `ADMIN_URL`
3. Use secure secrets for `JWT_SECRET`
4. Configure proper CORS settings
5. Use reverse proxy (nginx) for SSL/TLS termination


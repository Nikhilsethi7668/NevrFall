# Docker Fix Guide - Resolving "unexpected end of JSON input" Error

## Problem
You encountered the error: `unable to get image 'nevrfall-frontend': unexpected end of JSON input`

This error occurs when Docker's image metadata is corrupted or the Docker daemon is in a bad state.

## Solution Steps

### Step 1: Restart Docker Desktop (REQUIRED)

**Option A: Using GUI**
1. Click the Docker icon in your macOS menu bar (top right)
2. Select "Quit Docker Desktop"
3. Wait 10-15 seconds for Docker to fully shut down
4. Open Docker Desktop again from Applications
5. Wait for Docker to fully start (whale icon should be steady, not animated)

**Option B: Using Terminal**
```bash
# Kill Docker processes
killall Docker

# Wait 10 seconds, then reopen
open -a Docker
```

**Wait for Docker to be fully ready** (you'll see "Docker Desktop is running" in the menu bar icon)

---

### Step 2: Verify Docker is Running

After Docker Desktop starts, verify it's working:

```bash
docker ps
```

You should see a list of containers (or an empty list if none are running). If you see "EOF" or connection errors, Docker isn't ready yet.

---

### Step 3: Clean Docker Cache (Recommended)

Once Docker is running, clean out corrupted images and cache:

```bash
# Remove all stopped containers, unused networks, dangling images, and build cache
docker system prune -af --volumes

# Specifically remove any NevrFall images
docker images | grep nevrfall | awk '{print $3}' | xargs docker rmi -f
```

**⚠️ WARNING:** This will delete ALL Docker images and volumes on your system. If you have other projects using Docker, you may need to rebuild them.

**Safer alternative** (only removes NevrFall images):
```bash
docker images | grep nevrfall | awk '{print $3}' | xargs docker rmi -f
```

---

### Step 4: Rebuild and Start Your Application

Now rebuild your containers from scratch:

```bash
cd /Users/nikhi/Desktop/NevrFall

# Build and start in detached mode
docker compose -f docker-compose.dev.yml up -d --build

# Or if you want to see the logs
docker compose -f docker-compose.dev.yml up --build
```

---

### Step 5: Verify Everything is Running

Check container status:

```bash
docker compose -f docker-compose.dev.yml ps
```

Check logs if there are issues:

```bash
# All services
docker compose -f docker-compose.dev.yml logs

# Specific service
docker compose -f docker-compose.dev.yml logs frontend
docker compose -f docker-compose.dev.yml logs backend
docker compose -f docker-compose.dev.yml logs admin
```

---

## Additional Fixes Applied

✅ **Removed obsolete `version` field** from `docker-compose.dev.yml` to eliminate warning messages

---

## If Problems Persist

If you still encounter issues after following these steps:

### 1. Check Docker Desktop Resources
- Open Docker Desktop → Settings → Resources
- Ensure you have allocated enough:
  - **Memory:** At least 4GB (8GB recommended)
  - **CPUs:** At least 2 cores
  - **Disk:** At least 10GB free

### 2. Reset Docker Desktop to Factory Defaults
⚠️ **This will delete ALL Docker data**

1. Open Docker Desktop
2. Go to Settings (gear icon)
3. Select "Troubleshoot"
4. Click "Clean / Purge data" or "Reset to factory defaults"
5. Restart Docker Desktop

### 3. Check Dockerfile Issues

Your frontend Dockerfile uses multi-stage builds. For development, you may want a simpler approach:

**Create `frontend/Dockerfile.dev`:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

Then update `docker-compose.dev.yml` to use it:
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile.dev  # Use dev-specific Dockerfile
```

---

## Quick Reference Commands

```bash
# Stop everything
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker compose -f docker-compose.dev.yml down -v

# Rebuild specific service
docker compose -f docker-compose.dev.yml build frontend

# View logs in real-time
docker compose -f docker-compose.dev.yml logs -f

# Restart a specific service
docker compose -f docker-compose.dev.yml restart backend
```

---

## Summary

The main issue was that Docker Desktop wasn't running properly, causing the "unexpected end of JSON input" error. The solution is:

1. ✅ Restart Docker Desktop completely
2. ✅ Wait for it to be fully ready
3. ✅ Clean Docker cache
4. ✅ Rebuild containers from scratch

The `version` field warning has also been fixed in your `docker-compose.dev.yml` file.

# NevrFall Development - Without Docker Alternative

Since your disk is critically full (99% used, only 196MB available), Docker cannot function properly. Here's how to run NevrFall directly without Docker:

---

## 🚨 Critical Issue: Disk Space

**Your disk usage:**
- Main disk: **99% full** (only 196MB available)
- Docker volumes: 2.4GB + 2.6GB mounted
- **Docker Desktop cannot start** due to lack of space

**This MUST be fixed first before Docker will work.**

---

## Option 1: Free Up Disk Space (Recommended)

Run the cleanup script I created:

```bash
cd /Users/nikhi/Desktop/NevrFall
./cleanup-disk.sh
```

This will help you:
- Clear npm cache (1-5GB)
- Clear system caches
- Remove Docker data
- Clear conda cache
- Empty trash
- Remove node_modules (can reinstall)

**After cleanup, you need at least 10GB free for Docker to work properly.**

---

## Option 2: Run Without Docker (Quick Start)

If you need to start development immediately while cleaning up disk space:

### Terminal 1 - Backend
```bash
cd /Users/nikhi/Desktop/NevrFall/backend

# Install dependencies (if not already done)
npm install

# Create .env file if needed
cp ../.env .env

# Start backend
npm start
```

### Terminal 2 - Frontend
```bash
cd /Users/nikhi/Desktop/NevrFall/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Terminal 3 - Admin
```bash
cd /Users/nikhi/Desktop/NevrFall/admin

# Install dependencies
npm install

# Start development server
npm run dev
```

**Services will run on:**
- Backend: http://localhost:8080
- Frontend: http://localhost:3000
- Admin: http://localhost:5173

---

## Option 3: Manual Cleanup Steps

If the script doesn't work, manually clean:

### 1. Clear npm cache
```bash
npm cache clean --force
du -sh ~/Library/Caches/npm
```

### 2. Clear Homebrew (if installed)
```bash
brew cleanup -s
rm -rf $(brew --cache)
```

### 3. Find large files
```bash
# Find largest directories
sudo du -sh /* 2>/dev/null | sort -hr | head -20

# Find large files in home directory
find ~ -type f -size +1G 2>/dev/null
```

### 4. Clear conda cache
```bash
conda clean --all -y
```

### 5. Empty Trash
```bash
rm -rf ~/.Trash/*
```

### 6. Remove old Docker data
```bash
# Stop Docker Desktop completely
# Then delete Docker data manually
rm -rf ~/Library/Containers/com.docker.docker
```

### 7. Clear Xcode caches (if you have Xcode)
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ~/Library/Developer/Xcode/Archives
```

### 8. Remove old iOS simulators (if applicable)
```bash
xcrun simctl delete unavailable
```

---

## After Cleanup: Restart Docker

Once you have **at least 10GB free**:

1. **Quit Docker Desktop completely**
   ```bash
   killall Docker
   ```

2. **Wait 10 seconds**, then open Docker Desktop from Applications

3. **Verify Docker is working**
   ```bash
   docker ps
   docker system df
   ```

4. **Clean Docker and rebuild**
   ```bash
   cd /Users/nikhi/Desktop/NevrFall
   docker system prune -af --volumes
   docker compose -f docker-compose.dev.yml up -d --build
   ```

---

## Why This Happened

The error you saw:
```
write /var/lib/desktop-containerd/daemon/.../root/.npm/_cacache/...: input/output error
```

This is caused by:
1. **No disk space** - Docker cannot write build cache
2. **Corrupted Docker storage** - Due to previous failed writes when disk was full
3. **Docker Desktop unable to start** - Needs space to function

---

## Prevention

To avoid this in the future:

1. **Monitor disk space regularly**
   ```bash
   df -h
   ```

2. **Clean Docker regularly**
   ```bash
   docker system prune -a --volumes
   ```

3. **Use .dockerignore** properly (already configured)

4. **Clear node_modules before Docker builds** (use volumes instead)

5. **Keep at least 20GB free** on your system drive

---

## Quick Status Check

**Before you can use Docker:**
- ✅ Free up at least 10GB of disk space
- ✅ Restart Docker Desktop
- ✅ Verify Docker is running: `docker ps`
- ✅ Clean Docker cache: `docker system prune -af --volumes`
- ✅ Rebuild containers: `docker compose -f docker-compose.dev.yml up --build`

**To start developing immediately:**
- ✅ Run backend, frontend, and admin directly with `npm` (see Option 2 above)

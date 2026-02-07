#!/bin/bash

# NevrFall Disk Cleanup Script
# This script helps free up disk space on macOS

echo "==================================="
echo "NevrFall Disk Cleanup Utility"
echo "==================================="
echo ""

# Check current disk space
echo "📊 Current Disk Space:"
df -h / | tail -1
echo ""

# Function to show size and ask for confirmation
cleanup_step() {
    local description=$1
    local command=$2
    
    echo "-----------------------------------"
    echo "🧹 $description"
    read -p "Do you want to proceed? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Running cleanup..."
        eval "$command"
        echo "✅ Done!"
        df -h / | tail -1
    else
        echo "⏭️  Skipped"
    fi
    echo ""
}

# 1. Clear npm cache
cleanup_step "Clear npm cache (can free 1-5GB)" \
    "npm cache clean --force"

# 2. Clear Homebrew cache (if installed)
if command -v brew &> /dev/null; then
    cleanup_step "Clear Homebrew cache" \
        "brew cleanup -s && rm -rf $(brew --cache)"
fi

# 3. Clear system caches (requires sudo)
cleanup_step "Clear system caches (requires password)" \
    "sudo rm -rf ~/Library/Caches/* && sudo rm -rf /Library/Caches/*"

# 4. Clear Conda cache (if using conda)
if command -v conda &> /dev/null; then
    cleanup_step "Clear Conda package cache" \
        "conda clean --all -y"
fi

# 5. Empty trash
cleanup_step "Empty Trash" \
    "rm -rf ~/.Trash/*"

# 6. Clear Docker data (if Docker is installed)
if command -v docker &> /dev/null; then
    cleanup_step "Remove ALL Docker data (containers, images, volumes)" \
        "docker system prune -af --volumes 2>/dev/null || echo 'Docker not running, skipping...'"
fi

# 7. Clear node_modules in project (can be reinstalled)
cleanup_step "Remove node_modules folders in NevrFall project (will need reinstall)" \
    "cd /Users/nikhi/Desktop/NevrFall && find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +"

# 8. Clear build artifacts
cleanup_step "Remove build artifacts (.next, dist, build folders)" \
    "cd /Users/nikhi/Desktop/NevrFall && rm -rf frontend/.next && rm -rf admin/dist && rm -rf backend/dist"

echo "==================================="
echo "✨ Cleanup Complete!"
echo "==================================="
echo ""
echo "📊 Final Disk Space:"
df -h / | tail -1
echo ""
echo "💡 Tips:"
echo "  - Restart your Mac for best results"
echo "  - Consider moving large files to external storage"
echo "  - Check for large files: sudo du -sh /* 2>/dev/null | sort -hr | head -20"
echo ""

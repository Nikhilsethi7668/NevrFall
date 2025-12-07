#!/bin/bash

# NevrFall Docker Setup Script

echo "🚀 Setting up NevrFall Docker Environment..."

# Check if .env exists
if [ ! -f .env ]; then
    if [ -f .env.template ]; then
        echo "📝 Creating .env file from .env.template..."
        cp .env.template .env
        # Generate a random JWT secret
        if command -v openssl &> /dev/null; then
            JWT_SECRET=$(openssl rand -base64 32)
            # Replace JWT_SECRET in .env file
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
            else
                # Linux
                sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
            fi
        fi
        echo "✅ .env file created from template! Please edit it with your actual values."
        echo "⚠️  IMPORTANT: Update MONGO_URI and other required credentials in .env file"
    else
        echo "❌ .env.template not found. Please create .env file manually."
        exit 1
    fi
else
    echo "✅ .env file already exists."
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo ""
echo "📦 Building and starting containers..."
echo ""

# Build and start
docker compose up -d --build

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Check status: docker compose ps"
echo "📋 View logs: docker compose logs -f"
echo "🛑 Stop services: docker compose down"
echo ""


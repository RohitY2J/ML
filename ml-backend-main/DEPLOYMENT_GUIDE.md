# Docker Deployment Guide for Stock Market Backend

This guide provides step-by-step instructions for deploying your Stock Market Backend application using Docker.

## Prerequisites

1. **Docker**: Install Docker Desktop or Docker Engine
2. **Docker Compose**: For local development
3. **Node.js**: For local development (optional)

## Quick Start

### Step 1: Test Your Application Locally

```bash
# Start the application with Docker Compose
docker compose up -d

# Test the API
curl http://localhost:3000/api/technical-analysis?symbol=NEPSE
```

### Step 2: Build Docker Image

```bash
# Build the image
docker build -t stock-market-backend:latest .

# Run the container
docker run -p 3000:3000 stock-market-backend:latest
```

### Step 3: Push to Docker Hub

```bash
# Tag your image
docker tag stock-market-backend:latest your-username/stock-market-backend:latest

# Push to Docker Hub
docker push your-username/stock-market-backend:latest
```

## Configuration

### Environment Variables

The application uses the following environment variables:

```bash
DB_HOST=host.docker.internal
DB_PORT=5433
DB_NAME=merolagani_pg
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
```

### Docker Compose Configuration

The `docker-compose.yml` file includes:

- **PostgreSQL Database**: Running on port 5433
- **Backend API**: Running on port 3000
- **Volume Mounts**: For data persistence
- **Network**: Isolated network for services

## Development

### Local Development

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Database Management

```bash
# Connect to database
docker exec -it stock-market-db psql -U postgres -d merolagani_pg

# View database logs
docker compose logs postgres
```

## Production Deployment

### Using Docker Hub

```bash
# Pull the image
docker pull your-username/stock-market-backend:latest

# Run with production environment
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_NAME=merolagani_pg \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your-secure-password \
  your-username/stock-market-backend:latest
```

### Using Docker Compose in Production

Create a `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  backend:
    image: your-username/stock-market-backend:latest
    environment:
      - NODE_ENV=production
      - DB_HOST=your-production-db-host
      - DB_PORT=5432
      - DB_NAME=merolagani_pg
      - DB_USER=postgres
      - DB_PASSWORD=your-secure-password
    ports:
      - "3000:3000"
    restart: unless-stopped
```

## Monitoring

### View Logs

```bash
# Application logs
docker logs stock-market-api

# Database logs
docker logs stock-market-db
```

### Health Checks

```bash
# Check API health
curl http://localhost:3000/health

# Check database connection
docker exec stock-market-db pg_isready -U postgres
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Change ports in docker-compose.yml
2. **Database Connection**: Check DB_HOST and DB_PORT
3. **Memory Issues**: Increase Docker memory allocation
4. **Permission Issues**: Check file permissions for volumes

### Useful Commands

```bash
# Rebuild without cache
docker compose build --no-cache

# View running containers
docker ps

# Execute commands in container
docker exec -it stock-market-api sh

# View resource usage
docker stats
```

## Cleanup

```bash
# Stop and remove containers
docker compose down

# Remove images
docker rmi stock-market-backend:latest

# Remove volumes (WARNING: This will delete data)
docker compose down -v
```

## Next Steps

1. Set up CI/CD with GitHub Actions
2. Configure reverse proxy (nginx)
3. Set up monitoring and logging
4. Implement backup strategies
5. Add SSL/TLS certificates 
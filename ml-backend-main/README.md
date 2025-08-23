# Stock Market Database Setup

This repository contains a Dockerized PostgreSQL database setup for stock market data.

## Prerequisites

- Docker
- Docker Compose

## Setup Instructions

1. Make sure your CSV files are in the `data` directory:
   - `daily_data_202504201948.csv`
   - `intraday_data_202504201945.csv`

2. Start the database:
   ```bash
   docker-compose up -d
   ```

3. The database will be available at:
   - Host: localhost
   - Port: 5432
   - Database: merolagani_pg
   - Username: postgres
   - Password: postgres

## Database Schema

### Daily Data Table
- date (DATE)
- symbol (VARCHAR)
- open (DECIMAL)
- high (DECIMAL)
- low (DECIMAL)
- close (DECIMAL)
- volume (BIGINT)

### Intraday Data Table
- timestamp (TIMESTAMP)
- symbol (VARCHAR)
- open (DECIMAL)
- high (DECIMAL)
- low (DECIMAL)
- close (DECIMAL)
- volume (BIGINT)

## Stopping the Database

To stop the database:
```bash
docker-compose down
```

To stop and remove all data (including the volume):
```bash
docker-compose down -v
``` 
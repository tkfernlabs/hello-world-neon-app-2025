# Hello World App - Backend

A simple Hello World application with a Node.js/Express backend and PostgreSQL (Neon) database.

## Features

- Express.js REST API
- PostgreSQL database (Neon)
- CORS enabled
- Health check endpoint

## API Endpoints

- `GET /` - API status and available endpoints
- `GET /hello` - Get the latest hello message
- `GET /messages` - Get all messages
- `POST /messages` - Create a new message
- `GET /health` - Health check

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file with the following:

```
DATABASE_URL=your_neon_database_url
PORT=3000
```

## Running

```bash
npm start
```

The server will run on http://localhost:3000

## Database

The app uses a Neon PostgreSQL database with a simple table:

```sql
CREATE TABLE hello_messages (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


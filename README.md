# Picture Compare API

API for comparing images using the pHash algorithm. The project is written in Node.js + TypeScript using Express.

## Features

- Computing pHash for images (JPEG, WebP)
- Comparing images by hashes
- Computing Hamming distance between hashes
- Determining image similarity based on threshold
- API key authentication (optional)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

4. Configure environment variables in `.env`:
```env
API_KEY=your_secret_api_key_here
PORT=3000
FILE_SIZE_LIMIT_MB=10
```

## Running

### Development
```bash
yarn dev
```

### Production
```bash
yarn build
yarn start
```

### Docker

#### Quick Start
```bash
# Navigate to docker folder
docker compose up -d
# Note: The .env file is used for configuration
```

## API Endpoints

### GET /health
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "memory": {
    "rss": 12345678,
    "heapTotal": 9876543,
    "heapUsed": 5432109,
    "external": 123456
  }
}
```

### POST /api/hash
Computes pHash for an uploaded image.

**Request:**
- Content-Type: `multipart/form-data`
- Parameter: `image` (image file)

**Response:**
```json
{
  "success": true,
  "hash": "ff0a3b8c9d1e2f3a"
}
```

### POST /api/compare
Compares two image hashes.

**Request:**
```json
{
  "hash1": "ff0a3b8c9d1e2f3a",
  "hash2": "ff0a3b8c9d1e2f3b",
  "threshold": 10
}
```

**Response:**
```json
{
  "success": true,
  "distance": 2,
  "isSimilar": true,
  "similarity": 0.98
}
```

### POST /api/hash-batch
Computes pHash for multiple uploaded images.

**Request:**
- Content-Type: `multipart/form-data`
- Parameter: `images` (array of image files, max 100 files)

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "filename": "image1.jpg",
      "hash": "ff0a3b8c9d1e2f3a",
      "success": true
    },
    {
      "filename": "image2.jpg",
      "hash": "ff0a3b8c9d1e2f3b",
      "success": true
    }
  ],
  "totalFiles": 2,
  "successfulFiles": 2,
  "failedFiles": 0
}
```

### POST /api/compare-batch
Compares one hash with an array of candidate hashes.

**Request:**
```json
{
  "targetHash": "ff0a3b8c9d1e2f3a",
  "candidateHashes": [
    "ff0a3b8c9d1e2f3b",
    "ff0a3b8c9d1e2f3c"
  ],
  "threshold": 10
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "hash": "ff0a3b8c9d1e2f3b",
      "distance": 2,
      "isSimilar": true,
      "similarity": 0.98
    }
  ],
  "totalCandidates": 2,
  "validCandidates": 1
}
```

## Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `API_KEY` | Secret API key for authentication | - | `your_secret_api_key_here` |
| `PORT` | Server port | `3000` | `8080` |
| `FILE_SIZE_LIMIT_MB` | Maximum file size limit in megabytes | `10` | `50` |

## Authentication

If `API_KEY` is set in the `.env` file, all requests must contain an API key in the header:

- `x-api-key: your_api_key` or
- `Authorization: Bearer your_api_key`

If `API_KEY` is not set, authentication is not required.

## Project Structure

```
src/
├── index.ts              # Main application file
├── routes/
│   └── imageRoutes.ts   # API routes
├── services/
│   └── imageService.ts  # Service for working with images
├── middleware/
│   └── authMiddleware.ts # Authentication middleware
└── utils/
    └── hammingDistance.ts # Utilities for computing Hamming distance
```

## Technologies

- **Node.js** - runtime environment
- **TypeScript** - typed JavaScript
- **Express** - web framework
- **Sharp** - image processing
- **image-hash** - pHash computation
- **Multer** - file uploads

## Usage Examples

### cURL

**Computing hash:**
```bash
curl -X POST http://localhost:3000/api/hash \
  -F "image=@image.jpg" \
  -H "x-api-key: your_api_key"
```

**Comparing hashes:**
```bash
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{
    "hash1": "ff0a3b8c9d1e2f3a",
    "hash2": "ff0a3b8c9d1e2f3b"
  }'
```

### JavaScript/Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');

// Computing hash
const form = new FormData();
form.append('image', fs.createReadStream('image.jpg'));

fetch('http://localhost:3000/api/hash', {
  method: 'POST',
  headers: {
    'x-api-key': 'your_api_key'
  },
  body: form
});

// Comparing hashes
fetch('http://localhost:3000/api/compare', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your_api_key'
  },
  body: JSON.stringify({
    hash1: 'ff0a3b8c9d1e2f3a',
    hash2: 'ff0a3b8c9d1e2f3b'
  })
});
```

## License

MIT

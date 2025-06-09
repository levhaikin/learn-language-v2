# English Learning App Backend

This is the backend API service for the English Learning Application. It provides endpoints for vocabulary management, learning attempts tracking, and statistics.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=3001
NODE_ENV=development
```

## Development

To run the server in development mode with hot-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## Building for Production

To compile the TypeScript code to JavaScript:
```bash
npm run build
```

This will create a `dist` directory with the compiled JavaScript files.

## Production

To start the production server:
```bash
npm start
```

## API Endpoints

### Vocabulary

- `GET /api/vocabulary`
  - Get all vocabulary words
  - Query parameters:
    - `page`: Page number (optional)
    - `limit`: Items per page (optional)

- `GET /api/vocabulary/category/:category`
  - Get vocabulary words by category
  - Parameters:
    - `category`: Category name

- `GET /api/vocabulary/difficulty/:level`
  - Get vocabulary words by difficulty level
  - Parameters:
    - `level`: Difficulty level ('easy', 'medium', 'hard')

### Learning Attempts

- `POST /api/attempts`
  - Record a new learning attempt
  - Body:
    ```json
    {
      "word": "string",
      "isCorrect": boolean,
      "timeTaken": number,
      "category": "string"
    }
    ```

- `GET /api/attempts`
  - Get attempts history
  - Query parameters:
    - `from`: Start date (optional)
    - `to`: End date (optional)

- `GET /api/attempts/word/:word`
  - Get attempts for a specific word
  - Parameters:
    - `word`: Word to get attempts for

### Statistics

- `GET /api/statistics`
  - Get overall learning statistics

- `GET /api/statistics/category/:category`
  - Get statistics for a specific category
  - Parameters:
    - `category`: Category name

- `GET /api/statistics/progress`
  - Get user learning progress

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API route definitions
│   │   ├── vocabulary.ts
│   │   ├── attempts.ts
│   │   └── statistics.ts
│   ├── types/           # TypeScript type definitions
│   │   └── vocabulary.ts
│   ├── app.ts           # Express application setup
│   └── server.ts        # Server entry point
├── package.json         # Project configuration
└── tsconfig.json       # TypeScript configuration
```

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Development Guidelines

1. **TypeScript**
   - Use TypeScript types/interfaces for all data structures
   - Enable strict mode in `tsconfig.json`

2. **API Design**
   - Follow RESTful conventions
   - Use plural nouns for resource endpoints
   - Include appropriate HTTP status codes
   - Provide detailed error messages

3. **Code Style**
   - Use async/await for asynchronous operations
   - Implement proper error handling
   - Add comments for complex logic
   - Follow consistent naming conventions

## Environment Variables

The following environment variables can be configured:

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment ('development' or 'production')

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests (when implemented)
4. Submit a pull request

## License

ISC 
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IsoTown API - Workshop Edition',
      version: '1.0.0',
      description: `
# Introduction to Web Development & APIs Workshop

Welcome to the **IsoTown API**! This is a RESTful API for building and managing a virtual city.

## What You'll Learn
- 🌐 How REST APIs work
- 📡 HTTP methods (GET, POST, PUT, DELETE)
- 🔑 API authentication and keys
- 📊 Request/response formats (JSON)
- 🛠️ Testing APIs with Swagger UI

## Getting Started
1. Try the endpoints below by clicking "Try it out"
2. See real request/response examples
3. Learn API design best practices

## Tech Stack
- **Backend**: Node.js + Express
- **Database**: SQLite
- **External APIs**: OpenWeatherMap, Google Maps, Gemini AI
      `.trim(),
      contact: {
        name: 'Workshop Instructor',
        email: 'workshop@example.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5176',
        description: 'Local Development Server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Server health check endpoints',
      },
      {
        name: 'Weather',
        description: 'Weather API integration',
      },
      {
        name: 'Leaderboard',
        description: 'Player scores and rankings',
      },
      {
        name: 'Mayor',
        description: 'AI-powered city reports (Gemini)',
      },
      {
        name: 'Capabilities',
        description: 'Server feature detection',
      },
    ],
    components: {
      schemas: {
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'ok',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T12:00:00.000Z',
            },
          },
        },
        Weather: {
          type: 'object',
          properties: {
            condition: {
              type: 'string',
              enum: ['CLEAR', 'RAIN', 'SNOW', 'WIND', 'HEAT', 'COLD'],
              example: 'CLEAR',
            },
            temperature: {
              type: 'number',
              example: 25.5,
            },
            description: {
              type: 'string',
              example: 'Clear skies',
            },
          },
        },
        LeaderboardEntry: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            score: {
              type: 'integer',
              example: 1000,
            },
            population: {
              type: 'integer',
              example: 25,
            },
            happiness: {
              type: 'integer',
              example: 20,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        MayorReport: {
          type: 'object',
          properties: {
            report: {
              type: 'string',
              example: 'Your city is thriving! Population is growing...',
            },
            message: {
              type: 'string',
              example: 'Mayor\'s Analysis',
            },
          },
        },
        Capabilities: {
          type: 'object',
          properties: {
            available: {
              type: 'boolean',
              example: true,
            },
            server: {
              type: 'boolean',
              example: true,
            },
            gemini: {
              type: 'boolean',
              example: true,
            },
            weather: {
              type: 'boolean',
              example: true,
            },
            leaderboard: {
              type: 'boolean',
              example: true,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Invalid request',
            },
            message: {
              type: 'string',
              example: 'Detailed error message',
            },
          },
        },
      },
    },
  },
  apis: ['./server/index.js'], // Path to API routes with annotations
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };

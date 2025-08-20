 Task Tracker Application

## Overview
The Task Tracker is a full-stack application designed to manage tasks and user authentication. Built with Node.js and Express for the backend, Vite with React for the frontend, and PostgreSQL as the database, this project provides a robust platform for task management. It includes a Swagger-based API documentation server for easy testing and integration.

## Features
- User authentication with JWT tokens.
- CRUD operations for tasks (Create, Read, Update, Delete).
- Time logging for task tracking.
- Health check endpoint for server status.
- Interactive Swagger UI for API exploration.

## Technologies
- **Backend**: Node.js, Express, Sequelize (ORM), PostgreSQL.
- **Frontend**: Vite, React, Tailwind CSS.
- **API Docs**: Swagger UI, YAML.
- **Containerization**: Docker.
- **Other**: CORS, Morgan (logging).

## Project Structure
```
task-tracker-SiliconMind/
├── backend/              # Backend code (server.js, routes, models)
│   ├── database/         # Sequelize models
│   ├── docs/             # Swagger docs (docs-server.js, api-spec.yaml)
│   ├── middleware/       # Authentication middleware
│   ├── __tests__/        # Test files
│   ├── package.json
│   ├── .env
│   └── Dockerfile
├── frontend/             # Frontend code (React app)
│   ├── package.json
│   ├── Dockerfile
│   ├── env.template.js
│   ├── entrypoint.sh
│   └── nginx.conf
├── database/             # Database models and migrations
├── docker-compose.yml    # Docker configuration
└── root.env              # Environment variables
```

## Setup

### Prerequisites
- Node.js (v18+ recommended)
- Docker and Docker Compose
- PostgreSQL client (for manual DB checks)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/AhmedSamir423/task-tracker-SiliconMind.git
   cd task-tracker-SiliconMind
   ```
2. Set up environment variables:
   - Copy `root.env` to `.env` in the `backend/` directory and adjust:
     ```
     NODE_ENV=development
     DB_NAME=task_tracker
     DB_USER=task_user
     DB_PASSWORD=taskpass
     PORT=3000
     JWT_SECRET=ITSGONALWAYSBEMYFAULT
     FRONTEND_URL=http://localhost:5173
     ```
3. Build and start the application with Docker:
   ```bash
   docker compose up --build
   ```

### Database Setup
- The `database/` folder contains Sequelize models. Migrations are run automatically when the backend starts.
- Verify tables with a PostgreSQL client at `localhost:5432` using `task_user` and `taskpass`.

## Usage
- **Frontend**: Access at `http://localhost:5173`.
- **Backend API**: Test at `http://localhost:3000` (e.g., `/health`, `/api/auth/signup`).
- **Swagger Docs**: Open `http://localhost:3001` to explore and test API endpoints.

### API Endpoints
- `/health`: Check server status.
- `/api/auth/signup`: Register a new user.
- `/api/auth/login`: Authenticate and get a JWT token.
- `/api/tasks`: Manage tasks (GET all, POST new).
- `/api/tasks/{id}`: Get, update, or delete a specific task.
- `/api/tasks/{id}/time`: Log time to a task.

## Development
- **Backend**: Run `node server.js` in `backend/` after installing dependencies with `npm install`.
- **Swagger Docs**: Run `node docs-server.js` in the `docs/` directory.
- **Frontend**: Navigate to `frontend/`, run `npm install`, then `npm run dev`.

## Testing
- Use the Swagger UI at `http://localhost:3001` to send API calls.
- Backend tests are in `backend/__tests__`—run with `npm test` after setup.

## Contributing
Feel free to fork this repo, submit issues, or send pull requests. Ensure changes align with the project structure and pass any tests.

## License
MIT License - See `LICENSE` file for details (add one if missing!).

## Acknowledgments
- Done during my Internship period at Silicon Mind
- Thanks to the open-source community for tools like Sequelize, React, and Swagger.

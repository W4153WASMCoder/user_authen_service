# User Authentication Service

This project is a TypeScript-based Express application for managing user authentication and authorization with OAuth support.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)
- MySQL (to set up the database)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>/webserver
```

### 2. Set Up Environment Variables

Create a `.env` file in the `webserver` directory and add the following details:

```env
DATABASE_HOST="localhost"
DATABASE_USER="root"
DATABASE_PASSWORD=""
DATABASE_NAME="db_user"
OAUTH_PROVIDER_API_KEY="123"
PORT=8081
```

Adjust the values according to your local setup or production configuration.

### 3. Install Dependencies

Navigate to the `webserver` directory and install dependencies:

```bash
npm install
```

### 4. Build the Project

To compile TypeScript files, run:

```bash
npm run build
```

The compiled JavaScript files will be located in the `dist/` folder.

### 5. Run the Application

- **Production:** Run the compiled code with Node.js:
  ```bash
  npm start
  ```

- **Development:** Use `ts-node-dev` for hot-reloading in development:
  ```bash
  npm run dev
  ```

### 6. Access the API

Once running, the app will be accessible at `http://localhost:8081` (or the port specified in your `.env` file).

## Project Structure

- `./app.ts`: Main application file
- `./middleware/pagination.ts`: Middleware for pagination
- `./middleware/logger.ts`: Logger middleware for tracking requests
- `./models/user_models.ts`: Database models for user management
- `./routes/users.ts`: Routes for user management
- `./routes/user_tokens.ts`: Routes for handling user tokens and OAuth
- `./swagger.ts`: Swagger setup for API documentation
- `./lib/hateoas.ts`: Helper functions for implementing HATEOAS principles

## Additional Scripts

- **Build**: `npm run build` - Compiles TypeScript to JavaScript.
- **Start**: `npm start` - Runs the compiled app in production.
- **Dev**: `npm run dev` - Starts the app in development mode with hot-reloading.

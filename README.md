# Phoenix Console Backend

This is the backend service for the Phoenix Console, built with [NestJS](https://nestjs.com/) and TypeScript.

## Prerequisites

- **Node.js**: Version 22.14.0 (see `.node-version` file)
- **npm**: v9 or later (comes with Node.js)

## Installation

1. Clone the repository and navigate to the backend folder:
   ```bash
   git clone <your-repo-url>
   cd phoenix-console/base_backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

- By default, the app runs on port `3000`. You can change the port by setting the `PORT` environment variable:
  ```bash
  export PORT=4000
  ```
- You can add environment variables in a `.env` file in the project root if needed.

## Running the Application

### Development
Start the server in development mode with hot-reload:
```bash
npm run start:dev
```

### Production
Build and start the server in production mode:
```bash
npm run build
npm run start:prod
```

### Debug Mode
Start the server with debugging enabled:
```bash
npm run start:debug
```

## Testing

- **Unit tests:**
  ```bash
  npm run test
  ```
- **End-to-end (e2e) tests:**
  ```bash
  npm run test:e2e
  ```
- **Test coverage:**
  ```bash
  npm run test:cov
  ```

## Linting & Formatting

- **Lint the code:**
  ```bash
  npm run lint
  ```
- **Format the code:**
  ```bash
  npm run format
  ```

## Project Structure

- `src/` - Main source code
- `test/` - Test files (unit and e2e)
- `dist/` - Compiled output (after build)

## Useful Commands

- `npm run start` - Start the app
- `npm run start:dev` - Start in development mode
- `npm run build` - Compile TypeScript to JavaScript
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests

## Notes

- Make sure you are using the correct Node.js version as specified in `.node-version`.
- For more details, refer to the [NestJS documentation](https://docs.nestjs.com/).

---

MIT License

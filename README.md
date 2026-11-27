# DriveEase Server

Backend API for DriveEase, built with Express 5, MongoDB, and Better Auth JWT verification using `jose`.

## Tech stack

- Node.js (ES modules)
- Express 5
- MongoDB
- `jose` for JWT verification
- `cors` and `dotenv`

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   CLIENT_URL=http://localhost:3000
   MONGODB_URI=your_mongodb_connection_string
   PORT=5001
   ```

   `PORT` is optional and defaults to `5001`.

3. Start the development server:

   ```bash
   npm run dev
   ```

   Or start it normally:

   ```bash
   npm start
   ```

## Scripts

| Script | Description |
|---|---|
| `npm start` | Start the server with Node |
| `npm run dev` | Start the server with Node's built-in watch mode |
| `npm test` | Placeholder test script |

## Project structure

```text
src/
├── config/
│   └── db.js
├── middleware/
│   └── auth.middleware.js
├── modules/
│   ├── cars/
│   │   ├── car.routes.js
│   │   ├── car.controller.js
│   │   └── car.validation.js
│   ├── rentals/
│   │   ├── rental.routes.js
│   │   ├── rental.controller.js
│   │   └── rental.validation.js
│   ├── reviews/
│   │   ├── review.routes.js
│   │   └── review.controller.js
│   ├── users/
│   │   ├── user.routes.js
│   │   └── user.controller.js
│   └── admin/
│       ├── admin.routes.js
│       └── admin.controller.js
├── app.js
└── server.js
```

The files inside `src/modules` are intentionally empty scaffolds. They contain no endpoints or business logic yet. Add real routes, controllers, and validation rules as each feature is implemented.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Basic server check |

## Authentication

Authentication uses the Better Auth JWKS endpoint:

```text
${CLIENT_URL}/api/auth/jwks
```

The `verifyToken` middleware:

1. Reads the `Authorization: Bearer <token>` header.
2. Verifies the JWT with `jose`.
3. Looks up the user in the `users` collection.
4. Rejects blocked users.
5. Attaches the user to `req.user`.

Role guards `verifyOwner`, `verifyAdmin`, and `verifyRenter` are available for future protected routes.

## Adding a feature

For a new feature, follow the existing module pattern:

1. Add endpoints in the module's `*.routes.js` file.
2. Add request handlers in the module's `*.controller.js` file.
3. Add validation rules in the module's `*.validation.js` file when needed.
4. Mount the router in `src/app.js`.

Controllers should only return the user fields that are safe to expose.

## Database

The MongoDB database name is `driveEase`. Connection logic lives in `src/config/db.js`.

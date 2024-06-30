# Gamification System Backend

This project is the backend API for a gamification system built with Node.js, Express.js, MongoDB, Redis, TypeScript, Socket.IO, and JWT for secure authentication and authorization.

## Installation

To set up the backend locally, follow these steps:

1. **Install dependencies**:
    ```sh
    npm install
    ```

2. **Create an env file:**

   - Duplicate the `.env.example` file in the project root.
   - Rename the duplicated file to `.env`.
   - Open the `.env` file and set your variables as shown in the example file.

   ```bash
   cp .env.example .env
   ```

   Ensure to fill in the necessary values in the `.env` file for a smooth configuration.


3. **Run the development server**:
    ```sh
    npm run dev
    ```

The backend server will be running at `http://localhost:2024`.

## Features

### Part 1: API Development

#### CRUD Operations

- Implements CRUD operations for points, achievements, and badges using MongoDB with Mongoose.
- Ensures data integrity and strong typing with TypeScript.

#### Real-time Leaderboard Updates

- Utilizes Redis sorted sets and Socket.IO to maintain and update the leaderboard in real-time.
- Socket.IO server emits events to notify the frontend of updates to user points and achievements.

#### Input Validation and Error Handling

- Implements input validation using TypeScript interfaces and validation libraries.
- Handles errors gracefully with appropriate HTTP status codes and error messages.

#### Unit Tests
## ```npm run test```
- Includes unit tests for API endpoints using Jest.
- Tests cover CRUD operations, input validation, error handling, and real-time functionality.



### Part 2: Real-time Updates

#### Socket.IO Integration

- Implements a Socket.IO server to enable real-time updates for leaderboard changes.
- Emits events to connected clients (frontend) when there are updates to user points or achievements.

#### Unit Tests for Real-time Features

- Includes unit tests for Socket.IO integration to ensure correct implementation of real-time updates.
- Tests cover event emissions and handling in real-time scenarios.

### Challenges and UI

- Creates 3 different challenges with a simple UI to test real-time updates.
- Provides endpoints/UI for testing CRUD operations for points, achievements, and badges.

## Security

- **Authentication**: Uses JWT for secure authentication of API requests.
- **Authorization**: Implements role-based access control (RBAC) to restrict endpoints based on user roles.

## Technologies Used

- **Node.js**: JavaScript runtime for building scalable backend applications.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: NoSQL database for storing user data, points, achievements, and leaderboard information.
- **Mongoose**: Elegant MongoDB object modeling for Node.js applications.
- **Redis**: In-memory data structure store used for caching leaderboard data.
- **Socket.IO**: Enables real-time, bidirectional communication between clients and the server.
- **TypeScript**: Typed superset of JavaScript that compiles to plain JavaScript for improved code quality and maintainability.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.

## Thank You


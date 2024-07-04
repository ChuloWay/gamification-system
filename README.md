# Gamification System

This project is a gamification system that includes a RESTful API built with Node.js and Express.js and a frontend built with React. The system manages points, achievements, and badges, and maintains a real-time updating leaderboard.
## Features

### Backend

- CRUD operations for points, achievements, and badges.
- Real-time updating leaderboard using Socket.io.
- Input validation and error handling.
- Unit tests for API endpoints and real-time functionality.

### Frontend

- Simple UI to test the following:
  - SignUp and SignIn
  - CRUD operations for points, achievements, and badges.
  - Real-time updates for challenges.
  - Different challenges with a mini-game quiz.

## Requirements

- Node.js
- Express.js
- MongoDB
- React
- Socket.io
- Jest (for unit testing)
- Prettier (for code formatting)

## Installation

1. Clone the repository from GitHub:
   ```sh
   git clone https://github.com/ChuloWay/gamification-system.git
   ```
2. Navigate to folder:
   ```sh
   cd gamification-system
   ```

## Real-Time Updates

This project uses Socket.io to implement real-time updates for the leaderboard. The server emits events when user points or achievements are updated.

### Setting Up Socket.io

1. Socket.io is set up in the backend to listen for and emit events.
2. The frontend listens for these events to update the leaderboard in real-time.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.

## Thank You


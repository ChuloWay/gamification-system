# Gamification App Frontend

This project is the front-end application for a gamification system built with React, TailwindCSS, and Socket.IO.

## Installation

To set up the frontend locally, follow these steps:

1. **Install dependencies**:
    ```sh
    npm install
    ```

2. **Run the development server**:
    ```sh
    npm start
    ```

The application will be available at `http://localhost:3000`.

## Usage

### Authentication

- **Sign Up**: Users can create an account by providing their name, email, and password.
- **Sign In**: Users can log in to their account using their credentials.
- **JWT Authentication**: Routes are protected using JSON Web Tokens (JWT) for secure user sessions.

### User Profile Page

- Fetches and displays user profile data including points and achievements.
- The profile data is fetched from the Backend API (`localhost:2024/api/v1/user/:id`).

### Leaderboard

- Displays a real-time updating leaderboard of users.
- Receives real-time updates through Socket.IO when user points or achievements are updated.

### Challenges

- Provides a UI for users to engage in different challenges.
- Allows testing of real-time updates for challenges.
- Updates are reflected in real-time in the UI.

### Technologies Used

- **React**: Frontend framework for building user interfaces.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **Socket.IO**: Enables real-time, bidirectional communication between clients and the server.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.

## Thank You


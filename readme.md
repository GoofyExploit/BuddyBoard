# BuddyBoard

A collaborative note-taking application for students. BuddyBoard helps you organize your thoughts, ideas, and collaborative work in one seamless platform.

## Features

- **Note Management** - Create, edit, and organize your notes with ease
- **Collections** - Group related notes into collections for better organization
- **Real-time Collaboration** - Work together with others on notes in real-time
- **User Authentication** - Secure sign up and login system
- **Canvas Drawing** - Draw and sketch directly on your notes
- **Responsive Design** - Access your notes from any device

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

```
bash
# Clone the repository
git clone https://github.com/GoofyExploit/BuddyBoard.git

# Navigate to project directory
cd BuddyBoard

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Configuration

1. Set up your MongoDB connection in `server/config/db.js`
2. Configure JWT secret in `server/config/jwt.js`

### Running

```
bash
# Start server (in server directory)
npm run dev

# Start client (in client directory)
npm run dev
```

Open http://localhost:5173 in your browser.

## Tech Stack

- **Frontend**: React, React Router, CSS Modules
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io

## Project Structure

```
BuddyBoard/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── api/          # API calls
│   │   └── css/          # Styles
│   └── package.json
├── server/          # Node.js backend
│   ├── config/      # Configuration files
│   ├── middleware/  # Express middleware
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   └── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning purposes.

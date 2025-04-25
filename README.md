# Dentist Appointment Application

A full-stack web application for managing dental appointments and checkups between patients and dentists. Built with React, Node.js, Express, and MongoDB.

## Live Demo

- Frontend: [https://dentist-app-blush.vercel.app](https://dentist-app-blush.vercel.app)
- Backend: [https://dentist-app-m1fr.onrender.com](https://dentist-app-m1fr.onrender.com)

## Features

### Patient Features
- User authentication and registration
- View list of available dentists
- Request new dental checkups
- View checkup history and status
- Receive real-time notifications for checkup results
- View detailed checkup results including diagnosis, recommendations, and images

### Dentist Features
- User authentication and registration
- View incoming checkup requests
- Accept/reject checkup requests
- Submit checkup results with diagnosis and recommendations
- Upload and attach images to checkup results
- Real-time notifications for new checkup requests

### Real-time Features
- Socket.io integration for instant notifications
- Real-time status updates
- Live chat between patients and dentists
- Instant checkup result delivery

## Tech Stack

### Frontend
- React.js
- Material-UI
- Socket.io-client
- React Router
- Axios
- React Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.io
- JWT Authentication
- Multer for file uploads

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/dentist-app.git
cd dentist-app
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
Create a `.env` file in the server directory:
```env
PORT=3001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

4. Start the development servers
```bash
# Start the backend server
cd server
npm run dev

# Start the frontend development server
cd ../client
npm start
```

## API Endpoints

All API endpoints are prefixed with the base URL: `https://dentist-app-m1fr.onrender.com`

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login

### Checkups
- POST /api/checkups - Create new checkup request
- GET /api/checkups/patient - Get patient's checkups
- GET /api/checkups/dentist - Get dentist's checkups
- PUT /api/checkups/:id - Update checkup status
- POST /api/checkups/:id/results - Submit checkup results

### Users
- GET /api/users/dentists - Get list of dentists
- GET /api/users/patients - Get list of patients

## Socket Events

### Patient to Dentist
- `new_checkup_request` - Notify dentist of new checkup request

### Dentist to Patient
- `checkup_result_submitted` - Notify patient of checkup results

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/dentist-app](https://github.com/yourusername/dentist-app)

# WebMed - Medical Management System

WebMed is a comprehensive web-based medical management system designed to streamline healthcare operations, patient management, and medical test tracking. The system provides a modern, user-friendly interface for both healthcare providers and patients.

## 🚀 Features

- Patient management and medical records
- Medical test scheduling and tracking
- Real-time data visualization with charts
- Secure authentication and authorization
- Responsive web interface
- Calendar integration for appointments
- Database management and migrations

## 🛠️ Tech Stack

### Frontend
- Vue.js 3
- Vue Router
- Axios for HTTP requests
- V-Calendar for date management
- Modern JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- MySQL Database
- Puppeteer for PDF generation
- Chart.js for data visualization
- CORS enabled for cross-origin requests

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn package manager

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/webmed.git
cd webmed
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up the database:
```bash
# Navigate to backend directory
cd backend

# Run database migrations
node migrations/create_medical_test_tables.js
node migrations/create_visitor_tables.js
```

4. Configure environment variables:
   - Create a `.env` file in the backend directory
   - Add necessary environment variables (database credentials, etc.)

5. Start the development servers:
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm run serve
```

## 📁 Project Structure

```
webmed/
├── frontend/           # Vue.js frontend application
│   ├── public/        # Static files
│   ├── src/          # Source files
│   └── package.json  # Frontend dependencies
├── backend/           # Node.js backend application
│   ├── config/       # Configuration files
│   ├── database/     # Database related files
│   ├── middleware/   # Custom middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── scripts/      # Utility scripts
└── package.json      # Root dependencies
```

## 🔧 Available Scripts

### Frontend
- `npm run serve` - Start development server
- `npm run build` - Build for production

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server


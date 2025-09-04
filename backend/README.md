# SkillShare Backend API

A robust Node.js/Express backend for the SkillShare platform, providing authentication, user management, skill management, and file uploads.

## 🚀 Features

### Phase 1 (Current)
- **User Authentication**: JWT-based auth with email verification
- **User Management**: Profile CRUD operations, role-based access
- **Skill Management**: Skill categories, search, and filtering
- **File Uploads**: Profile image uploads with validation
- **Database**: MongoDB with Mongoose ODM
- **Security**: Rate limiting, input validation, password hashing

### Planned Features
- **Session Management**: Booking, scheduling, and payment
- **Messaging System**: Real-time chat between users
- **Reviews & Ratings**: User feedback system
- **Notifications**: Email and push notifications
- **Analytics**: User engagement and platform metrics

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **File Uploads**: Multer
- **Email**: Nodemailer (configurable)
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/skillshare
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/skillshare

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@skillshare.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 🗄️ Database Models

### User Model
- Authentication (email, password)
- Profile information (name, bio, location)
- Account type (learner/provider)
- Skills and interests
- Verification status

### Skill Model
- Skill information (name, description, category)
- Difficulty levels and prerequisites
- Popularity metrics and trending status
- Visual properties (icon, color)

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify-email/:token` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password/:token` - Password reset
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-avatar` - Upload profile image
- `GET /api/users/:id` - Get public user profile
- `GET /api/users/search/providers` - Search skill providers
- `GET /api/users/skills/:skillId` - Get users by skill
- `PUT /api/users/skills` - Update user skills (providers)
- `PUT /api/users/interests` - Update user interests (learners)
- `DELETE /api/users/account` - Deactivate account

### Skills
- `GET /api/skills` - Get all skills with filters
- `GET /api/skills/categories` - Get skill categories
- `GET /api/skills/trending` - Get trending skills
- `GET /api/skills/popular` - Get popular skills
- `GET /api/skills/search` - Search skills
- `GET /api/skills/:id` - Get skill by ID
- `POST /api/skills` - Create new skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill
- `GET /api/skills/category/:category` - Get skills by category

## 🔒 Authentication & Authorization

### JWT Token
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access
- **Public**: Skills listing, user search, skill search
- **Private**: Profile management, skill management
- **Provider-only**: Skill updates, hourly rate management
- **Learner-only**: Interest management

## 📁 File Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── upload.js            # File upload middleware
├── models/
│   ├── User.js              # User model
│   └── Skill.js             # Skill model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   └── skills.js            # Skill management routes
├── scripts/
│   └── seed.js              # Database seeding
├── utils/
│   └── emailService.js      # Email functionality
├── uploads/                 # File upload directory
├── .env                     # Environment variables
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md                # This file
```

## 🧪 Testing

### Manual Testing
Use tools like Postman or curl to test the API endpoints:

```bash
# Test user signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User",
    "accountType": "learner",
    "country": "United States"
  }'

# Test user login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### Sample Data
The seed script creates sample users and skills for testing:

**Provider Accounts:**
- john.smith@example.com / Password123!
- maria.garcia@example.com / Password123!

**Learner Account:**
- david.chen@example.com / Password123!

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production MongoDB URI
- Set up email service credentials
- Configure CORS for production domain

## 🔧 Development

### Adding New Routes
1. Create route file in `routes/` directory
2. Add route to `server.js`
3. Implement middleware and validation
4. Add to API documentation

### Adding New Models
1. Create model file in `models/` directory
2. Define schema and methods
3. Add validation and indexes
4. Update related models if needed

### Database Migrations
For schema changes, create migration scripts in `scripts/` directory.

## 📚 API Documentation

### Request/Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": {
    // Response data
  },
  "errors": [
    // Validation errors (if any)
  ]
}
```

### Error Handling
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Pagination
List endpoints support pagination:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🤝 Contributing

1. Follow the existing code style
2. Add validation for new endpoints
3. Include error handling
4. Update documentation
5. Test thoroughly

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details
4. Contact the development team

---

**Happy Coding! 🎉**

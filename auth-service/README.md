# SchoolNest Auth Service

A simple, temporary authentication service for SchoolNest frontend integration. This is a dummy API designed to provide login functionality during frontend development.

## Features

- 3 role-based login endpoints (Admin, Teacher, Parent)
- JWT token generation
- CORS enabled
- In-memory user database (dummy data)
- Clean, production-style code structure

## Project Structure

```
auth-service/
├── src/
│   ├── server.js              # Express app setup
│   ├── routes/auth.routes.js  # Route definitions
│   ├── controllers/auth.controller.js  # Business logic
│   └── utils/jwt.js           # JWT utilities
├── package.json
└── README.md
```

## Installation

```bash
cd auth-service
npm install
```

## Running Locally

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start and display both local and network URLs:

- **Local**: `http://localhost:3000`
- **Network**: `http://<your-local-ip>:3000` (share this with your team)

## API Endpoints

### Health Check
```
GET /health
```

### Admin Login
```
POST /auth/admin/login
```

### Teacher Login
```
POST /auth/teacher/login
```

### Parent Login
```
POST /auth/parent/login
```

## Request Format

All login endpoints accept a JSON POST request:

```json
{
  "email": "user@schoolnest.com",
  "password": "password123"
}
```

## Response Format

Success (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ADMIN",
  "user": {
    "id": "ADM001",
    "name": "Admin User"
  }
}
```

Error (401):
```json
{
  "error": "Invalid email or password"
}
```

Error (400):
```json
{
  "error": "Email and password are required"
}
```

## Dummy User Credentials

### Admin
- Email: `admin@schoolnest.com`
- Password: `admin123`
- ID: `ADM001`

### Teachers
- Email: `john@schoolnest.com` | Password: `teacher123` | ID: `TCH001`
- Email: `jane@schoolnest.com` | Password: `teacher123` | ID: `TCH002`

### Parents
- Email: `alice@schoolnest.com` | Password: `parent123` | ID: `PAR001`
- Email: `bob@schoolnest.com` | Password: `parent123` | ID: `PAR002`

## Example Curl Requests

### Admin Login
```bash
curl -X POST http://localhost:3000/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@schoolnest.com",
    "password": "admin123"
  }'
```

### Teacher Login
```bash
curl -X POST http://localhost:3000/auth/teacher/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@schoolnest.com",
    "password": "teacher123"
  }'
```

### Parent Login
```bash
curl -X POST http://localhost:3000/auth/parent/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@schoolnest.com",
    "password": "parent123"
  }'
```

### Health Check
```bash
curl http://localhost:3000/health
```

## JWT Payload

The generated JWT contains:

```json
{
  "userId": "ADM001",
  "role": "ADMIN",
  "schoolId": "SCH1",
  "iat": 1234567890,
  "exp": 1234654290
}
```

- **userId**: User ID from in-memory database
- **role**: User role (ADMIN, TEACHER, PARENT)
- **schoolId**: Dummy school ID (always "SCH1")
- **iat**: Issued at timestamp
- **exp**: Expiration timestamp (7 days from issue)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT signing (default: 'your-secret-key-change-in-production')

Example:
```bash
JWT_SECRET=your-custom-secret PORT=4000 npm start
```

## Notes

- This is a **temporary dummy service** for frontend development only
- **Do not use in production** without proper database integration and security hardening
- User data is stored in-memory and will be lost on server restart
- Passwords are stored in plain text (for demo purposes only)
- Add proper security measures before using with real data

## Next Steps for Production

When ready to transition to a real service:
1. Replace in-memory user list with a database
2. Use bcrypt or similar for password hashing
3. Implement refresh token rotation
4. Add rate limiting
5. Add input validation and sanitization
6. Implement proper error logging
7. Add request logging/monitoring
8. Use environment-based configuration

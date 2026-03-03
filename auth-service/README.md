# SchoolNest Auth Service

A production-ready authentication microservice for SchoolNest. Handles user login with JWT token generation, multi-tenant support (school_id), and PostgreSQL integration.

## Features

✅ **Single Login Endpoint** - Unified `POST /api/v1/auth/login` (works for all roles)
✅ **Database-Backed** - PostgreSQL with roles and users tables
✅ **Secure Passwords** - bcrypt hashing (salt rounds 10)
✅ **Multi-Tenant** - Tenant isolation via `school_id`
✅ **JWT Tokens** - Standard payload format: `{user_id, role, school_id}`
✅ **Clean Architecture** - Controller → Service → Repository → Database
✅ **Production-Ready** - Environment configuration, error handling, graceful shutdown

## Project Structure

```
auth-service/
├── server.js                              # Entry point (bootstrap)
├── src/
│   ├── app.js                             # Express app setup
│   ├── config/
│   │   └── db.js                          # PostgreSQL connection pool
│   ├── controllers/
│   │   └── auth.controller.js             # Request handlers
│   ├── routes/
│   │   └── auth.routes.js                 # Route definitions
│   ├── services/
│   │   └── auth.service.js                # Business logic (bcrypt, JWT)
│   ├── repositories/
│   │   └── auth.repository.js             # Database queries
│   └── utils/
│       └── jwt.js                         # JWT utilities
├── schema.sql                             # PostgreSQL schema
├── seed.js                                # Database seeder
├── .env.example                           # Environment template
├── package.json
└── README.md
```

## Installation

```bash
cd auth-service
npm install
```

## Setup

### 1. Database Setup

Create PostgreSQL database:
```bash
createdb auth_db
```

Run schema:
```bash
psql auth_db < schema.sql
```

### 2. Environment Configuration

Copy and configure `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=auth_db
JWT_SECRET=your_super_secret_key_here_change_in_production
```

### 3. Seed Initial Data

```bash
npm run seed
```

This inserts 5 test users under `school_id=101`:
- **1 Admin**: admin@schoolnest.com / Admin@123
- **2 Teachers**: john@schoolnest.com / Teacher@123, jane@schoolnest.com / Teacher@123
- **2 Parents**: alice@schoolnest.com / Parent@123, bob@schoolnest.com / Parent@123

## Running

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

Server displays connection info:
```
🚀 SchoolNest Auth Service is running!

Local:   http://localhost:3000
Network: http://192.168.1.100:3000

Health check: http://192.168.1.100:3000/health
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{"status": "ok", "service": "auth-service"}
```

### Login
```
POST /api/v1/auth/login
```

Request:
```json
{
  "email": "john@schoolnest.com",
  "password": "Teacher@123"
}
```

Success Response (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "TCH001",
    "role": "TEACHER",
    "school_id": 101
  }
}
```

Error Response (401):
```json
{
  "message": "Invalid email or password"
}
```

Error Response (400):
```json
{
  "message": "Email and password are required"
}
```

## JWT Payload

The generated JWT contains (decoded):
```json
{
  "user_id": "TCH001",
  "role": "TEACHER",
  "school_id": 101,
  "iat": 1234567890,
  "exp": 1234654290
}
```

- **user_id**: User ID from database
- **role**: User role (ADMIN, TEACHER, PARENT)
- **school_id**: Tenant school ID (integer)
- **iat**: Issued at timestamp
- **exp**: Expiration timestamp (7 days from issue)

## Example Requests

### Login as Teacher
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@schoolnest.com",
    "password": "Teacher@123"
  }'
```

### Health Check
```bash
curl http://localhost:3000/health
```

## Architecture

### Controller Layer (`auth.controller.js`)
- Parses HTTP request
- Validates input (email, password present)
- Calls service layer
- Returns formatted HTTP response
- Propagates errors via `next(error)`

### Service Layer (`auth.service.js`)
- Fetches user from repository
- Validates password using `bcrypt.compare()`
- Generates JWT with snake_case payload
- Returns token + user details
- Throws errors with statusCode

### Repository Layer (`auth.repository.js`)
- Single responsibility: database queries
- Joins `users` with `roles` table
- Returns user object with role name

### Database
- **roles** table: id, name (ADMIN, TEACHER, PARENT)
- **users** table: id, school_id, role_id, name, email, password_hash, created_at
- Indexes on email (for login speed) and school_id (for tenant queries)

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | 3000 | Server port |
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_USER` | postgres | PostgreSQL user |
| `DB_PASSWORD` | - | PostgreSQL password (required) |
| `DB_NAME` | auth_db | Database name |
| `JWT_SECRET` | warn + fallback | Secret for signing JWTs (must set in production) |

## Multi-Tenant Isolation

Users belong to a `school_id`. The JWT contains the school_id, allowing downstream services (like academic-service) to enforce tenant isolation on every request by checking the JWT's `school_id` claim.

## Security Notes

- ✅ Passwords hashed with bcrypt (salt rounds 10)
- ✅ Email uniqueness enforced at database level
- ✅ No user enumeration (same 401 for not-found + wrong-password)
- ✅ Graceful shutdown (closes DB pool on SIGTERM/SIGINT)
- ⚠️ **Must set `JWT_SECRET` in production** (check logs for warning)
- ⚠️ **HTTPS recommended for production**
- ⚠️ **Add rate limiting before exposing to internet**

## Testing

### Unit Test (example)
```javascript
// Test login endpoint
POST /api/v1/auth/login
Body: {"email":"john@schoolnest.com","password":"Teacher@123"}
Expected: 200 with token
```

## Troubleshooting

### "PostgreSQL pool error: connect ECONNREFUSED"
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify DB credentials in `.env`

### "JWT token decode fails in academic-service"
- Ensure auth-service uses snake_case payload: `user_id`, `school_id` (not `userId`, `schoolId`)
- Verify JWT_SECRET matches across services

### "Database connection timeout"
- Increase `connectionTimeoutMillis` in `src/config/db.js`
- Check PostgreSQL max connections: `SELECT max_conn_cur() FROM pg_settings;`

## Future Enhancements

- [ ] Add refresh token rotation
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add request logging/monitoring
- [ ] Implement OAuth2 / SAML for SSO
- [ ] Add email verification
- [ ] Add password reset flow
- [ ] Implement API key authentication for service-to-service
- [ ] Add audit logging

## License

MIT

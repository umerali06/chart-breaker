# Chart Breaker EHR/RCM Platform - Phase 1

A modern home-health electronic health record (EHR) and revenue cycle management (RCM) system designed to handle core clinical workflows and financial operations for home-health agencies.

## Phase 1 Features (MVP EHR)

- **Patient & Episode Management**: Complete patient demographics, referrals, and episode tracking
- **Assessments & Documentation**: OASIS-E forms with validation and electronic signatures
- **Scheduling & Field Operations**: Staff scheduling and EVV integration hooks
- **Billing & RCM**: Basic claim generation and payer management
- **QA & Compliance**: Quality assurance workflows and audit trails
- **Reporting**: Dashboard analytics and export capabilities

## Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Prisma ORM
- **JWT** authentication with RBAC
- **Redis** for job queues
- **AWS S3** for document storage

### Frontend
- **React** with TypeScript
- **Material-UI** for components
- **React Router** for navigation
- **Axios** for API calls

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd chart-breaker
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb chart_breaker_ehr

# Set up environment variables
cp env.example .env
# Edit .env with your database credentials and other settings
```

### 4. Database Migration & Seeding
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run db:seed
```

### 5. Start the application
```bash
# Start both server and client in development mode
npm run dev

# Or start them separately:
# Terminal 1 - Backend server (port 5000)
npm run server

# Terminal 2 - Frontend client (port 3000)
cd client && npm start
```

## Default Login Credentials

After seeding the database, you can use these credentials to log in:

- **Admin**: admin@chartbreaker.com / admin123
- **Intake Staff**: intake@chartbreaker.com / intake123
- **Clinician**: nurse@chartbreaker.com / clinician123
- **QA Reviewer**: qa@chartbreaker.com / qa123
- **Biller**: biller@chartbreaker.com / biller123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - User logout

### Patients
- `GET /api/patients` - Get all patients (with pagination and filtering)
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Episodes
- `GET /api/episodes` - Get all episodes
- `GET /api/episodes/:id` - Get episode details
- `POST /api/episodes` - Create new episode
- `PUT /api/episodes/:id` - Update episode
- `PATCH /api/episodes/:id/discharge` - Discharge episode

### Assessments
- `GET /api/assessments/oasis` - Get OASIS assessments
- `POST /api/assessments/oasis` - Create OASIS assessment
- `PATCH /api/assessments/oasis/:id/sign` - Sign assessment

### Visits
- `GET /api/visits` - Get visit notes
- `POST /api/visits` - Create visit note
- `PATCH /api/visits/:id/sign` - Sign visit note

### Scheduling
- `GET /api/schedules` - Get schedules
- `POST /api/schedules` - Create schedule
- `PATCH /api/schedules/:id/status` - Update schedule status

### Billing
- `GET /api/billing/payers` - Get payers
- `GET /api/billing/claims` - Get claims
- `POST /api/billing/claims` - Create claim

### QA & Compliance
- `GET /api/qa/reviews` - Get QA reviews
- `POST /api/qa/reviews` - Create QA review

### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/productivity` - Get productivity report

## Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **Users & Staff**: User management with role-based access control
- **Patients**: Patient demographics and contact information
- **Episodes**: Care episodes with disciplines and goals
- **Assessments**: OASIS-E assessments with form data
- **Visits**: Discipline-specific visit notes
- **Schedules**: Staff scheduling and EVV events
- **Billing**: Payers, claims, and remittances
- **QA**: Quality assurance reviews and audit logs

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- CORS configuration
- Input validation with Joi
- Audit logging for all data changes

## Development

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
cd client && npm test
```

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate new migration
npx prisma migrate dev --name migration_name
```

### Code Quality
```bash
# Lint backend code
npm run lint

# Lint frontend code
cd client && npm run lint
```

## Deployment

### Environment Variables
Ensure the following environment variables are set:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chart_breaker_ehr"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# Server Configuration
PORT=5000
NODE_ENV="production"

# Client URL for CORS
CLIENT_URL="https://your-domain.com"

# AWS Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="chart-breaker-documents"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
```

### Production Build
```bash
# Build frontend
cd client && npm run build

# Start production server
npm start
```

## Future Phases

- **Phase 2**: AI-Assisted Charting ("Clinician Copilot")
- **Phase 3**: Billing Oversight + AI ("Billing Sentinel")
- **Phase 4**: Per-Patient Chatbot ("Chart Chat")
- **Phase 5**: Volunteer Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
